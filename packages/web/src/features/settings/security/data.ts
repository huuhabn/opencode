export interface SessionItem {
  id: string
  device: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  ipAddress: string
  location: string
  isCurrent: boolean
  lastActive: string
}

export interface LoginActivityItem {
  id: string
  timestamp: string
  ipAddress: string
  location: string
  device: string
  status: 'success' | 'failed'
  authMethod: 'password' | 'google_oauth' | 'magic_link'
}

export const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: 'sess_current',
    device: 'desktop',
    browser: 'Chrome 147.0',
    os: 'macOS Sonoma',
    ipAddress: '113.161.72.19',
    location: 'Ho Chi Minh City, Vietnam',
    isCurrent: true,
    lastActive: 'Active now',
  },
  {
    id: 'sess_mobile',
    device: 'mobile',
    browser: 'Mobile Safari 18.1',
    os: 'iOS 18.1',
    ipAddress: '14.169.12.84',
    location: 'Hanoi, Vietnam',
    isCurrent: false,
    lastActive: '4 hours ago',
  },
  {
    id: 'sess_old_laptop',
    device: 'desktop',
    browser: 'Firefox 132.0',
    os: 'Windows 11',
    ipAddress: '118.69.182.4',
    location: 'Da Nang, Vietnam',
    isCurrent: false,
    lastActive: '3 days ago',
  },
]

export const INITIAL_LOGIN_ACTIVITY: LoginActivityItem[] = [
  {
    id: 'act_1',
    timestamp: '2026-11-20 11:20:14',
    ipAddress: '113.161.72.19',
    location: 'Ho Chi Minh City, Vietnam',
    device: 'Chrome / macOS',
    status: 'success',
    authMethod: 'password',
  },
  {
    id: 'act_2',
    timestamp: '2026-11-20 07:15:30',
    ipAddress: '14.169.12.84',
    location: 'Hanoi, Vietnam',
    device: 'Safari / iOS',
    status: 'success',
    authMethod: 'google_oauth',
  },
  {
    id: 'act_3',
    timestamp: '2026-11-19 22:40:02',
    ipAddress: '198.51.100.24',
    location: 'Frankfurt, Germany',
    device: 'Unknown / Linux',
    status: 'failed',
    authMethod: 'password',
  },
]
