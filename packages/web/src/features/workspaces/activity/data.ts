export interface ActivityLogItem {
  id: string
  action:
    | 'member_invited'
    | 'member_removed'
    | 'role_updated'
    | 'api_key_created'
    | 'webhook_added'
    | 'plan_upgraded'
    | 'workspace_created'
    | 'settings_updated'
  title: string
  description: string
  actor: {
    name: string
    email: string
    avatar?: string
  }
  target?: string
  timestamp: string
  relativeTime: string
  metadata?: Record<string, unknown>
}

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act_101',
    action: 'plan_upgraded',
    title: 'Workspace Subscription Upgraded',
    description: 'Upgraded workspace plan from Sandbox to Professional (Billed Monthly).',
    actor: {
      name: 'Huu Ha',
      email: 'huuha@flyx.dev',
    },
    timestamp: '2026-11-20 11:45:00',
    relativeTime: '15 minutes ago',
    metadata: { oldPlan: 'sandbox', newPlan: 'pro' },
  },
  {
    id: 'act_102',
    action: 'api_key_created',
    title: 'New API Key Created',
    description: 'Generated credential "Production Worker API" with read & write scopes.',
    actor: {
      name: 'Huu Ha',
      email: 'huuha@flyx.dev',
    },
    timestamp: '2026-11-20 10:10:22',
    relativeTime: '2 hours ago',
  },
  {
    id: 'act_103',
    action: 'member_invited',
    title: 'Teammate Invited to Workspace',
    description: 'Invited Sarah Connor (sarah.connor@example.com) with Admin role.',
    actor: {
      name: 'Huu Ha',
      email: 'huuha@flyx.dev',
    },
    target: 'sarah.connor@example.com',
    timestamp: '2026-11-19 16:30:00',
    relativeTime: 'Yesterday',
  },
  {
    id: 'act_104',
    action: 'webhook_added',
    title: 'Webhook Destination Registered',
    description: 'Added HTTPS endpoint https://api.acmecorp.com/webhooks for 3 event topics.',
    actor: {
      name: 'Huu Ha',
      email: 'huuha@flyx.dev',
    },
    timestamp: '2026-11-18 14:00:15',
    relativeTime: '2 days ago',
  },
  {
    id: 'act_105',
    action: 'role_updated',
    title: 'Member Role Modified',
    description: 'Promoted Jordan Lee from Member to Editor in Engineering workspace.',
    actor: {
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
    },
    target: 'Jordan Lee',
    timestamp: '2026-11-17 09:12:44',
    relativeTime: '3 days ago',
  },
  {
    id: 'act_106',
    action: 'workspace_created',
    title: 'Workspace Initialized',
    description: 'Workspace "Engineering" created with default Sandbox tier limits.',
    actor: {
      name: 'Huu Ha',
      email: 'huuha@flyx.dev',
    },
    timestamp: '2026-11-10 08:00:00',
    relativeTime: '10 days ago',
  },
]
