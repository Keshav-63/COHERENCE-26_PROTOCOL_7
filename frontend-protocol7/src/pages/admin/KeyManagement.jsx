import React, { useState } from 'react'
import { Mail, Copy, Send, Eye, EyeOff, CheckCircle, Clock } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Navigation from '../../components/Navigation'
import Badge from '../../components/Badge'
import { showSuccess, showError, showInfo, generateTemporaryPassword, generateInvitationToken, validateEmail } from '../../utils/utils'
import { SAMPLE_EMPLOYEES } from '../../utils/mockData'

const KeyManagement = () => {
  const [employees, setEmployees] = useState(SAMPLE_EMPLOYEES)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('state')
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [invitationToken, setInvitationToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSendInvitation = async (e) => {
    e.preventDefault()
    if (!email || !validateEmail(email)) {
      showError('Please enter a valid email address')
      return
    }

    setLoading(true)
    // Simulate sending email
    setTimeout(() => {
      try {
        const tempPass = generateTemporaryPassword()
        const token = generateInvitationToken()
        
        const newEmployee = {
          id: `EMP${Date.now()}`,
          email,
          role: role === 'state' ? 'State Budget Officer' : 'Ministry Official',
          invitationSent: new Date().toISOString().split('T')[0],
          status: 'pending',
          publicKey: null,
        }

        setEmployees([...employees, newEmployee])
        setTempPassword(tempPass)
        setInvitationToken(token)
        setShowPasswordModal(true)
        setEmail('')
        showSuccess('Invitation sent successfully!')
      } catch (error) {
        showError('Failed to send invitation')
      } finally {
        setLoading(false)
      }
    }, 800)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showInfo('Copied to clipboard!')
  }

  const generateInvitationLink = () => {
    return `${window.location.origin}/employee-access?token=${invitationToken}`
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      pending: 'warning',
      inactive: 'gray',
    }
    return variants[status] || 'gray'
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="official@state.gov.in"
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendInvitation(e)}
                  />

                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Official Type
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="px-4 py-2.5 rounded-lg border-2 border-neutral-200 focus:border-primary-900 focus:outline-none"
                    >
                      <option value="state">State Government</option>
                      <option value="ministry">Ministry</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      loading={loading}
                    >
                      <Send size={20} className="mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            {/* Invited Users List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Invited Officials</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-neutral-200">
                      <th className="text-left py-4 px-4 font-bold text-neutral-700">Email</th>
                      <th className="text-left py-4 px-4 font-bold text-neutral-700">Role</th>
                      <th className="text-left py-4 px-4 font-bold text-neutral-700">Sent Date</th>
                      <th className="text-left py-4 px-4 font-bold text-neutral-700">Status</th>
                      <th className="text-left py-4 px-4 font-bold text-neutral-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200">
                        <td className="py-4 px-4">{emp.email}</td>
                        <td className="py-4 px-4 text-neutral-600">{emp.role}</td>
                        <td className="py-4 px-4 text-sm text-neutral-600">{emp.invitationSent}</td>
                        <td className="py-4 px-4">
                          <Badge variant={getStatusBadge(emp.status)}>
                            {emp.status === 'pending' && <Clock size={12} className="mr-1" />}
                            {emp.status === 'active' && <CheckCircle size={12} className="mr-1" />}
                            {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setShowPreview(emp)}
                            className="text-primary-900 hover:text-primary-800 font-medium text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Invitation Sent Successfully"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Share the following details with the official. They'll need to use these to access the platform for the first time.
          </p>

          <Card className="bg-primary-50 border border-primary-200">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Invitation Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generateInvitationLink()}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-primary-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(generateInvitationLink())}
                    className="p-2 hover:bg-primary-100 rounded-lg transition-colors duration-200"
                  >
                    <Copy size={20} className="text-primary-900" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Temporary Password
                </label>
                <div className="flex gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={tempPassword}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-primary-200 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 hover:bg-primary-100 rounded-lg transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-primary-900" />
                    ) : (
                      <Eye size={20} className="text-primary-900" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(tempPassword)}
                    className="p-2 hover:bg-primary-100 rounded-lg transition-colors duration-200"
                  >
                    <Copy size={20} className="text-primary-900" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ This temporary password is valid only for the first login. The official can set a new password or use OAuth after that.
            </p>
          </div>

          <Button variant="primary" className="w-full" onClick={() => setShowPasswordModal(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default KeyManagement
