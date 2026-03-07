"""
PRAHARI Fund Flow API
Complete Knowledge Graph endpoints for national budget flow tracking.

Endpoints:
  GET  /fund-flow/graph                     — Full knowledge graph (D3 / Cytoscape)
  GET  /fund-flow/graph/state/{state_code}  — State-scoped subgraph
  GET  /fund-flow/graph/ministry/{code}     — Ministry-scoped downstream subgraph
  GET  /fund-flow/node/{node_id}            — Single node with in/out flows
  GET  /fund-flow/trace                     — Trace money path (from → to)
  GET  /fund-flow/bottlenecks               — Funds stuck at each level
  GET  /fund-flow/vendor/{vendor_id}/trail  — Full vendor money ancestry
  GET  /fund-flow/absorption                 — Absorption efficiency leaderboard
  GET  /fund-flow/summary                   — National flow summary + Gemini report
  POST /fund-flow/rebuild                   — Force rebuild graph from DB
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.fund_flow.engine.graph_builder import graph_builder
from app.fund_flow.engine import flow_analyzer
from app.fund_flow.services import gemini_flow_service

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Helper: ensure graph is loaded ────────────────────────────────────────────
async def _get_graph(db: AsyncIOMotorDatabase, fiscal_year: str):
    return await graph_builder.get_graph(db, fiscal_year)


# ── 1. FULL KNOWLEDGE GRAPH ───────────────────────────────────────────────────

@router.get("/graph", summary="Full Fund Flow Knowledge Graph")
async def get_full_graph(
    fiscal_year: str = Query(default="2025-26", description="Fiscal year e.g. 2025-26"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Returns the complete national fund flow graph as nodes + edges.
    Format is compatible with D3.js force-directed graphs and Cytoscape.js.

    Each *node* is a fund entity (Ministry, Scheme, State, Dept, Vendor).
    Each *edge* is a directed fund flow with allocated and actual amounts.
    """
    G = await _get_graph(db, fiscal_year)
    result = flow_analyzer.export_full_graph(G)
    result["fiscal_year"] = fiscal_year
    result["graph_built_at"] = (
        graph_builder._last_built.isoformat() if graph_builder._last_built else None
    )
    return result


# ── 2. STATE SUBGRAPH ─────────────────────────────────────────────────────────

