"""
Fund Flow Analyzer
Queries the in-memory NetworkX graph for:
  - Full graph export (D3 / Cytoscape format)
  - Path tracing: how did ₹X flow from Ministry A to Vendor B?
  - Bottleneck detection: where do funds pool and stagnate?
  - State / Ministry sub-graphs
  - Vendor traceability: trace a payment back to its source ministry
  - Absorption efficiency ranking
"""

import logging
from typing import Any, Dict, Optional

import networkx as nx

logger = logging.getLogger(__name__)


def _node_to_dict(G: nx.MultiDiGraph, nid: str) -> Dict[str, Any]:
    """Serialize a graph node to a clean dict for API responses."""
    d = dict(G.nodes[nid])
    d["id"] = nid
    # Remove internal / un-serialisable keys
    d.pop("_id", None)
    return d


def _edge_to_dict(G: nx.MultiDiGraph, u: str, v: str, data: dict) -> Dict[str, Any]:
    """Serialize an edge to a clean dict."""
    d = dict(data)
    d["source"] = u
    d["target"] = v
    d.pop("_id", None)
    return d


# ── 1. FULL GRAPH EXPORT ───────────────────────────────────────────────────────

def export_full_graph(G: nx.MultiDiGraph) -> Dict[str, Any]:
    """
    Export entire graph as JSON suitable for D3.js / Cytoscape.js.
    Returns {nodes, edges, stats}.
    """
    nodes = [_node_to_dict(G, nid) for nid in G.nodes()]

    edges = []
    seen = set()
    for u, v, data in G.edges(data=True):
        eid = data.get("edge_id", f"{u}|{v}")
        if eid in seen:
            continue
        seen.add(eid)
        edges.append(_edge_to_dict(G, u, v, data))

    total_allocated = sum(G.nodes[n].get("total_allocated_cr", 0) for n in G.nodes()
                          if G.nodes[n].get("node_type") == "ministry")
    total_spent = sum(G.nodes[n].get("total_spent_cr", 0) for n in G.nodes()
                      if G.nodes[n].get("node_type") == "ministry")

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "total_allocated_ministry_cr": round(total_allocated, 2),
            "total_spent_ministry_cr": round(total_spent, 2),
            "overall_absorption_pct": round(
                (total_spent / total_allocated * 100) if total_allocated > 0 else 0.0, 2
            ),
            "node_type_counts": _count_by_type(G),
        }
    }


def _count_by_type(G: nx.MultiDiGraph) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for _, data in G.nodes(data=True):
        t = data.get("node_type", "unknown")
        counts[t] = counts.get(t, 0) + 1
    return counts


# ── 2. SUBGRAPH BY STATE ───────────────────────────────────────────────────────

def get_state_subgraph(G: nx.MultiDiGraph, state_code: str) -> Dict[str, Any]:
    """
    Return all nodes and edges that touch a given state:
      - The state node itself
      - All parents (ministry/scheme → state edges)
      - All children (state → district/dept/vendor edges)
    """
    state_id = f"STATE:{state_code.upper()}"

    if state_id not in G:
        # Try partial match
        matches = [n for n in G.nodes() if state_code.upper() in n]
        if not matches:
            return {"nodes": [], "edges": [], "error": f"State '{state_code}' not found in graph"}
        state_id = matches[0]

    # Ego-graph: all nodes within 2 hops
    sub = nx.ego_graph(G, state_id, radius=2, undirected=False)
    result = export_full_graph(sub)
    result["state_node"] = _node_to_dict(G, state_id)
    result["state_id"] = state_id
    return result


# ── 3. SUBGRAPH BY MINISTRY ────────────────────────────────────────────────────

def get_ministry_subgraph(G: nx.MultiDiGraph, ministry_code: str) -> Dict[str, Any]:
    """
    Return the entire downstream subgraph from a ministry node.
    """
    min_id = f"MINISTRY:{ministry_code.upper()}"

    if min_id not in G:
        matches = [n for n in G.nodes() if ministry_code.upper() in n and "MINISTRY" in n]
        if not matches:
            return {"nodes": [], "edges": [], "error": f"Ministry '{ministry_code}' not found"}
        min_id = matches[0]

    # Descendants only (downstream flow)
    desc = nx.descendants(G, min_id)
    desc.add(min_id)
    sub = G.subgraph(desc)
    result = export_full_graph(sub)
    result["ministry_node"] = _node_to_dict(G, min_id)
    result["ministry_id"] = min_id
    return result


