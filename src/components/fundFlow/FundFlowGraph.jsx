/**
 * FundFlowGraph — Clean Hierarchical Fund Flow Visualization
 * Replaces force-directed graph with a readable top-down flow diagram.
 * Layout: Central Government → Ministries → States/Schemes
 */

import React, { useState, useMemo } from 'react'

const formatCr = (val) => {
  if (!val || val === 0) return '₹0'
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L Cr`
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K Cr`
  return `₹${Math.round(val).toLocaleString('en-IN')} Cr`
}

const getRiskBorder = (tier) => {
  switch (tier) {
    case 'RED': return 'border-red-400 bg-red-50'
    case 'ORANGE': return 'border-orange-400 bg-orange-50'
    case 'YELLOW': return 'border-yellow-400 bg-yellow-50'
    default: return 'border-green-300 bg-green-50'
  }
}

const getRiskBadge = (tier) => {
  switch (tier) {
    case 'RED': return 'bg-red-100 text-red-700'
    case 'ORANGE': return 'bg-orange-100 text-orange-700'
    case 'YELLOW': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-green-100 text-green-700'
  }
}

const getAbsColor = (rate) => {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const AbsBar = ({ rate }) => (
  <div className="mt-1.5 w-full bg-neutral-200 rounded-full h-1.5">
    <div
      className={`h-1.5 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
      style={{ width: `${Math.min(rate || 0, 100)}%` }}
    />
  </div>
)

const FlowArrow = ({ label }) => (
  <div className="flex justify-center my-2">
    <div className="flex flex-col items-center text-neutral-400">
      <div className="w-px h-4 bg-neutral-300" />
      {label && <span className="text-xs text-neutral-400 font-medium px-2 py-0.5 bg-neutral-100 rounded">{label}</span>}
      <div className="w-px h-3 bg-neutral-300" />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-neutral-400" />
    </div>
  </div>
)

const FundFlowGraph = ({
  graphData,
  onNodeClick,
}) => {
  const [selectedMinistry, setSelectedMinistry] = useState(null)

  const { central, ministries, childrenByMinistry } = useMemo(() => {
    const nodes = graphData?.nodes || []
    const edges = graphData?.links || graphData?.edges || []

    const central = nodes.find(n => n.node_type === 'central_govt')

    const ministries = nodes
      .filter(n => n.node_type === 'ministry')
      .sort((a, b) => (b.total_allocated_cr || 0) - (a.total_allocated_cr || 0))
      .slice(0, 15)

    // For each ministry, collect direct children via edges
    const childrenByMinistry = {}
    ministries.forEach(min => {
      const directIds = new Set()
      edges.forEach(e => {
        const src = typeof e.source === 'object' ? e.source.id : e.source
        const tgt = typeof e.target === 'object' ? e.target.id : e.target
        if (src === min.id) directIds.add(tgt)
      })

      // Find states reachable within 2 hops
      const stateIds = new Set()
      directIds.forEach(childId => {
        const childNode = nodes.find(n => n.id === childId)
        if (childNode?.node_type === 'state') {
          stateIds.add(childId)
        } else {
          // Go one more hop to find states
          edges.forEach(e => {
            const src = typeof e.source === 'object' ? e.source.id : e.source
            const tgt = typeof e.target === 'object' ? e.target.id : e.target
            if (src === childId) {
              const tNode = nodes.find(n => n.id === tgt)
              if (tNode?.node_type === 'state') stateIds.add(tgt)
            }
          })
        }
      })

      const states = nodes
        .filter(n => stateIds.has(n.id))
        .sort((a, b) => (b.total_allocated_cr || 0) - (a.total_allocated_cr || 0))
        .slice(0, 8)

      // If no states found, fall back to direct scheme/dept children
      const direct = states.length > 0
        ? states
        : nodes
            .filter(n => directIds.has(n.id))
            .sort((a, b) => (b.total_allocated_cr || 0) - (a.total_allocated_cr || 0))
            .slice(0, 8)

      childrenByMinistry[min.id] = { items: direct, isStates: states.length > 0 }
    })

    return { central, ministries, childrenByMinistry }
  }, [graphData])

  if (!graphData?.nodes?.length) {
    return (
      <div className="text-center py-16 text-neutral-500">
        <p className="text-sm">No graph data available. Click "Rebuild Graph" to generate the fund flow.</p>
      </div>
    )
  }

  const selectedChildren = selectedMinistry ? childrenByMinistry[selectedMinistry.id] : null

  return (
    <div className="space-y-1 px-2">

      {/* ── Level 1: Central Government ─────────────────────── */}
      {central && (
        <div className="flex justify-center">
          <button
            onClick={() => onNodeClick?.(central)}
            className="bg-purple-50 border-2 border-purple-500 rounded-xl px-10 py-4 hover:shadow-lg transition-shadow text-center min-w-80 group"
          >
            <div className="text-xs font-semibold text-purple-500 uppercase tracking-widest mb-1">Central Government</div>
            <div className="text-lg font-bold text-purple-900 group-hover:text-purple-700">
              {central.node_name || 'Government of India'}
            </div>
            <div className="flex justify-center gap-8 mt-3">
              <div>
                <div className="text-xs text-neutral-500">Allocated</div>
                <div className="text-base font-bold text-purple-700">{formatCr(central.total_allocated_cr)}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Utilised</div>
                <div className={`text-base font-bold ${getAbsColor(central.absorption_rate)}`}>
                  {formatCr(central.total_spent_cr)}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Absorption</div>
                <div className={`text-base font-bold ${getAbsColor(central.absorption_rate)}`}>
                  {(central.absorption_rate || 0).toFixed(1)}%
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      <FlowArrow label="Budget Allocation" />

      {/* ── Level 2: Ministries ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-neutral-700">
            Ministries <span className="text-neutral-400 font-normal">({ministries.length} shown by allocation)</span>
          </h3>
          <span className="text-xs text-neutral-400 ml-2">— click to expand states</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {ministries.map(min => (
            <button
              key={min.id}
              onClick={() => {
                setSelectedMinistry(prev => prev?.id === min.id ? null : min)
                onNodeClick?.(min)
              }}
              className={`border-2 rounded-lg p-3 text-left hover:shadow-md transition-all ${
                selectedMinistry?.id === min.id
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                  : getRiskBorder(min.risk_tier)
              }`}
            >
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide truncate">
                {min.node_code || min.id.split(':')[1]}
              </div>
              <div className="text-xs font-medium text-neutral-800 mt-1 leading-tight line-clamp-2" title={min.node_name}>
                {min.node_name}
              </div>
              <div className="mt-2 text-sm font-bold text-neutral-800">{formatCr(min.total_allocated_cr)}</div>
              <div className={`text-xs font-semibold mt-0.5 ${getAbsColor(min.absorption_rate)}`}>
                {(min.absorption_rate || 0).toFixed(0)}% absorbed
              </div>
              <AbsBar rate={min.absorption_rate} />
              <span className={`mt-1.5 text-xs px-1.5 py-0.5 rounded-full inline-block font-medium ${getRiskBadge(min.risk_tier)}`}>
                {min.risk_tier || 'GREEN'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Level 3: States / Schemes for selected ministry ──── */}
      {selectedMinistry && (
        <>
          <FlowArrow label={`Flows from ${selectedMinistry.node_code || selectedMinistry.node_name}`} />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-cyan-500 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-neutral-700">
                {selectedChildren?.isStates ? 'States' : 'Schemes / Departments'} receiving from{' '}
                <span className="text-blue-700">{selectedMinistry.node_name}</span>
              </h3>
            </div>
            {selectedChildren?.items?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {selectedChildren.items.map(child => (
                  <button
                    key={child.id}
                    onClick={() => onNodeClick?.(child)}
                    className={`border-2 rounded-lg p-2 text-left hover:shadow-md transition-all ${getRiskBorder(child.risk_tier)}`}
                  >
                    <div className="text-xs font-bold text-cyan-700 uppercase truncate">
                      {child.node_code || child.id.split(':')[1]}
                    </div>
                    <div className="text-xs text-neutral-700 truncate mt-0.5" title={child.node_name}>
                      {child.node_name}
                    </div>
                    <div className="text-xs font-bold text-neutral-800 mt-1">{formatCr(child.total_allocated_cr)}</div>
                    <div className={`text-xs font-semibold ${getAbsColor(child.absorption_rate)}`}>
                      {(child.absorption_rate || 0).toFixed(0)}%
                    </div>
                    <AbsBar rate={child.absorption_rate} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                No downstream entities found for this ministry in the current graph snapshot.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Legend ───────────────────────────────────────────── */}
      <div className="mt-6 pt-4 border-t border-neutral-200 flex flex-wrap gap-6 text-xs text-neutral-600">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-neutral-700">Risk:</span>
          {[['GREEN','bg-green-500'],['YELLOW','bg-yellow-500'],['ORANGE','bg-orange-500'],['RED','bg-red-500']].map(([label, cls]) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${cls}`} />
              {label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-neutral-700">Absorption bar:</span>
          <span className="flex items-center gap-1"><span className="w-6 h-1.5 rounded bg-green-500 inline-block" /> &gt;80% Good</span>
          <span className="flex items-center gap-1"><span className="w-6 h-1.5 rounded bg-yellow-500 inline-block" /> 50-80%</span>
          <span className="flex items-center gap-1"><span className="w-6 h-1.5 rounded bg-red-500 inline-block" /> &lt;50% Low</span>
        </div>
      </div>
    </div>
  )
}

export default FundFlowGraph
