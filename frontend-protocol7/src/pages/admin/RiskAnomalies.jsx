import React, { useState } from 'react'
import { AlertTriangle, TrendingDown, MapPin, CheckCircle, Clock, Flag } from 'lucide-react'
import Card from '../../components/Card'
import Navigation from '../../components/Navigation'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import { formatCurrency, getAnomalySeverityBadgeColor, showSuccess } from '../../utils/utils'
import { ANOMALIES } from '../../utils/mockData'
import { useAuth } from '../../context/AuthContext'

const RiskAnomalies = () => {
  const { user, admin } = useAuth()
  const [anomalies, setAnomalies] = useState(ANOMALIES)
  const [selectedAnomaly, setSelectedAnomaly] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState('all')

  // Determine user role for navigation
  const currentUser = user || admin
  const userRole = currentUser?.role || 'admin'

  const filteredAnomalies = filterSeverity === 'all'
    ? anomalies
    : anomalies.filter(a => a.severity === filterSeverity)

  const handleResolve = (id) => {
    setAnomalies(anomalies.map(a =>
      a.id === id ? { ...a, status: 'resolved' } : a
    ))
    showSuccess('Anomaly marked as resolved')
    setSelectedAnomaly(null)
  }

  const handleInvestigate = (id) => {
    setAnomalies(anomalies.map(a =>
      a.id === id ? { ...a, status: 'investigating' } : a
    ))
    showSuccess('Anomaly marked for investigation')
    setSelectedAnomaly(null)
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-700 bg-red-50 border-red-200',
      high: 'text-orange-700 bg-orange-50 border-orange-200',
      medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      low: 'text-blue-700 bg-blue-50 border-blue-200',
    }
    return colors[severity] || colors.low
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'flagged':
        return <Flag size={16} className="text-red-600" />
      case 'investigating':
        return <Clock size={16} className="text-orange-600" />
      case 'resolved':
        return <CheckCircle size={16} className="text-green-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation role={userRole} />

      <main className="md:ml-64 pt-20 md:pt-0">
        {/* Header */}
        <section className="bg-gradient-to-r from-red-50 to-white border-b border-neutral-200 px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold font-display mb-2">
                  <span className="text-red-600">Risk & Anomalies</span>
                </h1>
                <p className="text-neutral-600">
                  Detect and monitor budget leakages and anomalous transactions
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card shadow="glass">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Critical Issues</p>
                    <p className="text-2xl font-bold">
                      {anomalies.filter(a => a.severity === 'critical').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle size={24} className="text-red-700" />
                  </div>
                </div>
              </Card>

              <Card shadow="glass">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">High Priority</p>
                    <p className="text-2xl font-bold">
                      {anomalies.filter(a => a.severity === 'high').length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingDown size={24} className="text-orange-700" />
                  </div>
                </div>
              </Card>

              <Card shadow="glass">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Under Investigation</p>
                    <p className="text-2xl font-bold">
                      {anomalies.filter(a => a.status === 'investigating').length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock size={24} className="text-yellow-700" />
                  </div>
                </div>
              </Card>

              <Card shadow="glass">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Resolved</p>
                    <p className="text-2xl font-bold">
                      {anomalies.filter(a => a.status === 'resolved').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle size={24} className="text-green-700" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                <button
                  key={severity}
                  onClick={() => setFilterSeverity(severity)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                    filterSeverity === severity
                      ? 'bg-primary-900 text-white shadow-lg'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary-900'
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>

            {/* Anomalies List */}
            <div className="space-y-4">
              {filteredAnomalies.length > 0 ? (
                filteredAnomalies.map((anomaly) => (
                  <Card
                    key={anomaly.id}
                    hover
                    className={`cursor-pointer border-2 ${getSeverityColor(anomaly.severity)}`}
                    onClick={() => setSelectedAnomaly(anomaly)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs bg-neutral-200 px-2 py-1 rounded">
                            {anomaly.id}
                          </span>
                          <Badge variant={getAnomalySeverityBadgeColor(anomaly.severity)}>
                            {anomaly.severity.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(anomaly.status)}
                            <span className="text-xs font-medium capitalize text-neutral-600">
                              {anomaly.status}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2">{anomaly.type}</h3>
                        <p className="text-neutral-700 mb-3">{anomaly.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-neutral-600">State/Entity</p>
                            <p className="font-medium">{anomaly.state || anomaly.ministry}</p>
                          </div>
                          <div>
                            <p className="text-neutral-600">Amount</p>
                            <p className="font-medium">{formatCurrency(anomaly.amount).split('.')[0]}</p>
                          </div>
                          <div>
                            <p className="text-neutral-600">Threshold</p>
                            <p className="font-medium">{formatCurrency(anomaly.threshold).split('.')[0]}</p>
                          </div>
                          <div>
                            <p className="text-neutral-600">Detected</p>
                            <p className="font-medium">{anomaly.date}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center justify-center">
                        <AlertTriangle size={32} className={
                          anomaly.severity === 'critical' ? 'text-red-600' :
                          anomaly.severity === 'high' ? 'text-orange-600' :
                          'text-yellow-600'
                        } />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card shadow="glass" className="text-center py-12">
                  <p className="text-neutral-600 mb-2">No anomalies found</p>
                  <p className="text-sm text-neutral-500">All transactions appear to be normal</p>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        title="Anomaly Details"
        size="lg"
      >
        {selectedAnomaly && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor(selectedAnomaly.severity)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant={getAnomalySeverityBadgeColor(selectedAnomaly.severity)}>
                    {selectedAnomaly.severity.toUpperCase()}
                  </Badge>
                </div>
                {getStatusIcon(selectedAnomaly.status)}
              </div>

              <h3 className="text-lg font-bold mb-2">{selectedAnomaly.type}</h3>
              <p className="text-neutral-700">{selectedAnomaly.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600 mb-1">State/Ministry</p>
                <p className="text-lg font-bold">{selectedAnomaly.state || selectedAnomaly.ministry}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Department</p>
                <p className="text-lg font-bold">{selectedAnomaly.type}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Amount Flagged</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(selectedAnomaly.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Threshold</p>
                <p className="text-lg font-bold">{formatCurrency(selectedAnomaly.threshold)}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Detected Date</p>
                <p className="text-lg font-bold">{selectedAnomaly.date}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Status</p>
                <Badge variant={
                  selectedAnomaly.status === 'flagged' ? 'danger' :
                  selectedAnomaly.status === 'investigating' ? 'warning' :
                  'success'
                }>
                  {selectedAnomaly.status.charAt(0).toUpperCase() + selectedAnomaly.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">Recommended Actions</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700">
                <li>Review transaction records for the flagged period</li>
                <li>Contact the responsible state/ministry for clarification</li>
                <li>Request supporting documentation for the transaction</li>
                <li>If legitimate, update allocation parameters</li>
              </ul>
            </div>

            <div className="flex gap-3">
              {selectedAnomaly.status !== 'resolved' && (
                <>
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={() => handleResolve(selectedAnomaly.id)}
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Mark Resolved
                  </Button>
                  {selectedAnomaly.status !== 'investigating' && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleInvestigate(selectedAnomaly.id)}
                    >
                      Investigate
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setSelectedAnomaly(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RiskAnomalies