# ── 4. NODE DETAIL ─────────────────────────────────────────────────────────────

def get_node_detail(G: nx.MultiDiGraph, node_id: str) -> Dict[str, Any]:
    """
    Return complete detail for a single node:
      - Node metadata
      - All incoming edges (who sent money)
      - All outgoing edges (to whom money went)
      - Absorption metrics
    """
    if node_id not in G:
        # Fuzzy: check any node where node_id is a substring
        candidates = [n for n in G.nodes() if node_id.upper() in n.upper()]
        if not candidates:
            return {"error": f"Node '{node_id}' not found"}
        node_id = candidates[0]

    node_data = _node_to_dict(G, node_id)

    incoming = []
    for u, _, data in G.in_edges(node_id, data=True):
        incoming.append({
            "from_node_id": u,
            "from_node_name": G.nodes[u].get("node_name", u),
            "from_node_type": G.nodes[u].get("node_type", ""),
            "allocated_cr": data.get("allocated_cr", 0),
            "actual_cr": data.get("actual_cr", 0),
            "flow_efficiency": data.get("flow_efficiency", 0),
            "edge_type": data.get("edge_type", ""),
        })

    outgoing = []
    for _, v, data in G.out_edges(node_id, data=True):
        outgoing.append({
            "to_node_id": v,
            "to_node_name": G.nodes[v].get("node_name", v),
            "to_node_type": G.nodes[v].get("node_type", ""),
            "allocated_cr": data.get("allocated_cr", 0),
            "actual_cr": data.get("actual_cr", 0),
            "flow_efficiency": data.get("flow_efficiency", 0),
            "edge_type": data.get("edge_type", ""),
        })

    return {
        "node": node_data,
        "incoming_flows": sorted(incoming, key=lambda x: -x["allocated_cr"]),
        "outgoing_flows": sorted(outgoing, key=lambda x: -x["allocated_cr"]),
        "summary": {
            "total_sources": len(incoming),
            "total_destinations": len(outgoing),
            "total_in_cr": sum(e["actual_cr"] for e in incoming),
            "total_out_cr": sum(e["actual_cr"] for e in outgoing),
        }
    }


# ── 5. TRACE MONEY PATH ────────────────────────────────────────────────────────

def trace_fund_path(
    G: nx.MultiDiGraph,
    from_node_id: str,
    to_node_id: str
) -> Dict[str, Any]:
    """
    Find how money flows from `from_node_id` to `to_node_id`.
    Returns all simple paths (up to 5) with value carried on each hop.
    """
    # Fuzzy match
    from_node_id = _resolve_node(G, from_node_id)
    to_node_id = _resolve_node(G, to_node_id)

    if not from_node_id or not to_node_id:
        return {"error": "One or both nodes not found", "paths": []}

    # For MultiDiGraph, convert to simple DiGraph with max-capacity edges
    simple_G = _collapse_to_digraph(G)

    try:
        paths = list(nx.all_simple_paths(simple_G, from_node_id, to_node_id, cutoff=8))
    except nx.NetworkXNoPath:
        paths = []
    except nx.NodeNotFound:
        return {"error": "Node not in graph", "paths": []}

    # Take top 5 paths by total flow value
    enriched_paths = []
    for path in paths[:5]:
        hops = []
        total_value = 0.0
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            edge_data = simple_G.get_edge_data(u, v) or {}
            hop_value = edge_data.get("actual_cr", 0)
            total_value += hop_value
            hops.append({
                "from_node_id": u,
                "from_node_name": G.nodes[u].get("node_name", u),
                "from_node_type": G.nodes[u].get("node_type", ""),
                "to_node_id": v,
                "to_node_name": G.nodes[v].get("node_name", v),
                "to_node_type": G.nodes[v].get("node_type", ""),
                "edge_type": edge_data.get("edge_type", ""),
                "allocated_cr": edge_data.get("allocated_cr", 0),
                "actual_cr": hop_value,
                "flow_efficiency": edge_data.get("flow_efficiency", 0),
            })
        enriched_paths.append({
            "path_nodes": path,
            "hops": hops,
            "path_length": len(path),
            "total_value_cr": round(total_value, 2),
        })

    enriched_paths.sort(key=lambda p: -p["total_value_cr"])

    return {
        "from_node": _node_to_dict(G, from_node_id),
        "to_node": _node_to_dict(G, to_node_id),
        "total_paths_found": len(enriched_paths),
        "paths": enriched_paths,
    }


