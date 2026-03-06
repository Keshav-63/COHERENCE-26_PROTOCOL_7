/**
 * API Usage Examples
 * Example components demonstrating API integration patterns
 */

import React, { useState } from 'react'
import { useApi, usePagination, usePolling, useDebouncedApi } from '../hooks/useApi'
import { invitationService } from '../services'
import { useAuth } from '../context/AuthContext'

// Example 1: Simple API call with useApi hook
export function InvitationStatsExample() {
  const { data, loading, error, execute } = useApi(invitationService.getInvitationStats, true)

  if (loading) return <div>Loading stats...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Invitation Statistics</h2>
      {data && (
        <div>
          <p>Total: {data.total_invitations}</p>
          <p>Pending: {data.pending_invitations}</p>
          <p>Accepted: {data.accepted_invitations}</p>
          <p>Active Admins: {data.active_admins}</p>
        </div>
      )}
      <button onClick={execute}>Refresh</button>
    </div>
  )
}

// Example 2: Paginated list
export function InvitationListExample() {
  const {
    data,
    loading,
    error,
    page,
    hasMore,
    nextPage,
    prevPage,
    reload,
  } = usePagination(invitationService.listInvitations, 10)

  return (
    <div>
      <h2>Invitations (Page {page + 1})</h2>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}

      <div>
        {data.map((invitation) => (
          <div key={invitation.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
            <p>Email: {invitation.email}</p>
            <p>Tenant: {invitation.tenant_name}</p>
            <p>Status: {invitation.status}</p>
          </div>
        ))}
      </div>

      <div>
        <button onClick={prevPage} disabled={page === 0 || loading}>
          Previous
        </button>
        <span> Page {page + 1} </span>
        <button onClick={nextPage} disabled={!hasMore || loading}>
          Next
        </button>
        <button onClick={reload}>Reload</button>
      </div>
    </div>
  )
}

// Example 3: Real-time polling
export function LiveStatsExample() {
  const [pollingEnabled, setPollingEnabled] = useState(true)

  const { data, loading, error } = usePolling(
    invitationService.getInvitationStats,
    5000, // Poll every 5 seconds
    pollingEnabled
  )

  return (
    <div>
      <h2>Live Statistics (Auto-refresh)</h2>

      <button onClick={() => setPollingEnabled(!pollingEnabled)}>
        {pollingEnabled ? 'Stop' : 'Start'} Auto-refresh
      </button>

      {loading && <span> Updating...</span>}
      {error && <div>Error: {error}</div>}

      {data && (
        <div>
          <p>Total Invitations: {data.total_invitations}</p>
          <p>Pending: {data.pending_invitations}</p>
          <small>Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
      )}
    </div>
  )
}

// Example 4: Debounced search
export function InvitationSearchExample() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, loading, error, execute } = useDebouncedApi(
    invitationService.listInvitations,
    500 // 500ms debounce
  )

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // Call API with debounce
    if (value) {
      execute({ status: 'pending' })
    }
  }

  return (
    <div>
      <h2>Search Invitations</h2>

      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search..."
      />

      {loading && <div>Searching...</div>}
      {error && <div>Error: {error}</div>}

      {data && (
        <div>
          {data.map((inv) => (
            <div key={inv.id}>
              {inv.email} - {inv.tenant_name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Example 5: Form with API integration
export function CreateInvitationExample() {
  const [formData, setFormData] = useState({
    email: '',
    tenant_type: 'state_government',
    tenant_name: '',
    tenant_code: '',
    description: '',
    expires_in_days: 7,
  })

  const { loading, error, execute } = useApi(invitationService.createInvitation)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const result = await execute(formData)
      alert(`Invitation created! Dashboard URL: ${result.dashboard_url}`)
      // Reset form
      setFormData({
        email: '',
        tenant_type: 'state_government',
        tenant_name: '',
        tenant_code: '',
        description: '',
        expires_in_days: 7,
      })
    } catch (err) {
      console.error('Failed to create invitation:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div>
      <h2>Create Invitation</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Tenant Type:</label>
          <select
            name="tenant_type"
            value={formData.tenant_type}
            onChange={handleChange}
          >
            <option value="state_government">State Government</option>
            <option value="minister">Minister</option>
            <option value="department">Department</option>
          </select>
        </div>

        <div>
          <label>Tenant Name:</label>
          <input
            type="text"
            name="tenant_name"
            value={formData.tenant_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Tenant Code:</label>
          <input
            type="text"
            name="tenant_code"
            value={formData.tenant_code}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Expires in Days:</label>
          <input
            type="number"
            name="expires_in_days"
            value={formData.expires_in_days}
            onChange={handleChange}
            min="1"
            max="30"
          />
        </div>

        {error && <div style={{ color: 'red' }}>Error: {error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Invitation'}
        </button>
      </form>
    </div>
  )
}

// Example 6: Using AuthContext
export function UserProfileExample() {
  const { user, admin, getCurrentUser, getAdminProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const refreshProfile = async () => {
    setLoading(true)
    try {
      if (user) {
        await getCurrentUser()
      } else if (admin) {
        await getAdminProfile()
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>User Profile</h2>

      {user && (
        <div>
          <p>Email: {user.email}</p>
          <p>Name: {user.full_name}</p>
          <p>Role: {user.role}</p>
        </div>
      )}

      {admin && (
        <div>
          <p>Email: {admin.email}</p>
          <p>Tenant: {admin.tenant_name}</p>
          <p>Type: {admin.tenant_type}</p>
          <p>Public Key: {admin.public_key_uploaded ? '✓ Uploaded' : '✗ Not uploaded'}</p>
        </div>
      )}

      <button onClick={refreshProfile} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Profile'}
      </button>
    </div>
  )
}
