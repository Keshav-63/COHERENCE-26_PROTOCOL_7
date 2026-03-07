"""
Fund Flow Graph Builder
Constructs the complete National Budget Knowledge Graph from MongoDB data.

Hierarchy:
  CENTRAL_GOVT
    └── MINISTRY  (from budget_allocations entity_type=ministry)
          └── SCHEME     (from budget_allocations entity_type=scheme)
          └── DEPARTMENT (from budget_allocations entity_type=department)
                └── STATE   (when state_code present on allocation)
                      └── DISTRICT  (from location data)
                            └── VENDOR  (from budget_transactions)
"""

import asyncio
import hashlib
import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, Optional, Tuple

import networkx as nx
from pymongo import UpdateOne

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────
CENTRAL_NODE_ID = "CENTRAL:GOI"
CENTRAL_NODE_META = {
    "node_id": CENTRAL_NODE_ID,
    "node_type": "central_govt",
    "node_name": "Government of India",
    "node_code": "GOI",
    "depth": 0,
}


def _make_id(prefix: str, code: str) -> str:
    """Create a deterministic node ID."""
    return f"{prefix.upper()}:{code.upper()}"


def _edge_id(from_id: str, to_id: str, fy: str) -> str:
    raw = f"{from_id}|{to_id}|{fy}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]


