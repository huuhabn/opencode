export interface ApiKeyItem {
  id: string
  name: string
  prefix: string
  scopes: ('read' | 'write' | 'admin')[]
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
}

export interface WebhookEndpointItem {
  id: string
  url: string
  description: string
  events: string[]
  secret: string
  isActive: boolean
  createdAt: string
}

export interface WebhookLogItem {
  id: string
  endpointId: string
  event: string
  statusCode: number
  deliveredAt: string
  durationMs: number
  requestPayload: Record<string, unknown>
  responseBody: string
}

export const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key_1',
    name: 'Production Worker API',
    prefix: 'sk_live_9a8f2...',
    scopes: ['read', 'write'],
    createdAt: '2026-10-15',
    lastUsedAt: '12 minutes ago',
    expiresAt: '2027-10-15',
  },
  {
    id: 'key_2',
    name: 'CI/CD Deployment Token',
    prefix: 'sk_live_4b7e1...',
    scopes: ['read'],
    createdAt: '2026-09-01',
    lastUsedAt: '3 hours ago',
    expiresAt: null,
  },
]

export const AVAILABLE_WEBHOOK_EVENTS = [
  'user.created',
  'user.deleted',
  'workspace.updated',
  'workspace.member_invited',
  'workspace.role_updated',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'subscription.upgraded',
]

export const INITIAL_WEBHOOKS: WebhookEndpointItem[] = [
  {
    id: 'wh_1',
    url: 'https://api.acmecorp.com/webhooks/saas-events',
    description: 'Production event sync to Data Warehouse',
    events: ['invoice.payment_succeeded', 'subscription.upgraded', 'user.created'],
    secret: 'whsec_89dfa8917263b827e1...',
    isActive: true,
    createdAt: '2026-08-20',
  },
  {
    id: 'wh_2',
    url: 'https://hooks.slack.com/services/T00/B00/X00',
    description: 'Slack notification bot for new workspace invites',
    events: ['workspace.member_invited'],
    secret: 'whsec_1241aaef98124578b9...',
    isActive: true,
    createdAt: '2026-10-02',
  },
]

export const INITIAL_WEBHOOK_LOGS: WebhookLogItem[] = [
  {
    id: 'log_101',
    endpointId: 'wh_1',
    event: 'invoice.payment_succeeded',
    statusCode: 200,
    deliveredAt: '2 minutes ago',
    durationMs: 142,
    requestPayload: { invoiceId: 'inv_10492', amount: 79, status: 'paid' },
    responseBody: '{"received": true}',
  },
  {
    id: 'log_102',
    endpointId: 'wh_1',
    event: 'subscription.upgraded',
    statusCode: 200,
    deliveredAt: '1 hour ago',
    durationMs: 98,
    requestPayload: { workspaceId: 'ws_engineering', plan: 'pro' },
    responseBody: '{"ok": true}',
  },
  {
    id: 'log_103',
    endpointId: 'wh_2',
    event: 'workspace.member_invited',
    statusCode: 500,
    deliveredAt: '3 hours ago',
    durationMs: 840,
    requestPayload: { email: 'alex.rivera@example.com', role: 'editor' },
    responseBody: '{"error": "Internal Slack Gateway Timeout"}',
  },
]
