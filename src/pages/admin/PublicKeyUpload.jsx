import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, Upload, CheckCircle } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuth } from '../../context/AuthContext'
import { showSuccess, showError } from '../../utils/utils'

const PublicKeyUpload = () => {
  const [publicKey, setPublicKey] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { uploadPublicKey, admin } = useAuth()

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!publicKey || publicKey.trim().length < 50) {
      showError('Please enter a valid SSH public key')
      return
    }

    setLoading(true)

    try {
      console.log('🔑 Uploading public key...')
      const response = await uploadPublicKey(publicKey)

      console.log('✅ Public key uploaded successfully!')
      console.log('🔐 Fingerprint:', response.fingerprint)

      showSuccess(`Public key uploaded successfully! Fingerprint: ${response.fingerprint}`)

      // Redirect to dashboard after successful upload
      console.log('🎯 Redirecting to admin dashboard in 1.5s...')
      setTimeout(() => {
        navigate('/admin/dashboard')
      }, 1500)
    } catch (error) {
      console.error('❌ Upload error:', error)
      showError(error.message || 'Failed to upload public key')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPublicKey(event.target.result)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary-900/10 rounded-2xl mb-4">
            <Key size={40} className="text-primary-900" />
          </div>
          <h1 className="text-4xl font-bold font-display text-neutral-900 mb-2">
            <span className="gradient-text">Upload Public Key</span>
          </h1>
          <p className="text-neutral-600">Complete your admin account setup</p>
          {admin && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📧 Logged in as: <strong>{admin.email}</strong>
              </p>
              <p className="text-sm text-blue-800">
                🏢 Tenant: <strong>{admin.tenant_name}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Upload Form */}
        <Card shadow="glass" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">SSH Public Key Required</h2>
            <p className="text-neutral-600">
              Upload your SSH public key to access the admin dashboard and secure your communications.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Upload Public Key File
              </label>
              <input
                type="file"
                accept=".pub"
                onChange={handleFileUpload}
                className="w-full px-4 py-2 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-900 transition-colors cursor-pointer"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Select your .pub file (e.g., id_ed25519.pub or id_rsa.pub)
              </p>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-600">or paste directly</span>
              </div>
            </div>

            {/* Manual Paste */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Paste Public Key
              </label>
              <textarea
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGh... your_email@example.com"
                rows={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 font-mono text-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/10"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Paste the contents of your .pub file here
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                ⚠️ Important: Upload Your PUBLIC Key Only
              </p>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Upload the file ending in .pub (public key)</li>
                <li>NEVER upload your private key (file without .pub extension)</li>
                <li>Supported types: RSA, Ed25519, ECDSA</li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={!publicKey || publicKey.trim().length < 50}
            >
              <Upload size={20} className="mr-2" />
              Upload Public Key
            </Button>
          </form>

          {/* How to Generate Key */}
          <Card className="bg-neutral-50 border border-neutral-200">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-primary-900" />
              How to Generate SSH Keys
            </h3>
            <div className="space-y-3 text-sm text-neutral-700">
              <div>
                <p className="font-medium mb-1">For Ed25519 (Recommended):</p>
                <code className="block bg-neutral-900 text-green-400 p-2 rounded font-mono text-xs">
                  ssh-keygen -t ed25519 -C "your_email@example.com"
                </code>
              </div>
              <div>
                <p className="font-medium mb-1">For RSA:</p>
                <code className="block bg-neutral-900 text-green-400 p-2 rounded font-mono text-xs">
                  ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
                </code>
              </div>
              <div className="border-t border-neutral-300 pt-3 mt-3">
                <p className="font-medium mb-1">Find your public key:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ed25519: <code className="text-xs bg-neutral-200 px-1 rounded">~/.ssh/id_ed25519.pub</code></li>
                  <li>RSA: <code className="text-xs bg-neutral-200 px-1 rounded">~/.ssh/id_rsa.pub</code></li>
                </ul>
              </div>
            </div>
          </Card>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-neutral-600 hover:text-primary-900 transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublicKeyUpload
