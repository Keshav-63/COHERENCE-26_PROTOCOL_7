"""
Citizen Chatbot Service with Gemini 2.5 Flash
Location-aware chatbot for public financial data queries
"""

import logging
import os
from typing import Optional, Dict, List
from datetime import datetime
import math

logger = logging.getLogger(__name__)

# Lazy-load genai
_genai_client = None
GEMINI_MODEL = "gemini-2.5-flash"


def _get_gemini_model():
    """Lazy initialize Gemini client."""
    global _genai_client
    if _genai_client is not None:
        return _genai_client

    try:
        from app.core.config import settings
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    except Exception:
        api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        logger.warning("GEMINI_API_KEY not set — Chatbot will be disabled.")
        return None

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        _genai_client = client
        logger.info(f"Gemini client initialized for chatbot with model '{GEMINI_MODEL}'.")
        return _genai_client
    except Exception as e:
        logger.error(f"Failed to initialize Gemini for chatbot: {e}")
        return None


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points using Haversine formula
    Returns distance in kilometers
    """
    R = 6371  # Earth's radius in kilometers

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))

    return R * c


async def get_location_context(latitude: float, longitude: float) -> Dict:
    """
    Get location context based on lat/long
    Returns nearby location, district, state info
    """
    # Default location info to return if anything fails
    location_info = {
        "latitude": latitude,
        "longitude": longitude,
        "nearest_location": None,
        "district": None,
        "state": None,
        "nearby_projects": []
    }

    try:
        from app.budget.models.location import Location, District, State

        # Find nearest location within 50km radius
        nearby_locations = await Location.find(
            {
                "geo_location": {
                    "$near": {
                        "$geometry": {"type": "Point", "coordinates": [longitude, latitude]},
                        "$maxDistance": 50000  # 50km in meters
                    }
                }
            }
        ).limit(5).to_list()

        if nearby_locations:
            nearest = nearby_locations[0]
            location_info["nearest_location"] = {
                "name": nearest.location_name,
                "type": nearest.location_type,
                "distance_km": calculate_distance(latitude, longitude, nearest.latitude, nearest.longitude)
            }

            # Get district info
            district = await District.find_one({"district_code": nearest.district_code})
            if district:
                location_info["district"] = {
                    "name": district.district_name,
                    "code": district.district_code,
                    "population": district.population,
                    "area_sq_km": district.area_sq_km
                }

            # Get state info
            state = await State.find_one({"state_code": nearest.state_code})
            if state:
                location_info["state"] = {
                    "name": state.state_name,
                    "code": state.state_code,
                    "capital": state.capital_city,
                    "population": state.population
                }

            location_info["nearby_projects"] = [
                {
                    "name": loc.location_name,
                    "type": loc.location_type,
                    "schemes": loc.related_schemes[:3] if loc.related_schemes else []
                }
                for loc in nearby_locations[:5]
            ]

    except Exception as e:
        logger.warning(f"Error getting location context for ({latitude}, {longitude}): {e}")
        # Return default location_info with coordinates

    return location_info


async def get_budget_data_for_location(location_context: Dict) -> Dict:
    """
    Get budget allocation and expenditure data for the user's location
    """
    try:
        from app.budget.models.allocation import BudgetAllocation, Expenditure

        if not location_context or not location_context.get("state"):
            return {"message": "Location not identified"}

        state_code = location_context["state"]["code"]
        district_code = location_context.get("district", {}).get("code")

        # Get state-level budget allocations
        state_allocations = await BudgetAllocation.find(
            {"state_code": state_code, "fiscal_year": "2024-25"}
        ).limit(10).to_list()

        # Get district-level expenditures if available
        district_expenditures = []
        if district_code:
            district_expenditures = await Expenditure.find(
                {"state_code": state_code, "fiscal_year": "2024-25"}
            ).limit(10).to_list()

        total_budget = sum([alloc.budget_estimate for alloc in state_allocations])
        total_expenditure = sum([exp.cumulative_expenditure for exp in district_expenditures])

        return {
            "state": location_context["state"]["name"],
            "district": location_context.get("district", {}).get("name"),
            "total_budget_cr": round(total_budget, 2),
            "total_expenditure_cr": round(total_expenditure, 2),
            "utilization_pct": round((total_expenditure / total_budget * 100), 2) if total_budget > 0 else 0,
            "top_schemes": [
                {
                    "name": alloc.scheme_name or alloc.entity_name,
                    "budget_cr": alloc.budget_estimate,
                    "ministry": alloc.ministry_name
                }
                for alloc in state_allocations[:5]
            ]
        }
    except Exception as e:
        logger.warning(f"Error getting budget data: {e}")
        return {"message": "Budget data unavailable"}


async def get_vendor_contractors_for_location(location_context: Dict) -> List[Dict]:
    """
    Get vendor and contractor information for the user's location
    """
    try:
        from app.budget.models.vendor import Vendor, Contract

        if not location_context or not location_context.get("state"):
            return []

        state_code = location_context["state"]["code"]

        # Get vendors operating in this state
        vendors = await Vendor.find(
            {"state_code": state_code, "vendor_status": "active"}
        ).limit(10).to_list()

        # Get contracts in this area
        contracts = await Contract.find(
            {"operation_state_code": state_code, "contract_status": {"$in": ["in_progress", "awarded"]}}
        ).limit(10).to_list()

        vendor_data = []
        for vendor in vendors[:5]:
            vendor_contracts = [c for c in contracts if c.vendor_code == vendor.vendor_code]
            vendor_data.append({
                "vendor_name": vendor.vendor_name,
                "vendor_code": vendor.vendor_code,
                "vendor_type": vendor.vendor_type,
                "total_contracts": vendor.total_contracts_awarded,
                "total_value_cr": vendor.total_contract_value,
                "performance_rating": vendor.performance_rating,
                "is_msme": vendor.is_msme,
                "active_contracts": len(vendor_contracts)
            })

        return vendor_data
    except Exception as e:
        logger.warning(f"Error getting vendor data: {e}")
        return []


async def build_system_prompt(location_context: Dict, budget_data: Dict, vendor_data: List[Dict], user_query: str) -> str:
    """
    Build comprehensive system prompt for Gemini with location and data context
    """
    # Handle None location_context
    if location_context is None:
        location_context = {
            "latitude": 0.0,
            "longitude": 0.0,
            "nearest_location": None,
            "district": None,
            "state": None,
            "nearby_projects": []
        }

    location_name = "Unknown Location"
    if location_context.get("nearest_location"):
        location_name = location_context["nearest_location"]["name"]
    if location_context.get("district"):
        location_name = f"{location_name}, {location_context['district']['name']}"
    if location_context.get("state"):
        location_name = f"{location_name}, {location_context['state']['name']}"

    # Extra safety: ensure location_context is a dict before using it
    lat = location_context.get('latitude', 0.0) if isinstance(location_context, dict) else 0.0
    lon = location_context.get('longitude', 0.0) if isinstance(location_context, dict) else 0.0
    district_name = (location_context.get('district') or {}).get('name', 'N/A') if isinstance(location_context, dict) else 'N/A'
    state_name = (location_context.get('state') or {}).get('name', 'N/A') if isinstance(location_context, dict) else 'N/A'
    state_pop = (location_context.get('state') or {}).get('population', 'N/A') if isinstance(location_context, dict) else 'N/A'

    prompt = f"""You are GovGenie, an AI-powered public finance assistant for Indian citizens. Your purpose is to help citizens understand how public money is being allocated and spent in their area with complete transparency.

