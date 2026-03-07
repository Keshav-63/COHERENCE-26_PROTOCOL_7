"""
Gemini AI Narrative Generator for Fund Flow Intelligence
Generates human-readable explanations of money movement patterns.
"""

import logging
import os
from typing import Any, Dict

logger = logging.getLogger(__name__)

_gemini_client = None


def _get_model():
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client
    try:
        from google import genai
        from app.core.config import settings
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        _gemini_client = genai.Client(api_key=api_key)
        return _gemini_client
    except Exception as e:
        logger.warning(f"Gemini not available: {e}")
        return None


async def _ask_gemini(prompt: str, fallback: str) -> str:
    client = _get_model()
    if not client:
        return fallback
    try:
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        return response.text.strip()
    except Exception as e:
        logger.warning(f"Gemini call failed: {e}")
        return fallback


# ── 1. Path Narrative ──────────────────────────────────────────────────────────

async def narrate_fund_path(path_data: Dict[str, Any]) -> str:
    """
    Given a traced fund path, generate a clear narrative of the money's journey.
    """
    if not path_data.get("paths"):
        return "No fund flow path exists between the selected entities."

    best = path_data["paths"][0]
    hops = best.get("hops", [])
    total_cr = best.get("total_value_cr", 0)

    hop_text = " → ".join(
        f"{h['from_node_name']} ({h['from_node_type']})" for h in hops
    )
    if hops:
        hop_text += f" → {hops[-1]['to_node_name']} ({hops[-1]['to_node_type']})"

    prompt = f"""You are a financial intelligence analyst for the Indian government's PRAHARI system.
Explain in 3-4 clear, professional sentences how public funds flow along this path:

Path: {hop_text}
Total value: ₹{total_cr} Crore
Number of hops: {len(hops)}

Hop details:
{chr(10).join(f"  - {h['from_node_name']} → {h['to_node_name']}: ₹{h['actual_cr']} Cr ({h['edge_type'].replace('_', ' ')})" for h in hops)}

Focus on: Why this path exists, what each transfer step means (budget release, scheme disbursement, contract payment), and any efficiency observations based on the amounts.
Keep it factual, government-focused, under 150 words."""

    fallback = (
        f"Funds flow from {hops[0]['from_node_name']} through {len(hops)} administrative levels, "
        f"totaling ₹{total_cr} Crore before reaching the terminal beneficiary. "
        f"Each hop represents a formal budget release or contractual payment in the Indian public finance system."
    ) if hops else "Fund path data insufficient for narrative generation."

    return await _ask_gemini(prompt, fallback)


# ── 2. Bottleneck Explanation ──────────────────────────────────────────────────

async def explain_bottlenecks(bottleneck_data: Dict[str, Any]) -> str:
    """
    Generate an executive summary of fund stagnation bottlenecks.
    """
    bottlenecks = bottleneck_data.get("bottlenecks", [])
    if not bottlenecks:
        return "No significant fund flow bottlenecks detected. Budget utilization appears on track."

    top3 = bottlenecks[:3]
    total_stagnant = bottleneck_data.get("total_stagnant_funds_cr", 0)

    top3_text = "\n".join(
        f"  - {b['node_name']} ({b['node_type']}): ₹{b['unspent_cr']} Cr unspent, "
        f"{b['absorption_rate']}% utilized, risk: {b['risk_tier']}"
        for b in top3
    )

    prompt = f"""You are a senior auditor in India's PRAHARI Budget Intelligence System.
Write a 3-4 sentence executive briefing about these fund flow bottlenecks:

Total stagnant funds: ₹{total_stagnant} Crore
Total bottleneck nodes: {bottleneck_data.get('total_bottlenecks', 0)}
Critical nodes: {bottleneck_data.get('critical_count', 0)}

Top bottlenecks:
{top3_text}

Explain: Why these entities might be under-utilizing funds, what systemic risks this creates (fund lapse, year-end rush, ghost spending), and a one-line recommendation. Keep it under 120 words."""

    fallback = (
        f"PRAHARI has detected ₹{total_stagnant} Crore in stagnant funds across "
        f"{bottleneck_data.get('total_bottlenecks', 0)} entities. "
        f"The top bottleneck — {top3[0]['node_name']} with ₹{top3[0]['unspent_cr']} Cr unspent — "
        f"poses a significant fund lapse risk. Immediate intervention recommended."
    )
    return await _ask_gemini(prompt, fallback)


# ── 3. Vendor Trail Explanation ────────────────────────────────────────────────

