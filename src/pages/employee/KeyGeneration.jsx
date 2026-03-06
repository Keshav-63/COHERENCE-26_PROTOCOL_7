import React, { useState } from 'react'
import { Copy, Download, CheckCircle, AlertCircle, Terminal } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Navigation from '../../components/Navigation'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import { useAuth } from '../../context/AuthContext'
import { showSuccess, showError, showInfo } from '../../utils/utils'
import { KEY_GENERATION_SCRIPT } from '../../utils/mockData'

const KeyGeneration = () => {
  const { user, updateUserProfile } = useAuth()
  const [step, setStep] = useState(user?.publicKey ? 3 : 1)
  const [publicKey, setPublicKey] = useState(user?.publicKey || '')
  const [showScript, setShowScript] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleDownloadScript = () => {
    const element = document.createElement('a')
    const file = new Blob([KEY_GENERATION_SCRIPT], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'key-generation.sh'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    showSuccess('Script downloaded successfully!')
  }

  const handleCopyScript = () => {
    navigator.clipboard.writeText(KEY_GENERATION_SCRIPT)
    showInfo('Script copied to clipboard!')
  }

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(publicKey)
    showInfo('Public key copied to clipboard!')
  }

  const handleSubmitPublicKey = (e) => {
    e.preventDefault()
    if (!publicKey || publicKey.trim().length < 50) {
      showError('Please paste a valid public key')
      return
    }

    updateUserProfile({ publicKey })
    setStep(3)
    showSuccess('Public key uploaded successfully!')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitPublicKey(e)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation role="employee" />

      <main className="md:ml-64 pt-20 md:pt-0">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary-50 to-white border-b border-neutral-200 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold font-display mb-2">
                  <span className="gradient-text">Key Generation</span>
                </h1>
                <p className="text-neutral-600">
                  Generate RSA key pair for secure authentication and data encryption
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        step >= s
                          ? 'bg-primary-900 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {step > s ? <CheckCircle size={24} /> : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                          step > s ? 'bg-primary-900' : 'bg-neutral-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Download Script</span>
                <span>Generate Keys</span>
                <span>Upload Public Key</span>
              </div>
            </div>

            {/* Step 1: Download Script */}
            {step === 1 && (
              <Card shadow="glass" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Step 1: Download the Script</h2>
                  <p className="text-neutral-600">
                    Download the key generation script to your computer. This script will help you create a secure
                    RSA key pair.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
                  <AlertCircle size={20} className="text-blue-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-bold mb-1">Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Linux/macOS with bash shell, or Windows with WSL</li>
                      <li>OpenSSL installed (usually pre-installed)</li>
                      <li>~5 minutes to complete the process</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleDownloadScript}
                  >
                    <Download size={20} className="mr-2" />
                    Download Script (key-generation.sh)
                  </Button>

                  <button
                    onClick={() => setShowScript(true)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 text-neutral-700 font-medium hover:border-primary-900 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Terminal size={20} />
                    View Script Contents
                  </button>
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Next Steps:</h3>
                  <ol className="text-sm text-neutral-700 space-y-2 list-decimal list-inside">
                    <li>Download the script to your computer</li>
                    <li>Open your terminal/command prompt</li>
                    <li>Navigate to the download folder</li>
                    <li>Run: bash key-generation.sh</li>
                    <li>Your keys will be saved to ~/.bip/ directory</li>
                  </ol>
                </div>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  I've Generated My Keys →
                </Button>
              </Card>
            )}

            {/* Step 2: Upload Public Key */}
            {step === 2 && (
              <Card shadow="glass" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Step 2: Upload Your Public Key</h2>
                  <p className="text-neutral-600">
                    Paste your public key (from ~/.bip/public_key.pem) below. Keep your private key secret!
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3">
                  <AlertCircle size={20} className="text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-bold mb-1">Security Reminder:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Never share your private key with anyone</li>
                      <li>Only your public key should be uploaded here</li>
                      <li>Keep backups of both keys in a secure location</li>
                      <li>We will never request your private key</li>
                    </ul>
                  </div>
                </div>

                <form onSubmit={handleSubmitPublicKey} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Your Public Key (BEGIN PUBLIC KEY ... END PUBLIC KEY)
                    </label>
                    <textarea
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...
-----END PUBLIC KEY-----"
                      className="w-full h-40 px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary-900 focus:outline-none font-mono text-xs resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    className="w-full"
                    onClick={handleSubmitPublicKey}
                  >
                    <CheckCircle size={20} className="mr-2" />
                    Upload Public Key
                  </Button>
                </form>

                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Tips:</h3>
                  <ul className="text-sm text-neutral-700 space-y-2">
                    <li>✓ Open ~/.bip/public_key.pem with a text editor</li>
                    <li>✓ Copy the entire content including BEGIN and END lines</li>
                    <li>✓ Paste it in the textarea above</li>
                    <li>✓ Click Upload when ready</li>
                  </ul>
                </div>

                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  ← Back to Step 1
                </Button>
              </Card>
            )}

            {/* Step 3: Completion */}
            {step === 3 && (
              <Card shadow="glass" className="space-y-6">
                <div className="text-center py-6">
                  <div className="inline-block p-4 bg-emerald-100 rounded-full mb-4">
                    <CheckCircle size={48} className="text-emerald-700" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Setup Complete!</h2>
                  <p className="text-neutral-600 mb-4">
                    Your public key has been securely stored. You can now access all platform features.
                  </p>
                  <div className="inline-block">
                    <Badge variant="success">Public Key Verified</Badge>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                  <h3 className="font-bold text-emerald-900 mb-2">What You Can Now Do:</h3>
                  <ul className="text-sm text-emerald-800 space-y-2 list-disc list-inside">
                    <li>View budget allocation for your state/ministry</li>
                    <li>Analyze spending patterns and trends</li>
                    <li>Monitor and report anomalies</li>
                    <li>Access predictive models and forecasts</li>
                    <li>Download reports and analytics</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Your Public Key (Read-Only)
                    </label>
                    <div className="relative">
                      <textarea
                        value={publicKey}
                        readOnly
                        className="w-full h-32 px-4 py-3 rounded-lg border-2 border-neutral-200 bg-neutral-50 font-mono text-xs resize-none"
                      />
                      <button
                        onClick={handleCopyPublicKey}
                        className="absolute top-3 right-3 p-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                      >
                        <Copy size={16} className="text-neutral-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <Link to="/employee/budget-analytics" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Go to Budget Analytics →
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  Change Public Key
                </Button>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* Script Preview Modal */}
      <Modal
        isOpen={showScript}
        onClose={() => setShowScript(false)}
        title="Key Generation Script"
        size="xl"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopyScript}>
              <Copy size={16} className="mr-2" />
              Copy
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownloadScript}>
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>

          <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed h-96 overflow-y-auto">
            {KEY_GENERATION_SCRIPT}
          </pre>
        </div>
      </Modal>
    </div>
  )
}

// Import Link from react-router-dom
import { Link } from 'react-router-dom'

export default KeyGeneration
