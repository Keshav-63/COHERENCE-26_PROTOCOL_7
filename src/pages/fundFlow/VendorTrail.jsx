/**
 * VendorTrail Page
 * Trace vendor payments back to source ministry
 */

import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import fundFlowService from '../../services/fundFlow.service'
import { ArrowLeft, Search, Users, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(2)}B`
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`
  return `₹${amount.toLocaleString('en-IN')}`
}

const VendorTrail = () => {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [searchId, setSearchId] = useState(vendorId || '')
  const [trailData, setTrailData] = useState(null)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!searchId.trim()) {
      setError('Please enter a vendor ID')
      return
    }

    setLoading(true)
    setError(null)
    setTrailData(null)

    try {
      const data = await fundFlowService.getVendorTrail(searchId.trim())
      setTrailData(data)
    } catch (err) {
      console.error('Error loading vendor trail:', err)
      setError(err.message || 'Failed to load vendor trail')
    } finally {
      setLoading(false)
    }
  }

  // Initial load if vendorId is provided
  React.useEffect(() => {
    if (vendorId) {
      handleSearch({ preventDefault: () => {} })
    }
  }, [vendorId])

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-neutral-50 p-8 md:ml-72">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => navigate('/admin/fund-flow')}
              className="mb-4 flex items-center gap-2"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>

            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-pink-600" />
                Vendor Trail Analysis
              </h1>
              <p className="text-neutral-600 mt-2">
                Trace vendor payments back to the source ministry and scheme
              </p>
            </div>
          </div>

          {/* Search Form */}
          <Card className="p-6 mb-8">
            <form onSubmit={handleSearch}>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter Vendor ID (e.g., VEN001, VEN002...)"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Loading...' : 'Trace'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-600">Tracing vendor ancestry...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Trail Result */}
          {trailData && !loading && (
            <>
              {/* Vendor Info */}
              {trailData.vendor && (
                <Card className="p-6 mb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-6 h-6 text-pink-600" />
                        {trailData.vendor.name || trailData.vendor.code}
                      </h2>
                      <p className="text-sm text-neutral-600 font-mono mb-4">
                        {trailData.vendor.code}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-medium text-neutral-500">
                            Total Payments
                          </label>
                          <p className="text-xl font-semibold text-green-600">
                            {formatCurrency(trailData.vendor.total_payments || trailData.vendor.actual_amount)}
                          </p>
                        </div>

                        {trailData.vendor.payment_count && (
                          <div>
                            <label className="text-xs font-medium text-neutral-500">
                              Payment Count
                            </label>
                            <p className="text-xl font-semibold">
                              {trailData.vendor.payment_count}
                            </p>
                          </div>
                        )}

                        {trailData.trail && (
                          <div>
                            <label className="text-xs font-medium text-neutral-500">
                              Trail Length
                            </label>
                            <p className="text-xl font-semibold text-blue-600">
                              {trailData.trail.length} hops
                            </p>
                          </div>
                        )}

                        {trailData.source_ministry && (
                          <div>
                            <label className="text-xs font-medium text-neutral-500">
                              Source Ministry
                            </label>
                            <p className="text-sm font-semibold">
                              {trailData.source_ministry}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <CheckCircle2 className="w-12 h-12 text-green-500 flex-shrink-0" />
                  </div>
                </Card>
              )}

              {/* Ancestry Trail */}
              {trailData.trail && trailData.trail.length > 0 && (
                <Card className="p-6 mb-8">
                  <h3 className="font-semibold text-lg mb-4">Payment Ancestry Trail</h3>

                  <div className="space-y-3">
                    {trailData.trail.map((node, index) => (
                      <div key={index}>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
                            {index + 1}
                          </div>

                          <div className="flex-1 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-lg">
                                  {node.name || node.code}
                                </p>
                                <p className="text-sm text-neutral-600 font-mono">
                                  {node.code}
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
                                  Type: {node.node_type || node.type}
                                </p>
                              </div>

                              {node.amount && (
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-blue-600">
                                    {formatCurrency(node.amount)}
                                  </p>
                                  <p className="text-xs text-neutral-500">Amount</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {index < trailData.trail.length - 1 && (
                          <div className="ml-5 my-2">
                            <ArrowRight className="w-6 h-6 text-neutral-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Source Information */}
              {(trailData.source_ministry || trailData.source_scheme) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trailData.source_ministry && (
                    <Card className="p-6 bg-blue-50 border-blue-200">
                      <h4 className="font-semibold mb-3 text-blue-900">Source Ministry</h4>
                      <p className="text-lg font-semibold text-blue-700">
                        {trailData.source_ministry}
                      </p>
                      {trailData.ministry_allocation && (
                        <p className="text-sm text-blue-600 mt-2">
                          Total: {formatCurrency(trailData.ministry_allocation)}
                        </p>
                      )}
                    </Card>
                  )}

                  {trailData.source_scheme && (
                    <Card className="p-6 bg-green-50 border-green-200">
                      <h4 className="font-semibold mb-3 text-green-900">Source Scheme</h4>
                      <p className="text-lg font-semibold text-green-700">
                        {trailData.source_scheme}
                      </p>
                      {trailData.scheme_allocation && (
                        <p className="text-sm text-green-600 mt-2">
                          Total: {formatCurrency(trailData.scheme_allocation)}
                        </p>
                      )}
                    </Card>
                  )}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!trailData && !loading && !error && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enter Vendor ID</h3>
              <p className="text-neutral-600">
                Search for a vendor to trace their payment ancestry
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export default VendorTrail