async def explain_vendor_trail(trail_data: Dict[str, Any]) -> str:
    """
    Explain a vendor's complete money trail from source ministry to payment.
    """
    vendor = trail_data.get("vendor", {})
    trails = trail_data.get("money_trails", [])
    total_received = trail_data.get("total_received_cr", 0)

    if not trails:
        return (
            f"Vendor {vendor.get('node_name', 'Unknown')} received ₹{total_received} Crore "
            f"but the complete upstream fund trail could not be reconstructed. "
            f"This may indicate a direct contract payment without a linked scheme."
        )

    trail_text = "\n".join(
        f"  Trail {i+1}: " + " → ".join(
            f"{h['from']} ({h['from_type']})" for h in t["hops"]
        ) + f" → {t['hops'][-1]['to']} | ₹{t['total_cr']:.2f} Cr"
        for i, t in enumerate(trails[:2])
    )

    prompt = f"""You are a government audit intelligence analyst for PRAHARI.
Explain in 3-4 sentences the public fund trail for this vendor:

Vendor: {vendor.get('node_name', 'Unknown')}
Total received: ₹{total_received} Crore
Risk tier: {vendor.get('risk_tier', 'N/A')}

Money trails:
{trail_text}

Focus on: Origin of funds (which ministry/scheme), how many administrative levels the money passed through, and any accountability observations. Under 100 words."""

    fallback = (
        f"Vendor {vendor.get('node_name', 'Unknown')} received ₹{total_received} Crore "
        f"that originated from {trails[0]['hops'][0]['from'] if trails and trails[0]['hops'] else 'Central Government'}, "
        f"passing through {len(trails[0]['hops'])} administrative levels."
    )
    return await _ask_gemini(prompt, fallback)


# ── 4. State Flow Narrative ────────────────────────────────────────────────────

async def narrate_state_flow(state_code: str, state_data: Dict[str, Any]) -> str:
    """
    Generate an executive briefing on fund flow through a specific state.
    """
    state_node = state_data.get("state_node", {})
    stats = state_data.get("stats", {})
    node_count = stats.get("total_nodes", 0)
    edge_count = stats.get("total_edges", 0)
    allocated = state_node.get("total_allocated_cr", 0)
    spent = state_node.get("total_spent_cr", 0)
    absorption = state_node.get("absorption_rate", 0)
    risk = state_node.get("risk_tier", "GREEN")

    prompt = f"""You are a PRAHARI budget intelligence analyst.
Write a 3-sentence briefing on public fund flow for state: {state_node.get('node_name', state_code)}

Funds allocated: ₹{allocated} Crore
Funds spent: ₹{spent} Crore
Absorption rate: {absorption}%
Risk tier: {risk}
Connected entities (departments, schemes, vendors) in this sub-graph: {node_count} nodes, {edge_count} fund flow connections

Address: Current absorption performance, whether the fund flow network is dense or sparse, and the key risk. Under 100 words."""

    fallback = (
        f"{state_node.get('node_name', state_code)} has received ₹{allocated} Crore, "
        f"spending ₹{spent} Crore ({absorption}% utilization). "
        f"The fund flow graph shows {node_count} connected entities across {edge_count} financial links. "
        f"Risk level: {risk}."
    )
    return await _ask_gemini(prompt, fallback)


# ── 5. Overall Flow Intelligence Report ───────────────────────────────────────

async def generate_flow_intelligence_report(summary: Dict[str, Any]) -> str:
    """
    Generate a 5-sentence executive intelligence report on national fund flow.
    """
    fin = summary.get("financial_summary", {})
    risk = summary.get("risk_distribution", {})
    top_ministries = summary.get("top_ministries_by_allocation", [])

    top_m_text = ", ".join(
        f"{m['name']} (₹{m['allocated_cr']:.0f} Cr, {m['absorption_rate']:.1f}% absorbed)"
        for m in top_ministries[:3]
    )

    prompt = f"""You are the Chief Intelligence Officer of PRAHARI, India's National Budget Flow Intelligence System.
Write a 4-5 sentence executive intelligence report on national fund flow for FY {summary.get('fiscal_year', '2025-26')}:

Total central allocation: ₹{fin.get('total_central_allocation_cr', 0)} Crore
Total actual expenditure: ₹{fin.get('total_actual_expenditure_cr', 0)} Crore
Overall absorption: {fin.get('overall_absorption_pct', 0)}%
Unspent funds (lapse risk): ₹{fin.get('unspent_central_cr', 0)} Crore
Vendor payments tracked: ₹{fin.get('total_vendor_payments_cr', 0)} Crore

Risk distribution: {risk.get('GREEN', 0)} GREEN, {risk.get('YELLOW', 0)} YELLOW, {risk.get('ORANGE', 0)} ORANGE, {risk.get('RED', 0)} RED nodes

Top ministries: {top_m_text}

Make it sound like an intelligence briefing: use terms like "PRAHARI analysis reveals...", highlight any concern areas, and end with a recommended action. Under 200 words."""

    fallback = (
        f"PRAHARI Fund Flow Intelligence Report — FY {summary.get('fiscal_year', '2025-26')}: "
        f"National budget allocation stands at ₹{fin.get('total_central_allocation_cr', 0)} Crore "
        f"with ₹{fin.get('total_actual_expenditure_cr', 0)} Crore (overall {fin.get('overall_absorption_pct', 0)}%) actually spent. "
        f"₹{fin.get('unspent_central_cr', 0)} Crore remains at risk of lapse. "
        f"The knowledge graph spans {summary.get('graph_stats', {}).get('total_nodes', 0)} fund entities "
        f"with {risk.get('RED', 0) + risk.get('ORANGE', 0)} entities flagged RED/ORANGE risk."
    )
    return await _ask_gemini(prompt, fallback)
