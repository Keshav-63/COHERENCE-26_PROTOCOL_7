import React, { useState, useEffect } from 'react'
import { Mail, Copy, Send, Eye, EyeOff, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Navigation from '../../components/Navigation'
import Badge from '../../components/Badge'
import { showSuccess, showError, showInfo, validateEmail } from '../../utils/utils'
import { invitationService } from '../../services'

const KeyManagement = () => {
  const [invitations, setInvitations] = useState([])
  const [email, setEmail] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [tenantCode, setTenantCode] = useState('')
  const [tenantType, setTenantType] = useState('state_government')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [showPreview, setShowPreview] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [invitationDetails, setInvitationDetails] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Load invitations on component mount
  useEffect(() => {
    loadInvitations()
  }, [])

  // Load all invitations
  const loadInvitations = async () => {
    try {
      setLoadingList(true)
      const data = await invitationService.listInvitations({
        skip: 0,
        limit: 100
      })
      setInvitations(data)
    } catch (error) {
      console.error('Failed to load invitations:', error)
      showError('Failed to load invitations')
    } finally {
      setLoadingList(false)
    }
  }

  const handleSendInvitation = async (e) => {
    e.preventDefault()

    // Validation
    if (!email || !validateEmail(email)) {
      showError('Please enter a valid email address')
      return
    }

    if (!tenantName || tenantName.length < 2) {
      showError('Please enter a valid tenant name (min 2 characters)')
      return
    }

    if (!tenantCode || tenantCode.length < 2) {
      showError('Please enter a valid tenant code (min 2 characters)')
      return
    }

    setLoading(true)

    try {
      // Create invitation using real API
      const invitation = await invitationService.createInvitation({
        email,
        tenant_type: tenantType,
        tenant_name: tenantName,
        tenant_code: tenantCode,
        description: description || undefined,
        expires_in_days: 7
      })

      // Store invitation details for display
      setInvitationDetails(invitation)
      setShowPasswordModal(true)

      // Reset form
      setEmail('')
      setTenantName('')
      setTenantCode('')
      setDescription('')

      // Reload invitations list
      loadInvitations()

      showSuccess('Invitation sent successfully!')
    } catch (error) {
      console.error('Failed to send invitation:', error)
      showError(error.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  // Revoke invitation
  const handleRevokeInvitation = async (invitationId) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return
    }

    try {
      await invitationService.revokeInvitation(invitationId)
      showSuccess('Invitation revoked successfully')
      loadInvitations()
    } catch (error) {
      console.error('Failed to revoke invitation:', error)
      showError(error.message || 'Failed to revoke invitation')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showInfo('Copied to clipboard!')
  }

  const getStatusBadge = (status) => {
    const variants = {
      accepted: 'success',
      pending: 'warning',
      expired: 'gray',
      revoked: 'danger',
    }
    return variants[status] || 'gray'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={12} className="mr-1" />
      case 'pending':
        return <Clock size={12} className="mr-1" />
      case 'revoked':
      case 'expired':
        return <XCircle size={12} className="mr-1" />
      default:
        return null
    }
  }

  const getTenantTypeDisplay = (type) => {
    const types = {
      state_government: 'State Government',
      minister: 'Ministry',
      department: 'Department',
      central_government: 'Central Government',
    }
    return types[type] || type
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation role="admin" />

      <main className="md:ml-64 pt-20 md:pt-0">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary-50 to-white border-b border-neutral-200 px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold font-display mb-2">
                  <span className="gradient-text">Key Management</span>
                </h1>
                <p className="text-neutral-600">
                  Generate and send invitation links to state and ministry officials
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 md:px-16 py-6 md:py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Send Invitation Form */}
            <Card shadow="glass" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Send Invitation</h2>
                <p className="text-neutral-600">Invite officials to access the platform</p>
              </div>

              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="official@state.gov.in"
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Tenant Type *
                    </label>
                    <select
                      value={tenantType}
                      onChange={(e) => setTenantType(e.target.value)}
                      className="px-4 py-2.5 rounded-lg border-2 border-neutral-200 focus:border-primary-900 focus:outline-none"
                      required
                    >
                      <option value="state_government">State Government</option>
                      <option value="minister">Ministry</option>
                      <option value="department">Department</option>
                    </select>
                  </div>

                  <Input
                    label="Tenant Name *"
                    type="text"
                    placeholder="e.g., Maharashtra State Government"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                  />

                  <Input
                    label="Tenant Code *"
                    type="text"
                    placeholder="e.g., MH-GOV-001"
                    value={tenantCode}
                    onChange={(e) => setTenantCode(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Description (Optional)"
                  type="text"
                  placeholder="Additional notes about this invitation"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                  >
                    <Send size={20} className="mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </form>
            </Card>

            {/* Invited Users List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Invited Officials</h2>

              {loadingList ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : invitations.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-neutral-600">No invitations sent yet. Create your first invitation above.</p>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="border-b-2 border-neutral-200">
                        <th className="text-left py-4 px-4 font-bold text-neutral-700">Email</th>
                        <th className="text-left py-4 px-4 font-bold text-neutral-700">Tenant Name</th>
                        <th className="text-left py-4 px-4 font-bold text-neutral-700">Type</th>
                        <th className="text-left py-4 px-4 font-bold text-neutral-700">Sent Date</th>
                        <th className="text-left py-4 px-4 font-bold text-neutral-700">Status</th>
                        <th className="text-left py-4 px-4 font-bold text-neutral-700">Public Key</th>
                        <th className="text-left py-4 px-4 font-bold text-neutral-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((invitation) => (
                        <tr key={invitation.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200">
                          <td className="py-4 px-4">{invitation.email}</td>
                          <td className="py-4 px-4 text-neutral-600">{invitation.tenant_name}</td>
                          <td className="py-4 px-4 text-sm text-neutral-600">
                            {getTenantTypeDisplay(invitation.tenant_type)}
                          </td>
                          <td className="py-4 px-4 text-sm text-neutral-600">
                            {new Date(invitation.invited_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={getStatusBadge(invitation.status)}>
                              {getStatusIcon(invitation.status)}
                              {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={invitation.public_key_uploaded ? 'success' : 'gray'}>
                              {invitation.public_key_uploaded ? '✓ Uploaded' : '✗ Not uploaded'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowPreview(invitation)}
                                className="text-primary-900 hover:text-primary-800 font-medium text-sm"
                              >
                                View
                              </button>
                              {invitation.status === 'pending' && (
                                <button
                                  onClick={() => handleRevokeInvitation(invitation.id)}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                                >
                                  <Trash2 size={14} />
                                  Revoke
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* How it Works */}
            <Card shadow="glass">
              <h3 className="text-xl font-bold mb-4">How It Works</h3>
              <ol className="space-y-3 text-neutral-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-900 text-white flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <span>Enter the official's email address and select their organization type</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-900 text-white flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <span>An email is sent with an invitation link and temporary password</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-900 text-white flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <span>The official opens the link and creates their account using the temp password</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-900 text-white flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  <span>They generate their key pair and upload their public key to the platform</span>
                </li>
              </ol>
            </Card>
          </div>
        </section>
      </main>

      {/* Invitation Details Modal */}
      {invitationDetails && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false)
            setInvitationDetails(null)
            setShowPassword(false)
          }}
          title="Invitation Sent Successfully"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-neutral-700">
              The invitation has been created! Share the following details with the official via email.
            </p>

            <Card className="bg-primary-50 border border-primary-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Dashboard URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={invitationDetails.dashboard_url}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-primary-200 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(invitationDetails.dashboard_url)}
                      className="p-2 hover:bg-primary-100 rounded-lg transition-colors duration-200"
                      title="Copy dashboard URL"
                    >
                      <Copy size={20} className="text-primary-900" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">
                    This URL contains the unique invitation hash
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Tenant Information
                  </label>
                  <div className="bg-white border border-primary-200 rounded-lg p-3 text-sm">
                    <p><strong>Name:</strong> {invitationDetails.tenant_name}</p>
                    <p><strong>Code:</strong> {invitationDetails.tenant_code}</p>
                    <p><strong>Type:</strong> {getTenantTypeDisplay(invitationDetails.tenant_type)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Invitation Details
                  </label>
                  <div className="bg-white border border-primary-200 rounded-lg p-3 text-sm">
                    <p><strong>Email:</strong> {invitationDetails.email}</p>
                    <p><strong>Expires:</strong> {new Date(invitationDetails.expires_at).toLocaleString()}</p>
                    <p><strong>Status:</strong> {invitationDetails.status}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ An email has been sent to <strong>{invitationDetails.email}</strong> with the login credentials and dashboard URL.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ The invitation will expire on <strong>{new Date(invitationDetails.expires_at).toLocaleDateString()}</strong>. The admin must login and upload their public key before expiry.
              </p>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setShowPasswordModal(false)
                setInvitationDetails(null)
                setShowPassword(false)
              }}
            >
              Done
            </Button>
          </div>
        </Modal>
      )}

      {/* View Details Modal */}
      {showPreview && (
        <Modal
          isOpen={!!showPreview}
          onClose={() => setShowPreview(null)}
          title="Invitation Details"
          size="lg"
        >
          <div className="space-y-4">
            <Card className="bg-neutral-50">
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {showPreview.email}</p>
                <p><strong>Tenant Name:</strong> {showPreview.tenant_name}</p>
                <p><strong>Tenant Code:</strong> {showPreview.tenant_code}</p>
                <p><strong>Tenant Type:</strong> {getTenantTypeDisplay(showPreview.tenant_type)}</p>
                <p><strong>Status:</strong> <Badge variant={getStatusBadge(showPreview.status)}>{showPreview.status}</Badge></p>
                <p><strong>Invited At:</strong> {new Date(showPreview.invited_at).toLocaleString()}</p>
                <p><strong>Expires At:</strong> {new Date(showPreview.expires_at).toLocaleString()}</p>
                {showPreview.accepted_at && (
                  <p><strong>Accepted At:</strong> {new Date(showPreview.accepted_at).toLocaleString()}</p>
                )}
                <p><strong>Public Key:</strong> {showPreview.public_key_uploaded ? '✓ Uploaded' : '✗ Not uploaded'}</p>
                {showPreview.description && (
                  <p><strong>Description:</strong> {showPreview.description}</p>
                )}
              </div>
            </Card>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowPreview(null)}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default KeyManagement
