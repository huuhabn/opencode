export interface PlanTier {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  limits: {
    seats: number
    storageGB: number
    apiCallsMonthly: number
  }
  highlight?: boolean
  popular?: boolean
}

export interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  pdfUrl?: string
  planName: string
}

export const BILLING_PLANS: PlanTier[] = [
  {
    id: 'community',
    name: 'Community / Free',
    description: 'For hobbyists, indie developers, and non-commercial projects.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '1 Workspace Member',
      '500MB Cloud Storage',
      '1,000 API calls/month',
      'Community Discord Support',
      'Public Templates Access',
    ],
    limits: {
      seats: 1,
      storageGB: 0.5,
      apiCallsMonthly: 1000,
    },
  },
  {
    id: 'sandbox',
    name: 'Sandbox / Starter',
    description: 'Great for small teams experimenting with SaaS capabilities.',
    monthlyPrice: 19,
    yearlyPrice: 15,
    popular: true,
    features: [
      'Up to 3 Workspace Members',
      '10GB High-speed Storage',
      '50,000 API calls/month',
      'Standard Webhooks & API Keys',
      'Email Support (48h SLA)',
      'Basic Audit Logging (7 days)',
    ],
    limits: {
      seats: 3,
      storageGB: 10,
      apiCallsMonthly: 50000,
    },
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For growing businesses requiring scalability, speed, and priority support.',
    monthlyPrice: 79,
    yearlyPrice: 64,
    highlight: true,
    features: [
      'Up to 10 Workspace Members',
      '50GB High-speed Storage',
      '500,000 API calls/month',
      'Unlimited API Keys & Webhook Endpoints',
      'Role-based Access Control (RBAC)',
      'Priority 24/7 Support',
      'Full Audit Activity Logs (90 days)',
      'Custom Domain Support',
    ],
    limits: {
      seats: 10,
      storageGB: 50,
      apiCallsMonthly: 500000,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Maximum security, custom SLA, compliance, and dedicated engineering.',
    monthlyPrice: 249,
    yearlyPrice: 199,
    features: [
      'Unlimited Workspace Members',
      '1TB+ Dedicated Cloud Storage',
      'Unlimited API Calls with 99.99% SLA',
      'SAML / SSO & Directory Sync (SCIM)',
      'Dedicated Account Manager',
      'Custom Contract & Invoicing',
      'Unlimited Audit History Retention',
    ],
    limits: {
      seats: 9999,
      storageGB: 1000,
      apiCallsMonthly: 10000000,
    },
  },
]

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_10492',
    invoiceNumber: 'INV-2026-003',
    date: '2026-11-01',
    amount: 79,
    status: 'paid',
    planName: 'Professional (Monthly)',
  },
  {
    id: 'inv_10381',
    invoiceNumber: 'INV-2026-002',
    date: '2026-10-01',
    amount: 79,
    status: 'paid',
    planName: 'Professional (Monthly)',
  },
  {
    id: 'inv_10217',
    invoiceNumber: 'INV-2026-001',
    date: '2026-09-01',
    amount: 79,
    status: 'paid',
    planName: 'Professional (Monthly)',
  },
]

export const FEATURE_COMPARISON_MATRIX = [
  {
    category: 'Team & Collaboration',
    features: [
      { name: 'Team Members', free: '1 member', starter: '3 members', pro: '10 members', enterprise: 'Unlimited' },
      { name: 'Workspace Roles (Owner/Admin/Member)', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Granular Custom Roles', free: false, starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Developer & APIs',
    features: [
      { name: 'API Keys', free: '1 key', starter: '5 keys', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Webhook Endpoints', free: false, starter: '2 endpoints', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Monthly API Quota', free: '1,000 reqs', starter: '50,000 reqs', pro: '500,000 reqs', enterprise: 'Custom' },
      { name: 'Rate Limiting Burst', free: '10 req/s', starter: '60 req/s', pro: '300 req/s', enterprise: 'Dedicated' },
    ],
  },
  {
    category: 'Security & Compliance',
    features: [
      { name: 'Active Session Revocation', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Audit & Activity Log Retention', free: '24 hours', starter: '7 days', pro: '90 days', enterprise: 'Unlimited' },
      { name: 'SSO (SAML / Okta / Azure AD)', free: false, starter: false, pro: false, enterprise: true },
      { name: 'Custom SLA & SOC2 Report', free: false, starter: false, pro: false, enterprise: true },
    ],
  },
]