# ── Graph Builder ──────────────────────────────────────────────────────────────
class FundFlowGraphBuilder:
    """
    Builds a directed, weighted knowledge graph (NetworkX MultiDiGraph)
    representing how public money flows across entities.
    """

    def __init__(self):
        self._graph: Optional[nx.MultiDiGraph] = None
        self._last_built: Optional[datetime] = None
        self._fiscal_year: Optional[str] = None
        self._build_lock: Optional[asyncio.Lock] = None

    def _get_lock(self) -> asyncio.Lock:
        """Lazily create lock inside running event loop."""
        if self._build_lock is None:
            self._build_lock = asyncio.Lock()
        return self._build_lock

    # ── Public API ─────────────────────────────────────────────────────────────

    async def build(self, db, fiscal_year: str = "2025-26") -> nx.MultiDiGraph:
        """
        (Re)build the full fund-flow graph for a fiscal year.
        Persists nodes/edges to MongoDB and caches graph in memory.
        """
        logger.info(f"Building fund flow graph for FY {fiscal_year}")
        G = nx.MultiDiGraph()

        # Seed root node
        G.add_node(CENTRAL_NODE_ID, **CENTRAL_NODE_META,
                   total_allocated_cr=0.0, total_spent_cr=0.0,
                   absorption_rate=0.0, fiscal_year=fiscal_year)

        # ── Step 1: Budget Allocations ─────────────────────────────────────
        allocations = await db["budget_allocations"].find(
            {"fiscal_year": fiscal_year}
        ).to_list(None)

        logger.info(f"Loaded {len(allocations)} allocations for FY {fiscal_year}")

        # Accumulators keyed by node_id
        node_allocated: Dict[str, float] = defaultdict(float)
        node_spent: Dict[str, float] = defaultdict(float)

        # Edge accumulators: (from, to) → {allocated, actual, docs, meta}
        edge_acc: Dict[Tuple, Dict] = defaultdict(lambda: {
            "allocated_cr": 0.0, "actual_cr": 0.0,
            "source_doc_ids": [], "scheme_code": None,
            "ministry_code": None, "state_code": None,
            "department_code": None
        })

        # Accumulate ministry-level totals from ALL allocations (regardless of entity_type)
        # This ensures CENTRAL→MINISTRY edges exist even when data is scheme-level only
        ministry_totals: Dict[str, Dict] = {}

        for alloc in allocations:
            be = float(alloc.get("budget_estimate") or 0)
            ae = float(alloc.get("actual_expenditure") or alloc.get("revised_estimate") or 0)

            entity_type = alloc.get("entity_type", "ministry")
            ministry_code = alloc.get("ministry_code", "")
            ministry_name = alloc.get("ministry_name", ministry_code)
            dept_code = alloc.get("department_code")
            dept_name = alloc.get("department_name", dept_code)
            scheme_code = alloc.get("scheme_code")
            scheme_name = alloc.get("scheme_name", scheme_code)
            state_code = alloc.get("state_code")
            state_name = alloc.get("state_name", state_code)
            alloc_id = str(alloc.get("_id", ""))

            # Always aggregate to ministry level for CENTRAL→MINISTRY edge
            if ministry_code:
                if ministry_code not in ministry_totals:
                    ministry_totals[ministry_code] = {
                        "name": ministry_name, "be": 0.0, "ae": 0.0,
                        "has_ministry_row": False, "ids": []
                    }
                if entity_type == "ministry":
                    # Ministry-level row: authoritative total
                    ministry_totals[ministry_code]["has_ministry_row"] = True
                    ministry_totals[ministry_code]["be"] += be
                    ministry_totals[ministry_code]["ae"] += ae
                    ministry_totals[ministry_code]["ids"].append(alloc_id)
                elif not ministry_totals[ministry_code]["has_ministry_row"]:
                    # Scheme/dept-level: accumulate as fallback total
                    ministry_totals[ministry_code]["be"] += be
                    ministry_totals[ministry_code]["ae"] += ae
                    if len(ministry_totals[ministry_code]["ids"]) < 5:
                        ministry_totals[ministry_code]["ids"].append(alloc_id)

            # ── Ministry node ───────────────────────────────────────────
            if ministry_code:
                min_id = _make_id("MINISTRY", ministry_code)
                if min_id not in G:
                    G.add_node(min_id,
                               node_id=min_id, node_type="ministry",
                               node_name=ministry_name, node_code=ministry_code,
                               depth=1, fiscal_year=fiscal_year,
                               total_allocated_cr=0.0, total_spent_cr=0.0,
                               absorption_rate=0.0)

                # CENTRAL → MINISTRY (for explicit ministry-level rows)
                if entity_type == "ministry":
                    ek = (CENTRAL_NODE_ID, min_id)
                    edge_acc[ek]["allocated_cr"] += be
                    edge_acc[ek]["actual_cr"] += ae
                    edge_acc[ek]["source_doc_ids"].append(alloc_id)
                    edge_acc[ek]["ministry_code"] = ministry_code
                    node_allocated[min_id] += be
                    node_spent[min_id] += ae
                    node_allocated[CENTRAL_NODE_ID] += be

            # ── Department node ─────────────────────────────────────────
            if dept_code and entity_type in ("department", "subscheme"):
                dept_id = _make_id("DEPT", dept_code)
                if dept_id not in G:
                    G.add_node(dept_id,
                               node_id=dept_id, node_type="department",
                               node_name=dept_name or dept_code,
                               node_code=dept_code,
                               depth=3, fiscal_year=fiscal_year,
                               total_allocated_cr=0.0, total_spent_cr=0.0,
                               absorption_rate=0.0)

                parent_id = _make_id("MINISTRY", ministry_code) if ministry_code else CENTRAL_NODE_ID
                ek = (parent_id, dept_id)
                edge_acc[ek]["allocated_cr"] += be
                edge_acc[ek]["actual_cr"] += ae
                edge_acc[ek]["source_doc_ids"].append(alloc_id)
                edge_acc[ek]["ministry_code"] = ministry_code
                node_allocated[dept_id] += be
                node_spent[dept_id] += ae

                # State node linked to department
                if state_code:
                    state_id = _make_id("STATE", state_code)
                    if state_id not in G:
                        G.add_node(state_id,
                                   node_id=state_id, node_type="state",
                                   node_name=state_name or state_code,
                                   node_code=state_code, state_code=state_code,
                                   depth=2, fiscal_year=fiscal_year,
                                   total_allocated_cr=0.0, total_spent_cr=0.0,
                                   absorption_rate=0.0)
                    ek2 = (dept_id, state_id)
                    edge_acc[ek2]["allocated_cr"] += be
                    edge_acc[ek2]["actual_cr"] += ae
                    edge_acc[ek2]["source_doc_ids"].append(alloc_id)
                    edge_acc[ek2]["state_code"] = state_code
                    edge_acc[ek2]["ministry_code"] = ministry_code
                    node_allocated[state_id] += be
                    node_spent[state_id] += ae

            # ── Scheme node ─────────────────────────────────────────────
            if scheme_code and entity_type == "scheme":
                scheme_id = _make_id("SCHEME", scheme_code)
                if scheme_id not in G:
                    G.add_node(scheme_id,
                               node_id=scheme_id, node_type="scheme",
                               node_name=scheme_name or scheme_code,
                               node_code=scheme_code,
                               depth=2, fiscal_year=fiscal_year,
                               total_allocated_cr=0.0, total_spent_cr=0.0,
                               absorption_rate=0.0)

                parent_id = _make_id("MINISTRY", ministry_code) if ministry_code else CENTRAL_NODE_ID
                ek = (parent_id, scheme_id)
                edge_acc[ek]["allocated_cr"] += be
                edge_acc[ek]["actual_cr"] += ae
                edge_acc[ek]["source_doc_ids"].append(alloc_id)
                edge_acc[ek]["scheme_code"] = scheme_code
                edge_acc[ek]["ministry_code"] = ministry_code
                node_allocated[scheme_id] += be
                node_spent[scheme_id] += ae

                # Scheme → State
                if state_code:
                    state_id = _make_id("STATE", state_code)
                    if state_id not in G:
                        G.add_node(state_id,
                                   node_id=state_id, node_type="state",
                                   node_name=state_name or state_code,
                                   node_code=state_code, state_code=state_code,
                                   depth=2, fiscal_year=fiscal_year,
                                   total_allocated_cr=0.0, total_spent_cr=0.0,
                                   absorption_rate=0.0)
                    ek2 = (scheme_id, state_id)
                    edge_acc[ek2]["allocated_cr"] += be
                    edge_acc[ek2]["actual_cr"] += ae
                    edge_acc[ek2]["source_doc_ids"].append(alloc_id)
                    edge_acc[ek2]["scheme_code"] = scheme_code
                    edge_acc[ek2]["state_code"] = state_code
                    node_allocated[state_id] += be
                    node_spent[state_id] += ae
        # ── Step 1b: Ensure CENTRAL→MINISTRY edges from aggregated totals ──
        # For ministry nodes with no explicit CENTRAL→MINISTRY edge yet,
        # synthesize one from their aggregated scheme/dept allocations.
        for mcode, totals in ministry_totals.items():
            min_id = _make_id("MINISTRY", mcode)
            ek = (CENTRAL_NODE_ID, min_id)
            if edge_acc[ek]["allocated_cr"] == 0.0 and totals["be"] > 0:
                edge_acc[ek]["allocated_cr"] = totals["be"]
                edge_acc[ek]["actual_cr"] = totals["ae"]
                edge_acc[ek]["source_doc_ids"] = totals["ids"][:5]
                edge_acc[ek]["ministry_code"] = mcode
                node_allocated[CENTRAL_NODE_ID] += totals["be"]
        # ── Step 2: Budget Transactions (Dept → Vendor) ────────────────────
        transactions = await db["budget_transactions"].find(
            {"fiscal_year": fiscal_year}
        ).to_list(None)

        for tx in transactions:
            vendor_id = tx.get("vendor_id", "")
            dept_name_tx = tx.get("dept_name", "")
            state_code_tx = tx.get("state_code", "")
            amount = float(tx.get("amount", 0)) / 1e7   # ₹ → Crores
            ministry_code_tx = tx.get("ministry_code", "")
            scheme_code_tx = tx.get("scheme_code", "")
            tx_id = str(tx.get("_id", ""))

            if not vendor_id:
                continue

            vendor_id_norm = _make_id("VENDOR", vendor_id.replace(" ", "_"))
            if vendor_id_norm not in G:
                G.add_node(vendor_id_norm,
                           node_id=vendor_id_norm, node_type="vendor",
                           node_name=vendor_id, node_code=vendor_id,
                           depth=6, fiscal_year=fiscal_year,
                           total_allocated_cr=0.0, total_spent_cr=0.0,
                           absorption_rate=100.0)

            # Determine source of vendor payment
            if dept_name_tx:
                dept_code_tx = dept_name_tx.replace(" ", "_").upper()[:20]
                dept_node_id = _make_id("DEPT", dept_code_tx)
                if dept_node_id not in G:
                    parent = _make_id("STATE", state_code_tx) if state_code_tx else (
                        _make_id("MINISTRY", ministry_code_tx) if ministry_code_tx else CENTRAL_NODE_ID
                    )
                    G.add_node(dept_node_id,
                               node_id=dept_node_id, node_type="department",
                               node_name=dept_name_tx, node_code=dept_code_tx,
                               depth=3, fiscal_year=fiscal_year,
                               total_allocated_cr=0.0, total_spent_cr=0.0,
                               absorption_rate=0.0,
                               parent_node_id=parent)
                source_id = dept_node_id
            elif state_code_tx:
                source_id = _make_id("STATE", state_code_tx)
            else:
                source_id = CENTRAL_NODE_ID

            ek = (source_id, vendor_id_norm)
            edge_acc[ek]["allocated_cr"] += amount
            edge_acc[ek]["actual_cr"] += amount
            edge_acc[ek]["source_doc_ids"].append(tx_id)
            edge_acc[ek]["state_code"] = state_code_tx
            edge_acc[ek]["ministry_code"] = ministry_code_tx
            edge_acc[ek]["scheme_code"] = scheme_code_tx

            node_allocated[vendor_id_norm] += amount
            node_spent[vendor_id_norm] += amount

        # ── Step 3: Apply aggregated financials to nodes ───────────────────
        for nid, data in G.nodes(data=True):
            alloc = node_allocated.get(nid, 0.0)
            spent = node_spent.get(nid, 0.0)
            absorption = round((spent / alloc * 100) if alloc > 0 else 0.0, 2)
            G.nodes[nid]["total_allocated_cr"] = round(alloc, 2)
            G.nodes[nid]["total_spent_cr"] = round(spent, 2)
            G.nodes[nid]["absorption_rate"] = absorption
            G.nodes[nid]["unspent_cr"] = round(max(alloc - spent, 0.0), 2)

        # ── Step 4: Add edges to graph ─────────────────────────────────────
        for (from_id, to_id), acc in edge_acc.items():
            if from_id not in G or to_id not in G:
                continue
            eid = _edge_id(from_id, to_id, fiscal_year)
            alloc_cr = round(acc["allocated_cr"], 2)
            actual_cr = round(acc["actual_cr"], 2)
            efficiency = round((actual_cr / alloc_cr * 100) if alloc_cr > 0 else 0.0, 2)

            # Infer edge type
            from_type = G.nodes[from_id]["node_type"]
            to_type = G.nodes[to_id]["node_type"]
            edge_type = _infer_edge_type(from_type, to_type)

            G.add_edge(from_id, to_id,
                       edge_id=eid,
                       edge_type=edge_type,
                       allocated_cr=alloc_cr,
                       actual_cr=actual_cr,
                       flow_efficiency=efficiency,
                       scheme_code=acc.get("scheme_code"),
                       ministry_code=acc.get("ministry_code"),
                       state_code=acc.get("state_code"),
                       department_code=acc.get("department_code"),
                       source_doc_ids=acc["source_doc_ids"][:10],
                       fiscal_year=fiscal_year)

        # ── Step 5: Recalculate inflow/outflow per node ────────────────────
        for nid in G.nodes():
            inflow = sum(
                d.get("actual_cr", 0) for _, _, d in G.in_edges(nid, data=True)
            )
            outflow = sum(
                d.get("actual_cr", 0) for _, _, d in G.out_edges(nid, data=True)
            )
            G.nodes[nid]["total_inflow_cr"] = round(inflow, 2)
            G.nodes[nid]["total_outflow_cr"] = round(outflow, 2)

        # ── Step 5b: Propagate child allocations up to Ministry ────────────
        # Ministry nodes get total_allocated as sum of direct-child edge allocations
        for nid, data in G.nodes(data=True):
            if data.get("node_type") != "ministry":
                continue
            child_alloc = sum(
                d.get("allocated_cr", 0) for _, _, d in G.out_edges(nid, data=True)
            )
            child_spent = sum(
                d.get("actual_cr", 0) for _, _, d in G.out_edges(nid, data=True)
            )
            if child_alloc > 0:
                G.nodes[nid]["total_allocated_cr"] = round(child_alloc, 2)
                G.nodes[nid]["total_spent_cr"] = round(child_spent, 2)
                G.nodes[nid]["absorption_rate"] = round(child_spent / child_alloc * 100, 2)
                G.nodes[nid]["unspent_cr"] = round(max(child_alloc - child_spent, 0.0), 2)

        # ── Step 6: Assign risk tiers ──────────────────────────────────────
        for nid, data in G.nodes(data=True):
            absorption = data.get("absorption_rate", 0)
            unspent = data.get("unspent_cr", 0)
            if absorption < 20 and unspent > 100:
                G.nodes[nid]["risk_tier"] = "RED"
            elif absorption < 40:
                G.nodes[nid]["risk_tier"] = "ORANGE"
            elif absorption < 65:
                G.nodes[nid]["risk_tier"] = "YELLOW"
            else:
                G.nodes[nid]["risk_tier"] = "GREEN"

        # ── Step 7: Persist to MongoDB ─────────────────────────────────────
        await self._persist_graph(db, G, fiscal_year)

        self._graph = G
        self._last_built = datetime.utcnow()
        self._fiscal_year = fiscal_year

        node_count = G.number_of_nodes()
        edge_count = G.number_of_edges()
        logger.info(f"Graph built: {node_count} nodes, {edge_count} edges")
        return G

    async def get_graph(self, db, fiscal_year: str = "2025-26") -> nx.MultiDiGraph:
        """Return cached graph, or build it if stale / first call.
        Uses a lock so concurrent requests don't trigger duplicate builds.
        """
        if self._graph is not None and self._fiscal_year == fiscal_year:
            return self._graph
        async with self._get_lock():
            # Double-check after acquiring the lock
            if self._graph is None or self._fiscal_year != fiscal_year:
                await self.build(db, fiscal_year)
        return self._graph

    # ── Private helpers ────────────────────────────────────────────────────────

    async def _persist_graph(self, db, G: nx.MultiDiGraph, fiscal_year: str):
        """Upsert all nodes and edges using bulk_write — single round-trip each."""
        now = datetime.utcnow()

        # ── Bulk-upsert nodes ──────────────────────────────────────────────
        node_ops = [
            UpdateOne(
                {"node_id": nid, "fiscal_year": fiscal_year},
                {"$set": {**data, "last_synced": now}},
                upsert=True,
            )
            for nid, data in G.nodes(data=True)
        ]
        if node_ops:
            await db["fund_flow_nodes"].bulk_write(node_ops, ordered=False)

        # ── Bulk-upsert edges ──────────────────────────────────────────────
        seen_edges: set = set()
        edge_ops = []
        for from_id, to_id, data in G.edges(data=True):
            eid = data.get("edge_id") or _edge_id(from_id, to_id, fiscal_year)
            if eid in seen_edges:
                continue
            seen_edges.add(eid)
            edge_ops.append(
                UpdateOne(
                    {"edge_id": eid},
                    {"$set": {
                        "edge_id": eid,
                        "from_node_id": from_id,
                        "to_node_id": to_id,
                        "from_node_type": G.nodes[from_id].get("node_type", ""),
                        "to_node_type": G.nodes[to_id].get("node_type", ""),
                        "from_node_name": G.nodes[from_id].get("node_name", from_id),
                        "to_node_name": G.nodes[to_id].get("node_name", to_id),
                        **data,
                        "last_synced": now,
                    }},
                    upsert=True,
                )
            )
        if edge_ops:
            await db["fund_flow_edges"].bulk_write(edge_ops, ordered=False)


def _infer_edge_type(from_type: str, to_type: str) -> str:
    mapping = {
        ("central_govt", "ministry"):    "budget_allocation",
        ("ministry", "scheme"):          "scheme_release",
        ("ministry", "department"):      "dept_allocation",
        ("ministry", "state"):           "state_transfer",
        ("scheme", "state"):             "state_transfer",
        ("scheme", "department"):        "dept_allocation",
        ("state", "department"):         "dept_allocation",
        ("state", "district"):           "district_release",
        ("department", "district"):      "district_release",
        ("department", "vendor"):        "contract_payment",
        ("district", "vendor"):          "contract_payment",
        ("state", "vendor"):             "contract_payment",
    }
    return mapping.get((from_type, to_type), "grant")


# Singleton instance
graph_builder = FundFlowGraphBuilder()
