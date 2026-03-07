"""
Gemini AI Intelligence Service — PRAHARI
Powers all natural language analysis, audit narratives, and risk summaries.

Uses google-generativeai (Gemini 2.0 Flash) for:
  1. Transaction anomaly narrative generation
  2. Department risk profile summaries
  3. Executive dashboard intelligence briefings
  4. Reallocation rationale generation
  5. Vendor risk explanations
  6. Fund lapse early warning reports
"""

import logging
import os
from typing import Optional, Dict, List

logger = logging.getLogger(__name__)

# We lazy-load genai to avoid crashing if the key isn't set
_genai_client = None
_gemini_model = None

GEMINI_MODEL = "gemini-2.5-flash"


def _get_gemini_model():
    """Lazy initialize Gemini client."""
    global _genai_client, _gemini_model
    if _gemini_model is not None:
        return _gemini_model

    # Prefer settings object, fall back to raw env var
    try:
        from app.core.config import settings
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    except Exception:
        api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        logger.warning("GEMINI_API_KEY not set — AI narratives will be disabled.")
        return None

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        _gemini_model = client
        logger.info(f"Gemini client initialized for model '{GEMINI_MODEL}'.")
        return _gemini_model
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return None


async def _call_gemini(prompt: str, max_chars: int = 800) -> Optional[str]:
    """Single call to Gemini with safety fallback."""
    client = _get_gemini_model()
    if client is None:
        return None
    try:
        response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        text = response.text.strip()
        return text[:max_chars] if len(text) > max_chars else text
    except Exception as e:
        logger.warning(f"Gemini call failed: {e}")
        return None


# ── PUBLIC FUNCTIONS ───────────────────────────────────────────────────────────

async def analyze_transaction_anomaly(
    tx: dict,
    audit_result: dict,
) -> Dict[str, str]:
    """
    Generate Gemini AI narrative for a flagged transaction.
    Returns: narrative, recommendation, severity_context
    """
    flags = audit_result.get("anomaly_flags", [])
    if not flags or audit_result.get("status") == "SAFE":
        return {
            "narrative": "No anomalies detected. Transaction follows expected patterns.",
            "recommendation": "No action required.",
            "severity_context": "SAFE",
        }

    prompt = f"""You are PRAHARI, India's AI-powered public finance watchdog.
Analyze this flagged government transaction and provide a concise investigative brief.

TRANSACTION:
- Department: {tx.get('dept_name', 'N/A')}
- Amount: ₹{tx.get('amount', 0):,.2f}
- Vendor ID: {tx.get('vendor_id', 'N/A')}
- Category: {tx.get('item_category', 'N/A')}
- Date: {tx.get('timestamp', 'N/A')}

ANOMALIES DETECTED (Risk Score: {audit_result.get('risk_score', 0):.2f}/1.0):
{audit_result.get('anomaly_reason', 'N/A')}

FLAGS TRIGGERED: {', '.join(flags)}

Provide:
1. A 2-sentence investigation narrative explaining what likely happened
2. The most probable leakage mechanism (salami slicing / ghost vendor / price padding etc.)
3. One specific recommended action for the auditor

Keep response under 200 words. Use plain English. Reference Indian public finance context."""

    narrative = await _call_gemini(prompt, max_chars=600)

    if narrative is None:
        narrative = _fallback_narrative(tx, audit_result)

    return {
        "narrative": narrative,
        "recommendation": _default_recommendation(flags),
        "severity_context": audit_result.get("status", "UNKNOWN"),
        "generated_by": "gemini-2.5-flash",
    }


async def generate_department_risk_profile(
    dept_name: str,
    risk_data: dict,
) -> str:
    """Generate a Gemini AI risk profile summary for a department."""
    prompt = f"""You are PRAHARI, India's budget intelligence system.
Write a 3-sentence risk profile for this government department based on its financial behavior data.

DEPARTMENT: {dept_name}
COMPOSITE RISK SCORE: {risk_data.get('composite_score', 0):.1f}/100
RISK TIER: {risk_data.get('risk_tier', 'UNKNOWN')}
ANOMALY FLAGS: {risk_data.get('anomaly_flags', [])}
TOTAL AMOUNT AUDITED: ₹{risk_data.get('total_amount_cr', 0):.2f} Cr
FLAGGED TRANSACTIONS: {risk_data.get('flagged_count', 0)} of {risk_data.get('total_count', 0)}
ESTIMATED LEAKAGE: ₹{risk_data.get('estimated_leakage_cr', 0):.2f} Cr

Write only the risk profile. Be specific, factual, and actionable. Reference Indian public finance."""

    result = await _call_gemini(prompt, max_chars=400)
    return result or f"{dept_name} has a {risk_data.get('risk_tier','UNKNOWN')} risk profile based on transaction pattern analysis."


