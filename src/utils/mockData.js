export const OAUTH_CONFIG = {
  clientId: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  redirectUri: 'http://localhost:5173/auth/callback',
}

export const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export const MINISTRIES = [
  'Health & Family Welfare',
  'Education',
  'Infrastructure',
  'Agriculture',
  'Defense',
  'Finance',
  'Home Affairs',
  'External Affairs',
  'Labour & Employment',
  'Social Justice',
  'Environment',
  'Transport',
  'Energy',
  'Telecommunications',
  'Commerce & Industry',
]

export const BUDGET_DATA = {
  totalAllocation: 50000000000, // 50 billion
  totalSpent: 42300000000,
  totalUnderUtilized: 7700000000,
  statewise: [
    { state: 'Andhra Pradesh', allocated: 2500000000, spent: 2100000000, percentage: 84 },
    { state: 'Karnataka', allocated: 2200000000, spent: 1950000000, percentage: 88 },
    { state: 'Maharashtra', allocated: 2800000000, spent: 2650000000, percentage: 94 },
    { state: 'Uttar Pradesh', allocated: 3100000000, spent: 2550000000, percentage: 82 },
    { state: 'Tamil Nadu', allocated: 2000000000, spent: 1900000000, percentage: 95 },
    { state: 'Gujarat', allocated: 1900000000, spent: 1700000000, percentage: 89 },
    { state: 'Delhi', allocated: 1600000000, spent: 1550000000, percentage: 96 },
    { state: 'Rajasthan', allocated: 1400000000, spent: 1100000000, percentage: 78 },
    { state: 'Kerala', allocated: 1300000000, spent: 1250000000, percentage: 96 },
    { state: 'Punjab', allocated: 1100000000, spent: 850000000, percentage: 77 },
  ],
  ministrywise: [
    { ministry: 'Education', allocated: 8000000000, spent: 7600000000, percentage: 95 },
    { ministry: 'Health & Family Welfare', allocated: 6500000000, spent: 5800000000, percentage: 89 },
    { ministry: 'Infrastructure', allocated: 9000000000, spent: 7200000000, percentage: 80 },
    { ministry: 'Agriculture', allocated: 5000000000, spent: 4200000000, percentage: 84 },
    { ministry: 'Defense', allocated: 7000000000, spent: 6800000000, percentage: 97 },
    { ministry: 'Home Affairs', allocated: 5500000000, spent: 5100000000, percentage: 92 },
    { ministry: 'Social Justice', allocated: 3000000000, spent: 2700000000, percentage: 90 },
    { ministry: 'Environment', allocated: 2000000000, spent: 1400000000, percentage: 70 },
  ],
  monthlyTrend: [
    { month: 'Jan', spent: 2500000000, allocated: 4167000000 },
    { month: 'Feb', spent: 2700000000, allocated: 4167000000 },
    { month: 'Mar', spent: 3000000000, allocated: 4167000000 },
    { month: 'Apr', spent: 3200000000, allocated: 4167000000 },
    { month: 'May', spent: 3500000000, allocated: 4167000000 },
    { month: 'Jun', spent: 3800000000, allocated: 4167000000 },
    { month: 'Jul', spent: 4100000000, allocated: 4167000000 },
    { month: 'Aug', spent: 4300000000, allocated: 4167000000 },
    { month: 'Sep', spent: 4600000000, allocated: 4167000000 },
    { month: 'Oct', spent: 4900000000, allocated: 4167000000 },
    { month: 'Nov', spent: 5100000000, allocated: 4167000000 },
    { month: 'Dec', spent: 5600000000, allocated: 4167000000 },
  ],
}

export const ANOMALIES = [
  {
    id: 'ANM001',
    type: 'Unusual Spending Pattern',
    severity: 'high',
    state: 'Punjab',
    ministry: 'Infrastructure',
    amount: 450000000,
    threshold: 300000000,
    description: 'Expenditure exceeded budget by 50% in Q3',
    date: '2024-03-10',
    status: 'flagged',
  },
  {
    id: 'ANM002',
    type: 'Underspend Detection',
    severity: 'medium',
    state: 'Rajasthan',
    ministry: 'Education',
    amount: 250000000,
    threshold: 500000000,
    description: 'Budget utilization only 50% despite allocation',
    date: '2024-03-08',
    status: 'investigating',
  },
  {
    id: 'ANM003',
    type: 'Irregular Transaction',
    severity: 'high',
    state: 'Uttar Pradesh',
    ministry: 'Health & Family Welfare',
    amount: 120000000,
    threshold: 50000000,
    description: 'Large fund transfer detected without prior notice',
    date: '2024-03-05',
    status: 'resolved',
  },
  {
    id: 'ANM004',
    type: 'Potential Leakage',
    severity: 'critical',
    state: 'Bihar',
    ministry: 'Agriculture',
    amount: 200000000,
    threshold: 100000000,
    description: 'Discrepancy between allocation and actual disbursement',
    date: '2024-03-02',
    status: 'flagged',
  },
]