═══════════════════════════════════════════════════════════════════
CITIZEN'S LOCATION CONTEXT
═══════════════════════════════════════════════════════════════════
📍 Location: {location_name}
🗺️  Coordinates: {lat}, {lon}
🏘️  District: {district_name}
🏛️  State: {state_name}
👥 State Population: {state_pop if isinstance(state_pop, int) else 'N/A'}"""

    if isinstance(location_context, dict) and location_context.get("district"):
        dist_pop = location_context['district'].get('population', 'N/A')
        if isinstance(dist_pop, int):
            prompt += f"\n👥 District Population: {dist_pop:,}"

    # Handle None budget_data
    if budget_data is None:
        budget_data = {}

    if budget_data.get("total_budget_cr"):
        prompt += f"""

═══════════════════════════════════════════════════════════════════
BUDGET ALLOCATION DATA (FY 2024-25)
═══════════════════════════════════════════════════════════════════
💰 Total State Budget: ₹{budget_data['total_budget_cr']:,.2f} Crore
💸 Total Expenditure: ₹{budget_data['total_expenditure_cr']:,.2f} Crore
📊 Utilization Rate: {budget_data['utilization_pct']:.1f}%
💵 Remaining Budget: ₹{budget_data['total_budget_cr'] - budget_data['total_expenditure_cr']:,.2f} Crore