def _collapse_to_digraph(G: nx.MultiDiGraph) -> nx.DiGraph:
    """Collapse multi-edges by summing actual_cr, for path finding."""
    DG = nx.DiGraph()
    DG.add_nodes_from(G.nodes(data=True))
    for u, v, data in G.edges(data=True):
        if DG.has_edge(u, v):
            DG[u][v]["actual_cr"] += data.get("actual_cr", 0)
            DG[u][v]["allocated_cr"] += data.get("allocated_cr", 0)
        else:
            DG.add_edge(u, v, **data)
    return DG


# ── 6. BOTTLENECK DETECTION ────────────────────────────────────────────────────

def find_bottlenecks(G: nx.MultiDiGraph, top_n: int = 15) -> Dict[str, Any]:
    """
    Identify nodes where money accumulates and doesn't flow downstream.
    Bottleneck score = (inflow - outflow) / inflow,  weighted by unspent amount.
    """
    bottlenecks = []
    for nid, data in G.nodes(data=True):
        inflow = data.get("total_inflow_cr", 0)
        outflow = data.get("total_outflow_cr", 0)
        unspent = data.get("unspent_cr", 0)
        node_type = data.get("node_type", "")

        # Skip terminal nodes (vendors) and root
        if node_type in ("vendor", "central_govt") or inflow == 0:
            continue

        stagnation = (inflow - outflow) / inflow if inflow > 0 else 0
        if stagnation > 0.1 or unspent > 50:   # >10% stuck or >₹50 Cr unspent
            bottlenecks.append({
                "node_id": nid,
                "node_name": data.get("node_name", nid),
                "node_type": node_type,
                "state_code": data.get("state_code"),
                "total_inflow_cr": round(inflow, 2),
                "total_outflow_cr": round(outflow, 2),
                "stagnation_rate": round(stagnation * 100, 2),
                "unspent_cr": round(unspent, 2),
                "absorption_rate": data.get("absorption_rate", 0),
                "risk_tier": data.get("risk_tier", "GREEN"),
            })

    bottlenecks.sort(key=lambda x: -x["unspent_cr"])
    critical = [b for b in bottlenecks if b["risk_tier"] in ("RED", "ORANGE")]
    return {
        "total_bottlenecks": len(bottlenecks),
        "critical_count": len(critical),
        "total_stagnant_funds_cr": round(sum(b["unspent_cr"] for b in bottlenecks), 2),
        "bottlenecks": bottlenecks[:top_n],
    }


# ── 7. VENDOR TRACEABILITY ─────────────────────────────────────────────────────

def trace_vendor_ancestry(G: nx.MultiDiGraph, vendor_id: str) -> Dict[str, Any]:
    """
    Given a vendor node, trace all the way back to the source Ministry.
    Returns the complete money trail with amounts at each level.
    """
    vendor_node_id = _resolve_node(G, vendor_id, prefer_type="vendor")
    if not vendor_node_id:
        return {"error": f"Vendor '{vendor_id}' not found in graph"}

    simple_G = _collapse_to_digraph(G)

    # Find all paths from any ministry to this vendor
    trail = []
    central_id = "CENTRAL:GOI"

    try:
        paths = list(nx.all_simple_paths(simple_G, central_id, vendor_node_id, cutoff=10))
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        paths = []

    for path in paths[:3]:
        hops = []
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            edge_data = simple_G.get_edge_data(u, v) or {}
            hops.append({
                "level": i,
                "from": G.nodes[u].get("node_name", u),
                "from_type": G.nodes[u].get("node_type", ""),
                "to": G.nodes[v].get("node_name", v),
                "to_type": G.nodes[v].get("node_type", ""),
                "amount_cr": edge_data.get("actual_cr", 0),
                "edge_type": edge_data.get("edge_type", ""),
            })
        trail.append({"path": hops, "total_cr": sum(h["amount_cr"] for h in hops)})

    vendor_data = _node_to_dict(G, vendor_node_id)

    return {
        "vendor": vendor_data,
        "money_trails": trail,
        "total_received_cr": vendor_data.get("total_inflow_cr", 0),
        "direct_payers": [
            {
                "payer_id": u,
                "payer_name": G.nodes[u].get("node_name", u),
                "payer_type": G.nodes[u].get("node_type", ""),
                "amount_cr": data.get("actual_cr", 0),
            }
            for u, _, data in G.in_edges(vendor_node_id, data=True)
        ]
    }


