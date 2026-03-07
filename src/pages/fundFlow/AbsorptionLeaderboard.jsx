/**
 * AbsorptionLeaderboard Page
 * Rank entities by fund absorption efficiency
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Badge from '../../components/Badge'
import fundFlowService from '../../services/fundFlow.service'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Trophy,
  Medal,
  Star
} from 'lucide-react'

const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  if (amount >= 1e9) return `₹${(amount / 1e9).toFixed(2)}B`
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`
  return `₹${amount.toLocaleString('en-IN')}`
}

const getRankIcon = (rank) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
  if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />
  return <Star className="w-5 h-5 text-neutral-400" />
}

const getPerformanceBadge = (rate) => {
  if (rate >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-300' }
  if (rate >= 80) return { label: 'Very Good', color: 'bg-blue-100 text-blue-800 border-blue-300' }
  if (rate >= 70) return { label: 'Good', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' }
  if (rate >= 60) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
  if (rate >= 50) return { label: 'Poor', color: 'bg-orange-100 text-orange-800 border-orange-300' }
  return { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-300' }
}

const AbsorptionLeaderboard = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [selectedTab, setSelectedTab] = useState('top') // 'top' or 'bottom'
  const [error, setError] = useState(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fundFlowService.getAbsorptionLeaderboard()
      setLeaderboardData(data)
    } catch (err) {
      console.error('Error loading absorption leaderboard:', err)
      setError(err.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Loading leaderboard...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-neutral-50 p-8">
          <Card className="max-w-2xl mx-auto p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={loadLeaderboard}>Retry</Button>
          </Card>
        </div>
      </>
    )
  }

  const topPerformers = leaderboardData?.top_performers || []
  const bottomPerformers = leaderboardData?.bottom_performers || []
  const currentList = selectedTab === 'top' ? topPerformers : bottomPerformers

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
                <Award className="w-8 h-8 text-yellow-600" />
                Absorption Efficiency Leaderboard
              </h1>
              <p className="text-neutral-600 mt-2">
                Ranking of best and worst performing entities by fund utilization
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          {leaderboardData?.stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Average Rate</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {leaderboardData.stats.average_absorption?.toFixed(1)}%
                </p>
                <p className="text-xs text-neutral-500 mt-1">National average</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Top Performer</span>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {topPerformers[0]?.absorption_rate?.toFixed(1) || '0'}%
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {topPerformers[0]?.name || topPerformers[0]?.code || 'N/A'}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Bottom Performer</span>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {bottomPerformers[0]?.absorption_rate?.toFixed(1) || '0'}%
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {bottomPerformers[0]?.name || bottomPerformers[0]?.code || 'N/A'}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Total Entities</span>
                  <Star className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold">
                  {leaderboardData.stats.total_entities || topPerformers.length + bottomPerformers.length}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Ranked</p>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setSelectedTab('top')}
              variant={selectedTab === 'top' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Top Performers ({topPerformers.length})
            </Button>
            <Button
              onClick={() => setSelectedTab('bottom')}
              variant={selectedTab === 'bottom' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <TrendingDown className="w-4 h-4" />
              Needs Improvement ({bottomPerformers.length})
            </Button>
          </div>

          {/* Leaderboard */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedTab === 'top' ? 'Top Performers' : 'Needs Improvement'}
            </h2>

            {currentList.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-neutral-600">
                  No entities found in this category
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentList.map((entity, index) => {
                  const rank = index + 1
                  const absorptionRate = entity.absorption_rate || 0
                  const badge = getPerformanceBadge(absorptionRate)

                  return (
                    <Card
                      key={index}
                      className={`p-6 border-l-4 ${
                        selectedTab === 'top'
                          ? rank === 1
                            ? 'border-yellow-500 bg-yellow-50/30'
                            : rank === 2
                            ? 'border-gray-400 bg-gray-50/30'
                            : rank === 3
                            ? 'border-orange-500 bg-orange-50/30'
                            : 'border-blue-500'
                          : 'border-red-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Rank */}
                          <div className="flex flex-col items-center">
                            {getRankIcon(rank)}
                            <span className="text-sm font-semibold mt-1">#{rank}</span>
                          </div>

                          {/* Entity Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {entity.name || entity.code}
                              </h3>
                              <Badge className={badge.color}>{badge.label}</Badge>
                            </div>

                            <p className="text-sm text-neutral-600 font-mono mb-3">
                              {entity.code} • {entity.node_type || entity.type}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="text-xs font-medium text-neutral-500">
                                  Allocated
                                </label>
                                <p className="text-sm font-semibold text-blue-600">
                                  {formatCurrency(entity.allocated_amount)}
                                </p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-neutral-500">
                                  Utilized
                                </label>
                                <p className="text-sm font-semibold text-green-600">
                                  {formatCurrency(entity.actual_amount)}
                                </p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-neutral-500">
                                  Absorption Rate
                                </label>
                                <p className={`text-lg font-bold ${
                                  absorptionRate >= 80
                                    ? 'text-green-600'
                                    : absorptionRate >= 50
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}>
                                  {absorptionRate.toFixed(2)}%
                                </p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-neutral-500">
                                  Unspent
                                </label>
                                <p className="text-sm font-semibold text-orange-600">
                                  {formatCurrency(
                                    (entity.allocated_amount || 0) - (entity.actual_amount || 0)
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Performance Indicator */}
                        <div className="text-right">
                          {selectedTab === 'top' ? (
                            <TrendingUp className="w-8 h-8 text-green-500" />
                          ) : (
                            <TrendingDown className="w-8 h-8 text-red-500" />
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

export default AbsorptionLeaderboard