TOP GOVERNMENT SCHEMES IN YOUR AREA:"""
        for i, scheme in enumerate(budget_data.get("top_schemes", [])[:5], 1):
            prompt += f"\n{i}. {scheme['name']}"
            prompt += f"\n   • Budget: ₹{scheme['budget_cr']:,.2f} Crore"
            prompt += f"\n   • Ministry: {scheme['ministry']}"

    # Handle None vendor_data
    if vendor_data is None:
        vendor_data = []

    if vendor_data:
        prompt += f"""

═══════════════════════════════════════════════════════════════════
ACTIVE CONTRACTORS & VENDORS IN YOUR AREA
═══════════════════════════════════════════════════════════════════"""
        for i, vendor in enumerate(vendor_data[:5], 1):
            prompt += f"\n{i}. {vendor['vendor_name']} ({vendor['vendor_type']})"
            prompt += f"\n   • Total Contracts Awarded: {vendor['total_contracts']}"
            prompt += f"\n   • Total Contract Value: ₹{vendor['total_value_cr']:,.2f} Crore"
            prompt += f"\n   • Active Contracts: {vendor['active_contracts']}"
            if vendor.get('performance_rating'):
                prompt += f"\n   • Performance Rating: {vendor['performance_rating']}/5.0 ⭐"
            if vendor.get('is_msme'):
                prompt += f"\n   • MSME Registered: Yes ✓"

    if isinstance(location_context, dict) and location_context.get("nearby_projects"):
        prompt += f"""

═══════════════════════════════════════════════════════════════════
NEARBY PUBLIC PROJECTS
═══════════════════════════════════════════════════════════════════"""
        for project in location_context["nearby_projects"][:3]:
            prompt += f"\n• {project['name']} ({project['type']})"
            if project.get('schemes'):
                prompt += f"\n  Schemes: {', '.join(project['schemes'][:2])}"

    prompt += f"""

═══════════════════════════════════════════════════════════════════
YOUR ROLE & CAPABILITIES
═══════════════════════════════════════════════════════════════════
You are the citizen's trusted guide to public finance transparency. You can:

1. 💡 EXPLAIN budget allocations, utilization, and government spending
2. 🔍 PROVIDE detailed information about contractors, vendors, and their performance
3. 📋 CLARIFY which schemes are active in the area and their implementation status
4. 🌐 SEARCH the web for current information about:
   - Recent government announcements, press releases, circulars
   - Public project updates, tender notices, work orders
   - Contractor performance, quality audits, blacklist status
   - CAG audit reports, PAC observations, RTI disclosures
   - Budget documents, economic surveys, expenditure reports
