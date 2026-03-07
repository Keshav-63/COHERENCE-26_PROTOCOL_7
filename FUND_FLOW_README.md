# Fund Flow Knowledge Graph System 🌐

## Overview
Complete graph-based fund flow visualization system for tracking ₹10.1 lakh crore across 448 nodes and 446 fund flow edges in the National Budget Intelligence Platform.

## 🎯 Features Implemented

### 1. **Interactive Force-Directed Graph**
- Real-time D3 physics simulation
- Node coloring by entity type (Ministry, Scheme, State, Vendor)
- Risk-based color coding (RED/ORANGE/YELLOW/GREEN)
- Size-scaled by allocation amount
- Edge coloring by flow efficiency (>80% green, 50-80% yellow, <50% red)
- Interactive zoom, pan, and drag
- Click nodes for detailed information

### 2. **AI Intelligence Integration**
- Gemini AI insights on national dashboard
- Natural language fund flow analysis
- Risk recommendations and bottleneck detection
- Automated intelligence reports

### 3. **Complete Analytics Suite**

#### **National Dashboard** (`/admin/fund-flow`)
- Total nodes: 448 entities
- Total edges: 446 fund flows
- Total allocation: ₹10.1 lakh crore tracked
- Absorption rate: 90.92%
- Unspent funds: ₹9.19 lakh crore
- Risk distribution: 8 RED + 39 ORANGE risk nodes

#### **Ministry Flow View** (`/admin/fund-flow/ministry/:code`)
- Ministry-centric downstream subgraph
- Performance metrics (allocation, absorption, efficiency)
- Scheme-level breakdown

#### **State Flow View** (`/admin/fund-flow/state/:code`)
- State-level fund distribution
- District-wise allocation tracking
- State performance analytics

#### **Fund Tracer** (`/admin/fund-flow/trace`)
- Trace complete path from source to destination
- Step-by-step flow visualization
- Flow efficiency metrics per edge
- Path highlighting on graph

#### **Bottleneck Analysis** (`/admin/fund-flow/bottlenecks`)
- Identify stagnant fund pools
- Severity classification (CRITICAL/HIGH/MEDIUM/LOW)
- Days stagnant tracking
- Actionable recommendations

#### **Vendor Trail** (`/admin/fund-flow/vendor/:id`)
- Vendor ancestry tracking
- Trace payments to source ministry
- Complete trail visualization
- Payment aggregation

#### **Absorption Leaderboard** (`/admin/fund-flow/absorption`)
- Top performers (best absorption rate)
- Bottom performers (needs improvement)
- Performance badges (Excellent/Good/Poor/Critical)
- Trophy/medal icons for top 3
- National average comparison

## 🛠️ Technical Stack

### Dependencies
```json
{
  "react-force-graph-2d": "^1.25.4",
  "d3": "^7.8.5",
  "d3-force": "^3.0.0"
}
```

### Components Created

#### Core Components
- `FundFlowGraph.jsx` - Interactive force-directed graph visualization
- `NodeDetails.jsx` - Detailed node information panel
- `EdgeDetails.jsx` - Fund flow edge information

#### Pages
- `FundFlowDashboard.jsx` - National overview with AI insights
- `MinistryFlowView.jsx` - Ministry-centric exploration
- `StateFlowView.jsx` - State-level analysis
- `FundTracer.jsx` - Path tracing tool
- `BottleneckAnalysis.jsx` - Stagnation detection
- `VendorTrail.jsx` - Vendor ancestry tracking
- `AbsorptionLeaderboard.jsx` - Efficiency rankings

#### Services
- `fundFlowService.js` - Complete API integration (10 endpoints)

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1/fund-flow/`:

1. **GET `/graph`** - Full knowledge graph
2. **GET `/graph/ministry/:code`** - Ministry subgraph
3. **GET `/graph/state/:code`** - State subgraph
4. **GET `/node/:id`** - Single node details
5. **GET `/trace?from_node=X&to_node=Y`** - Path tracing
6. **GET `/bottlenecks`** - Bottleneck detection
7. **GET `/vendor/:id/trail`** - Vendor trail
8. **GET `/absorption`** - Efficiency leaderboard
9. **GET `/summary`** - National summary + AI insights
10. **POST `/rebuild`** - Force rebuild graph

## 🚀 Usage

### Access the Dashboard
```
Navigate to: /admin/fund-flow
or
Click "Fund Flow Graph" in the navigation menu
```

### Search by Ministry
```javascript
// Navigate to ministry view
navigate('/admin/fund-flow/ministry/MIN001')