# ── 8. FLOW SUMMARY ────────────────────────────────────────────────────────────

def get_flow_summary(G: nx.MultiDiGraph, fiscal_year: str) -> Dict[str, Any]:
    """High-level fund flow statistics."""
    node_types = _count_by_type(G)
    total_alloc = sum(
        d.get("total_allocated_cr", 0)
        for _, d in G.nodes(data=True)
        if d.get("node_type") == "ministry"
    )
    total_spent = sum(
        d.get("total_spent_cr", 0)
        for _, d in G.nodes(data=True)
        if d.get("node_type") == "ministry"
    )
    total_vendor_payments = sum(
        d.get("total_inflow_cr", 0)
        for _, d in G.nodes(data=True)
        if d.get("node_type") == "vendor"
    )

    risk_dist = {"GREEN": 0, "YELLOW": 0, "ORANGE": 0, "RED": 0}
    for _, d in G.nodes(data=True):
        tier = d.get("risk_tier", "GREEN")
        risk_dist[tier] = risk_dist.get(tier, 0) + 1

    top_ministry_by_alloc = sorted(
        [(nid, d) for nid, d in G.nodes(data=True) if d.get("node_type") == "ministry"],
        key=lambda x: -x[1].get("total_allocated_cr", 0)
    )[:5]

    return {
        "fiscal_year": fiscal_year,
        "graph_stats": {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "node_type_breakdown": node_types,
        },
        "financial_summary": {
            "total_central_allocation_cr": round(total_alloc, 2),
            "total_actual_expenditure_cr": round(total_spent, 2),
            "overall_absorption_pct": round(
                (total_spent / total_alloc * 100) if total_alloc > 0 else 0.0, 2
            ),
            "total_vendor_payments_cr": round(total_vendor_payments, 2),
            "unspent_central_cr": round(max(total_alloc - total_spent, 0.0), 2),
        },
        "risk_distribution": risk_dist,
        "top_ministries_by_allocation": [
            {
                "node_id": nid,
                "name": d.get("node_name", nid),
                "allocated_cr": d.get("total_allocated_cr", 0),
                "spent_cr": d.get("total_spent_cr", 0),
                "absorption_rate": d.get("absorption_rate", 0),
                "risk_tier": d.get("risk_tier", "GREEN"),
            }
            for nid, d in top_ministry_by_alloc
        ]
    }


# ── 9. ABSORPTION LEADERBOARD ──────────────────────────────────────────────────

def get_absorption_leaderboard(
    G: nx.MultiDiGraph,
    node_type: str = "state",
    top_n: int = 20
) -> Dict[str, Any]:
    """Rank nodes by absorption efficiency (best → worst)."""
    nodes = [
        {
            "node_id": nid,
            "node_name": d.get("node_name", nid),
            "node_type": d.get("node_type"),
            "state_code": d.get("state_code"),
            "total_allocated_cr": d.get("total_allocated_cr", 0),
            "total_spent_cr": d.get("total_spent_cr", 0),
            "absorption_rate": d.get("absorption_rate", 0),
            "unspent_cr": d.get("unspent_cr", 0),
            "risk_tier": d.get("risk_tier", "GREEN"),
        }
        for nid, d in G.nodes(data=True)
        if d.get("node_type") == node_type and d.get("total_allocated_cr", 0) > 0
    ]
    nodes.sort(key=lambda x: -x["absorption_rate"])
    return {
        "node_type": node_type,
        "total_entities": len(nodes),
        "best_performers": nodes[:top_n // 2],
        "worst_performers": nodes[-(top_n // 2):],
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _resolve_node(
    G: nx.MultiDiGraph,
    identifier: str,
    prefer_type: Optional[str] = None
) -> Optional[str]:
    """Resolve a node ID (exact or fuzzy)."""
    if identifier in G:
        return identifier
    upper_id = identifier.upper()
    matches = [n for n in G.nodes() if upper_id in n.upper()]
    if not matches:
        return None
    if prefer_type:
        typed = [n for n in matches if G.nodes[n].get("node_type") == prefer_type]
        if typed:
            return typed[0]
    return matches[0]