5. 🎯 GUIDE citizens on how to access more information (RTI, portals, grievance mechanisms)
6. ⚖️ IDENTIFY potential issues (low utilization, delayed projects, contractor issues)

═══════════════════════════════════════════════════════════════════
RESPONSE GUIDELINES
═══════════════════════════════════════════════════════════════════
✓ Answer in clear, citizen-friendly language (avoid bureaucratic jargon)
✓ Use ₹ Crore for large amounts, ₹ Lakh for medium amounts
✓ Provide specific numbers from the data above when available
✓ Explain technical terms (BE = Budget Estimate, RE = Revised Estimate, etc.)
✓ Reference Indian public finance laws/acts when relevant:
  - FRBM Act (Fiscal Responsibility), RTI Act (Right to Information)
  - GFR (General Financial Rules), PFMS (Public Financial Management System)
  - CAG (Comptroller & Auditor General), PAC (Public Accounts Committee)
✓ If data is unavailable, guide citizens on how to obtain it:
  - File RTI application (format, fee, timeline)
  - Visit official portals (PFMS, IndiaSpends, Budget.gov.in)
  - Contact District Information Officer (DIO) or nodal departments
✓ Be objective and fact-based when discussing contractors/vendors
✓ Suggest actionable next steps when citizens express concerns
✓ Always cite specific data sources when making claims

IMPORTANT WEB SEARCH GUIDANCE:
- When user asks about current/recent information, USE WEB SEARCH
- When user asks about specific contractors/vendors, SEARCH for their recent news
- When user asks about scheme updates, SEARCH for latest announcements
- Always cite the sources you find online

═══════════════════════════════════════════════════════════════════
CITIZEN'S QUESTION
═══════════════════════════════════════════════════════════════════
{user_query}

Now provide a comprehensive, accurate, and helpful answer based on the above context and data."""

    return prompt


async def ask_govgenie(query: str, latitude: float, longitude: float) -> Dict:
    """
    Main chatbot function - ask a question and get an answer

    Args:
        query: User's question
        latitude: User's latitude
        longitude: User's longitude

    Returns:
        Dict with answer, location_context, budget_summary, sources
    """
    client = _get_gemini_model()
    if client is None:
        return {
            "answer": "GovGenie chatbot is currently unavailable. Please ensure GEMINI_API_KEY is configured.",
            "error": True
        }

    try:
        logger.info(f"Processing query at location ({latitude}, {longitude}): {query[:100]}...")

        # Step 1: Get location context
        location_context = await get_location_context(latitude, longitude)

        # Step 2: Get budget data for location
        budget_data = await get_budget_data_for_location(location_context)

        # Step 3: Get vendor/contractor data
        vendor_data = await get_vendor_contractors_for_location(location_context)

        # Step 4: Build comprehensive system prompt with all context
        full_prompt = await build_system_prompt(location_context, budget_data, vendor_data, query)

        # Step 5: Call Gemini API
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=full_prompt
        )

        answer = response.text.strip()

        # Build location string
        location_str = "Unknown Location"
        if isinstance(location_context, dict):
            if location_context.get("nearest_location"):
                location_str = f"{location_context['nearest_location']['name']}"
                if location_context.get("district"):
                    location_str += f", {location_context['district']['name']}"
                if location_context.get("state"):
                    location_str += f", {location_context['state']['name']}"

        logger.info(f"Successfully generated response for location: {location_str}")

        return {
            "answer": answer,
            "location_context": location_str,
            "budget_summary": budget_data if isinstance(budget_data, dict) and budget_data.get("total_budget_cr") else None,
            "sources": ["Government Budget Database", "Public Contracts Registry", "Location Geospatial Data"],
            "model": GEMINI_MODEL,
            "error": False
        }

    except Exception as e:
        logger.error(f"Error generating chatbot response: {e}", exc_info=True)
        return {
            "answer": "I encountered an error while processing your request. Please try again or rephrase your question.",
            "error": True,
            "error_details": str(e)
        }
