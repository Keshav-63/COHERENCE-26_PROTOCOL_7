import React, { useState } from 'react'
import { Search, Loader } from 'lucide-react'
import Card from './Card'
import Button from './Button'
import { intelligenceService } from '../services'
import { showSuccess, showError } from '../utils/utils'

const TransactionAuditForm = ({ onAuditComplete }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    trans_id: '',
    admin_level: 'state',
    amount: '',
    dept_name: '',
    fiscal_year: '2025-26',
    item_category: '',
    latitude: '',
    longitude: '',
    ministry_code: '',
    vendor_id: '',
    timestamp: new Date().toISOString().slice(0, 16),
  })
  const [auditResult, setAuditResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAuditResult(null)

    try {
      // Convert amount to number
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        timestamp: new Date(formData.timestamp).toISOString(),
      }

      const result = await intelligenceService.auditTransaction(payload)
      setAuditResult(result)
      showSuccess('Transaction audited successfully!')

      if (onAuditComplete) {
        onAuditComplete(result)
      }
    } catch (error) {
      showError(error.message || 'Failed to audit transaction')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (tier) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-300',
      FLAGGED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CLEAN: 'bg-green-100 text-green-800 border-green-300',
    }
    return colors[tier] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-4">
          Audit Live Transaction
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Transaction ID *
              </label>
              <input
                type="text"
                name="trans_id"
                value={formData.trans_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="TXN-2026-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="495000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Department Name *
              </label>
              <input
                type="text"
                name="dept_name"
                value={formData.dept_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="Rural Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Ministry Code *
              </label>
              <input
                type="text"
                name="ministry_code"
                value={formData.ministry_code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="MORD-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Vendor ID *
              </label>
              <input
                type="text"
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="VEND-NEW-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Item Category *
              </label>
              <input
                type="text"
                name="item_category"
                value={formData.item_category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="Roads"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Admin Level
              </label>
              <select
                name="admin_level"
                value={formData.admin_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
              >
                <option value="central">Central</option>
                <option value="state">State</option>
                <option value="district">District</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Fiscal Year
              </label>
              <input
                type="text"
                name="fiscal_year"
                value={formData.fiscal_year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="2025-26"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="20.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
                placeholder="78.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Transaction Date/Time
              </label>
              <input
                type="datetime-local"
                name="timestamp"
                value={formData.timestamp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Auditing Transaction...
              </>
            ) : (
              <>
                <Search size={16} className="mr-2" />
                Audit Transaction
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Audit Results */}
      {auditResult && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">
            Audit Results
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="text-sm text-neutral-600">Transaction ID</p>
                <p className="text-lg font-mono font-bold">{auditResult.trans_id}</p>
              </div>
              <span className={`px-4 py-2 rounded-lg font-bold ${getRiskColor(auditResult.status)}`}>
                {auditResult.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Risk Score</p>
                <p className="text-3xl font-bold text-blue-900">
                  {(auditResult.risk_score * 100).toFixed(0)}%
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">Amount</p>
                <p className="text-3xl font-bold text-orange-900">
                  ₹{(auditResult.amount / 100000).toFixed(2)} L
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Department</p>
                <p className="text-lg font-bold text-purple-900">
                  {auditResult.dept_name}
                </p>
              </div>
            </div>

            {auditResult.anomaly_reason && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-bold text-orange-900 mb-2">Anomaly Reason:</p>
                <p className="text-sm text-orange-800">{auditResult.anomaly_reason}</p>
              </div>
            )}

            {auditResult.anomaly_flags && auditResult.anomaly_flags.length > 0 && (
              <div>
                <p className="text-sm font-bold text-neutral-700 mb-2">Detected Anomaly Flags:</p>
                <div className="flex flex-wrap gap-2">
                  {auditResult.anomaly_flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium uppercase"
                    >
                      {flag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {auditResult.evidence && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-bold text-neutral-700 mb-2">Evidence:</p>
                <pre className="text-xs text-neutral-600 overflow-x-auto">
                  {JSON.stringify(auditResult.evidence, null, 2)}
                </pre>
              </div>
            )}

            {auditResult.gemini_analysis && (
              <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-sm font-bold text-blue-900 mb-2">Gemini AI Analysis:</p>
                <p className="text-sm text-blue-800">{auditResult.gemini_analysis}</p>
              </div>
            )}

            {auditResult.gemini_recommendation && (
              <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                <p className="text-sm font-bold text-green-900 mb-2">Recommended Action:</p>
                <p className="text-sm text-green-800">{auditResult.gemini_recommendation}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default TransactionAuditForm