export const PREDICTIVE_MODELS = [
  {
    fiscal_year: '2024-25',
    andhra_pradesh: 2600000000,
    karnataka: 2400000000,
    maharashtra: 2950000000,
    uttar_pradesh: 3250000000,
    tamil_nadu: 2150000000,
  },
  {
    fiscal_year: '2025-26',
    andhra_pradesh: 2750000000,
    karnataka: 2550000000,
    maharashtra: 3100000000,
    uttar_pradesh: 3400000000,
    tamil_nadu: 2300000000,
  },
  {
    fiscal_year: '2026-27',
    andhra_pradesh: 2900000000,
    karnataka: 2700000000,
    maharashtra: 3250000000,
    uttar_pradesh: 3550000000,
    tamil_nadu: 2450000000,
  },
]

export const RISK_FORECAST = [
  {
    state: 'Andhra Pradesh',
    lapse_risk: 12,
    underutilization_risk: 'low',
    recommendation: 'Maintain current allocation',
  },
  {
    state: 'Punjab',
    lapse_risk: 35,
    underutilization_risk: 'high',
    recommendation: 'Increase monitoring, consider reallocation',
  },
  {
    state: 'Rajasthan',
    lapse_risk: 28,
    underutilization_risk: 'medium',
    recommendation: 'Enhance capacity building initiatives',
  },
  {
    state: 'Bihar',
    lapse_risk: 42,
    underutilization_risk: 'critical',
    recommendation: 'Immediate intervention required',
  },
]

export const SAMPLE_EMPLOYEES = [
  {
    id: 'EMP001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@maharashtra.gov.in',
    role: 'State Budget Officer',
    state: 'Maharashtra',
    invitationSent: '2024-03-01',
    status: 'active',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg...',
  },
  {
    id: 'EMP002',
    name: 'Priya Sharma',
    email: 'priya.sharma@delhi.gov.in',
    role: 'Finance Ministry Representative',
    state: 'Delhi',
    invitationSent: '2024-02-28',
    status: 'active',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAssA1FQI...',
  },
  {
    id: 'EMP003',
    name: 'Amit Patel',
    email: 'amit.patel@health-ministry.gov.in',
    role: 'Health Ministry Official',
    ministry: 'Health & Family Welfare',
    invitationSent: '2024-02-25',
    status: 'pending',
    publicKey: null,
  },
]

export const KEY_GENERATION_SCRIPT = `#!/bin/bash
# Budget Intelligence Platform - Key Generation Script
# This script generates RSA 2048-bit public and private key pairs

echo "Budget Intelligence Platform - Key Generation"
echo "=============================================="

# Check if openssl is installed
if ! command -v openssl &> /dev/null; then
    echo "Error: OpenSSL is not installed. Please install it first."
    echo "Ubuntu/Debian: sudo apt-get install openssl"
    echo "macOS: brew install openssl"
    exit 1
fi

# Create .bip directory if it doesn't exist
mkdir -p ~/.bip

# Generate private key (keep this SECRET)
echo "Generating private key..."
openssl genrsa -out ~/.bip/private_key.pem 2048

# Extract public key from private key
echo "Extracting public key..."
openssl rsa -in ~/.bip/private_key.pem -pubout -out ~/.bip/public_key.pem

echo ""
echo "✓ Key generation completed successfully!"
echo ""
echo "Private Key Location: ~/.bip/private_key.pem"
echo "Public Key Location: ~/.bip/public_key.pem"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "1. Keep your private key SECRET - never share it"
echo "2. Your public key will be uploaded to the platform"
echo "3. Back up your keys in a secure location"
echo ""

# Display public key for copying
echo "Your Public Key (Copy this to the platform):"
echo "============================================"
cat ~/.bip/public_key.pem
`

export const generateMockTransactions = () => {
  return [
    { id: 'TXN001', state: 'Maharashtra', amount: 50000000, type: 'Education', date: '2024-03-10', status: 'completed' },
    { id: 'TXN002', state: 'Karnataka', amount: 35000000, type: 'Health', date: '2024-03-09', status: 'completed' },
    { id: 'TXN003', state: 'Delhi', amount: 75000000, type: 'Infrastructure', date: '2024-03-08', status: 'pending' },
    { id: 'TXN004', state: 'Uttar Pradesh', amount: 45000000, type: 'Agriculture', date: '2024-03-07', status: 'completed' },
    { id: 'TXN005', state: 'Tamil Nadu', amount: 60000000, type: 'Defense', date: '2024-03-06', status: 'flagged' },
  ]
}