@router.get("/graph/state/{state_code}", summary="State Fund Flow Subgraph")
async def get_state_graph(
    state_code: str,
    fiscal_year: str = Query(default="2025-26"),
    include_narrative: bool = Query(default=True),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Returns the fund flow subgraph centered on a specific state.
    Includes all incoming flows (ministry/scheme → state) and
    outgoing flows (state → district/dept/vendor).

    `state_code` examples: MH, DL, UP, RJ, GJ, KA, TN
    """
    G = await _get_graph(db, fiscal_year)
    result = flow_analyzer.get_state_subgraph(G, state_code)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    if include_narrative:
        result["gemini_narrative"] = await gemini_flow_service.narrate_state_flow(
            state_code, result
        )

    result["fiscal_year"] = fiscal_year
    return result


# ── 3. MINISTRY SUBGRAPH ──────────────────────────────────────────────────────

@router.get("/graph/ministry/{ministry_code}", summary="Ministry Downstream Subgraph")
async def get_ministry_graph(
    ministry_code: str,
    fiscal_year: str = Query(default="2025-26"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Returns the full downstream fund flow graph for a ministry.
    Shows every Scheme, State, Department and Vendor that received
    funds originating from this ministry.

    Example ministry codes: MOHFW, MOF, MORD, MORTH
    """
    G = await _get_graph(db, fiscal_year)
    result = flow_analyzer.get_ministry_subgraph(G, ministry_code)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    result["fiscal_year"] = fiscal_year
    return result


# ── 4. SINGLE NODE DETAIL ─────────────────────────────────────────────────────

@router.get("/node/{node_id:path}", summary="Node Detail — Incoming & Outgoing Flows")
async def get_node_detail(
    node_id: str,
    fiscal_year: str = Query(default="2025-26"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Returns full detail for a single node in the knowledge graph.
    Includes all incoming (who sent money) and outgoing (where money went) flows.

    `node_id` format: `MINISTRY:MOHFW`, `STATE:MH`, `VENDOR:V001`, `SCHEME:PM-KISAN-2019`
    """
    G = await _get_graph(db, fiscal_year)
    result = flow_analyzer.get_node_detail(G, node_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    result["fiscal_year"] = fiscal_year
    return result


# ── 5. TRACE FUND PATH ────────────────────────────────────────────────────────

@router.get("/trace", summary="Trace Fund Flow Path (from → to)")
async def trace_fund_path(
    from_node: str = Query(..., description="Source node ID, e.g. MINISTRY:MOHFW"),
    to_node: str = Query(..., description="Destination node ID, e.g. VENDOR:V001"),
    fiscal_year: str = Query(default="2025-26"),
    include_narrative: bool = Query(default=True, description="Generate Gemini AI narrative"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Traces all fund flow paths between two nodes in the knowledge graph.
    Answers: *"How did this money get from Ministry X to Vendor Y?"*

    Returns up to 5 distinct paths ordered by total value.
    Each path shows hop-by-hop transfer amounts and edge types.
    """
    G = await _get_graph(db, fiscal_year)
    result = flow_analyzer.trace_fund_path(G, from_node, to_node)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    if include_narrative:
        result["gemini_path_narrative"] = await gemini_flow_service.narrate_fund_path(result)

    result["fiscal_year"] = fiscal_year
    return result


# ── 6. BOTTLENECK DETECTION ───────────────────────────────────────────────────

@router.get("/bottlenecks", summary="Detect Fund Flow Bottlenecks")
async def get_bottlenecks(
    top_n: int = Query(default=15, ge=1, le=50),
    fiscal_year: str = Query(default="2025-26"),
    include_narrative: bool = Query(default=True),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Identifies nodes where large sums of money are allocated but not flowing downstream.
    These are the choke points where public funds get stuck — the primary drivers of
    fund lapse, year-end rush spending, and phantom utilization.

    Returns entities ranked by unspent amount with risk tier classification.
    """
    G = await _get_graph(db, fiscal_year)
    result = flow_analyzer.find_bottlenecks(G, top_n)

    if include_narrative:
        result["gemini_bottleneck_analysis"] = await gemini_flow_service.explain_bottlenecks(result)

    result["fiscal_year"] = fiscal_year
    return result


# ── 7. VENDOR MONEY TRAIL ─────────────────────────────────────────────────────

@router.get("/vendor/{vendor_id}/trail", summary="Vendor Money Ancestry Trail")
async def get_vendor_trail(
    vendor_id: str,
    fiscal_year: str = Query(default="2025-26"),
    include_narrative: bool = Query(default=True),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Traces a vendor's complete money trail back to its source Ministry.
    Answers: *"Which Ministry's budget eventually reached this Vendor, through which path?"*

    This is essential for accountability — connecting vendor payments to
    the original parliamentary budget authorization.
    """
    G = await _get_graph(db, fiscal_year)
    result = flow_analyzer.trace_vendor_ancestry(G, vendor_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    if include_narrative:
        result["gemini_trail_explanation"] = await gemini_flow_service.explain_vendor_trail(result)

    result["fiscal_year"] = fiscal_year
    return result


# ── 8. ABSORPTION LEADERBOARD ─────────────────────────────────────────────────

@router.get("/absorption", summary="Absorption Efficiency Leaderboard")
async def get_absorption_leaderboard(
    node_type: str = Query(
        default="state",
        description="Entity type: state | ministry | department | scheme"
    ),
    top_n: int = Query(default=20, ge=5, le=100),
    fiscal_year: str = Query(default="2025-26"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Ranks entities by budget absorption efficiency.
    Returns both best performers (highest absorption) and
    worst performers (lowest absorption / highest lapse risk).
    """
    valid_types = {"state", "ministry", "department", "scheme", "district"}
    if node_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"node_type must be one of: {', '.join(valid_types)}"
        )
    G = await _get_graph(db, fiscal_year)
    result = flow_analyzer.get_absorption_leaderboard(G, node_type, top_n)
    result["fiscal_year"] = fiscal_year
    return result


# ── 9. NATIONAL FLOW SUMMARY ──────────────────────────────────────────────────

@router.get("/summary", summary="National Fund Flow Summary + Gemini Intelligence Report")
async def get_flow_summary(
    fiscal_year: str = Query(default="2025-26"),
    include_report: bool = Query(default=True, description="Generate Gemini executive report"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Returns high-level fund flow statistics for the entire nation:
    - Total central allocation vs actual expenditure
    - Graph statistics (nodes, edges, by type)
    - Risk distribution across all entities
    - Top ministries by allocation
    - Gemini AI executive intelligence report
    """
    G = await _get_graph(db, fiscal_year)
    summary = flow_analyzer.get_flow_summary(G, fiscal_year)

    if include_report:
        summary["gemini_intelligence_report"] = (
            await gemini_flow_service.generate_flow_intelligence_report(summary)
        )

    summary["graph_built_at"] = (
        graph_builder._last_built.isoformat() if graph_builder._last_built else None
    )
    return summary


# ── 10. FORCE REBUILD ─────────────────────────────────────────────────────────

@router.post("/rebuild", summary="Rebuild Fund Flow Knowledge Graph from MongoDB")
async def rebuild_graph(
    fiscal_year: str = Query(default="2025-26"),
    background_tasks: BackgroundTasks = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Forces a complete rebuild of the fund flow knowledge graph from MongoDB data.
    This re-reads all budget_allocations, expenditures, and budget_transactions
    and reconstructs the NetworkX graph + persists updated nodes/edges.

    Use this after importing new budget data or running new transactions.
    """
    G = await graph_builder.build(db, fiscal_year)
    return {
        "status": "success",
        "message": f"Fund flow graph rebuilt for FY {fiscal_year}",
        "fiscal_year": fiscal_year,
        "built_at": graph_builder._last_built.isoformat(),
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges(),
    }