// Or use the search form on the ministry page
```

### Search by State
```javascript
// Navigate to state view
navigate('/admin/fund-flow/state/MH')

// Or use the search form on the state page
```

### Trace Fund Path
```javascript
// Navigate to tracer
navigate('/admin/fund-flow/trace')

// Enter source and destination node IDs
// Example: from "CENTRAL" to "VEN001"
```

### View Vendor Trail
```javascript
// Navigate to vendor trail
navigate('/admin/fund-flow/vendor/VEN001')
```

## 🎨 Visual Features

### Node Colors
- **Purple** (#8b5cf6) - Central
- **Blue** (#3b82f6) - Ministry
- **Green** (#10b981) - Scheme
- **Cyan** (#06b6d4) - State
- **Indigo** (#6366f1) - Department
- **Teal** (#14b8a6) - District
- **Pink** (#ec4899) - Vendor

### Risk Colors
- **Red** (#ef4444) - High Risk
- **Orange** (#f97316) - Medium Risk
- **Yellow** (#fbbf24) - Low Risk
- **Green** (#10b981) - Healthy

### Flow Efficiency
- **Green** - >80% (Good flow)
- **Yellow** - 50-80% (Moderate)
- **Red** - <50% (Poor flow)

## 📊 Data Format

### Graph Data Structure
```javascript
{
  nodes: [
    {
      id: "NODE_ID",
      code: "NODE_CODE",
      name: "Node Name",
      node_type: "MINISTRY|SCHEME|STATE|VENDOR|...",
      allocated_amount: 1000000000,
      actual_amount: 909200000,
      risk_level: "RED|ORANGE|YELLOW|GREEN",
      flow_efficiency: 0.9092
    }
  ],
  links: [
    {
      source: "SOURCE_NODE_ID",
      target: "TARGET_NODE_ID",
      allocated_amount: 1000000000,
      actual_amount: 909200000,
      flow_efficiency: 0.9092
    }
  ]
}
```

## 🔐 Security

All fund flow routes are protected with role-based access:
- Admin: Full access to all features
- Employee: Limited access based on permissions

## 🐛 Troubleshooting

### Graph Not Displaying
1. Check if backend API is running
2. Verify API endpoint URLs in `api.config.js`
3. Check browser console for errors
4. Try rebuilding the graph using "Rebuild Graph" button

### Empty Graph Data
1. Ensure budget allocations exist in MongoDB
2. Run graph rebuild from backend or frontend
3. Check MongoDB `fund_flow_nodes` and `fund_flow_edges` collections

### Performance Issues
1. Large graphs (>1000 nodes) may be slow
2. Reduce `cooldownTicks` in FundFlowGraph.jsx
3. Consider pagination or filtering for very large datasets

## 📝 Notes

- All currency amounts are in Indian Rupees (₹)
- Graph data is cached after initial load
- Force rebuild clears cache and regenerates from MongoDB
- Gemini AI insights require valid API key in backend

## 🎯 Live Statistics

Based on your actual data:
- **Total Nodes**: 448 (1 Central + 60 Ministries + 385 Schemes + Vendors/Depts)
- **Total Edges**: 446 directed fund flows
- **Total Allocation**: ₹10.1 lakh crore
- **Absorption Rate**: 90.92%
- **Unspent Funds**: ₹9.19 lakh crore
- **Risk Nodes**: 8 RED, 39 ORANGE

## 🔮 Future Enhancements

- Real-time graph updates via WebSocket
- Export graph as PNG/SVG
- Advanced filtering and search
- Time-series animation of fund flows
- Comparative analysis across fiscal years
- Custom node grouping and clustering
- Machine learning-based anomaly detection

---

**Built with ❤️ for PRAHARI Budget Intelligence Platform**