async def generate_executive_briefing(
    summary_stats: dict,
    top_anomalies: List[dict],
    fiscal_year: str,
) -> str:
    """Generate executive-level intelligence briefing for dashboard."""
    top_3 = top_anomalies[:3]
    anomaly_list = "\n".join([
        f"  - {a.get('dept_name', 'N/A')}: {a.get('anomaly_reason', 'N/A')[:80]} (Score: {a.get('risk_score', 0):.2f})"
        for a in top_3
    ])

    prompt = f"""You are PRAHARI, India's National Budget Intelligence System.
Generate a 5-sentence executive briefing for the Finance Ministry dashboard.

FISCAL YEAR: {fiscal_year}
TOTAL TRANSACTIONS AUDITED: {summary_stats.get('total_transactions', 0)}
FLAGGED: {summary_stats.get('flagged', 0)} ({summary_stats.get('flagged_pct', 0):.1f}%)
CRITICAL: {summary_stats.get('critical', 0)}
ESTIMATED TOTAL LEAKAGE RISK: ₹{summary_stats.get('estimated_leakage_cr', 0):.2f} Cr

TOP ANOMALIES:
{anomaly_list}

Write for senior IAS officers / Finance Ministry secretaries. Use formal, precise language.
Reference Indian budget governance context. Suggest systemic intervention if warranted."""

    result = await _call_gemini(prompt, max_chars=700)
    return result or (
        f"PRAHARI has completed automated analysis for FY {fiscal_year}. "
        f"{summary_stats.get('flagged', 0)} transactions flagged with cumulative leakage risk of "
        f"₹{summary_stats.get('estimated_leakage_cr', 0):.2f} Cr. Immediate review recommended."
    )


async def generate_vendor_risk_explanation(vendor: dict) -> str:
    """Explain vendor risk in plain language."""
    prompt = f"""You are PRAHARI, India's procurement intelligence watchdog.
In 2 sentences, explain the risk posed by this government vendor:

Vendor: {vendor.get('vendor_name', 'Unknown')}
Risk Score: {vendor.get('risk_score', 0):.2f}/1.0
Risk Tier: {vendor.get('risk_tier', 'UNKNOWN')}
Signals: {', '.join(vendor.get('risk_signals', ['none']))}
Departments Served: {vendor.get('departments_served', 0)}
Total Contract Value: ₹{vendor.get('total_contract_value_cr', 0):.2f} Cr

Be specific. Reference Indian government procurement rules (GFR 2017, CPPP norms)."""

    result = await _call_gemini(prompt, max_chars=300)
    return result or f"Vendor {vendor.get('vendor_name','Unknown')} shows {vendor.get('risk_tier','UNKNOWN')} risk based on network and compliance analysis."


async def generate_lapse_warning(dept: dict) -> str:
    """Generate fund lapse early warning narrative."""
    prompt = f"""You are PRAHARI. Write a 3-sentence early warning notice about fund lapse risk.

Department: {dept.get('entity_name', 'N/A')}
Current Utilization: {dept.get('utilization_pct', 0)}%
Remaining Budget: ₹{dept.get('remaining_budget_cr', 0):.2f} Cr
Fund Lapse Risk: {dept.get('fund_lapse_risk', 'UNKNOWN')}
March Rush Score: {dept.get('march_rush_score', 0):.2f}
Signals: {', '.join(dept.get('march_rush_signals', []))}

Address this to the department's Principal Secretary. Be direct and actionable."""

    result = await _call_gemini(prompt, max_chars=350)
    return result or (
        f"Department {dept.get('entity_name','N/A')} has {dept.get('utilization_pct',0)}% utilization "
        f"with ₹{dept.get('remaining_budget_cr',0):.2f} Cr at lapse risk. Immediate expenditure acceleration required."
    )


# ── PRIVATE FALLBACKS ──────────────────────────────────────────────────────────

def _fallback_narrative(tx: dict, audit_result: dict) -> str:
    flags = audit_result.get("anomaly_flags", [])
    flag_str = ", ".join(flags) if flags else "multiple patterns"
    return (
        f"Transaction from {tx.get('dept_name','Department')} for ₹{tx.get('amount',0):,.0f} "
        f"triggered {flag_str} anomaly pattern(s). "
        f"Risk score: {audit_result.get('risk_score', 0):.2f}/1.0 — {audit_result.get('status','FLAGGED')}. "
        f"Manual audit review recommended."
    )


def _default_recommendation(flags: list) -> str:
    priority = {
        "circular": "Initiate CBI/ED referral — circular trading indicates systemic collusion.",
        "ghost": "Freeze payment and verify vendor registration with MCA portal.",
        "price_padding": "Request CPPP market comparison report and invoke GFR Rule 149.",
        "salami": "Halt all pending payments to this vendor and trigger anti-money laundering review.",
        "drift": "Obtain departmental explanation and verify against approved budget variance.",
        "march": "Place payment under enhanced scrutiny; invoke year-end expenditure monitoring circular.",
        "travel": "Geographic inconsistency — request field verification and procurement documents.",
        "ml_isolation": "Statistical outlier — route to AI-assisted audit queue for manual review.",
    }
    for flag in flags:
        if flag in priority:
            return priority[flag]
    return "Refer to departmental audit committee for detailed investigation."
