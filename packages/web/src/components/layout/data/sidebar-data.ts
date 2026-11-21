import { useMemo } from 'react'
import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Building2,
  CreditCard,
  Inbox,
  Database,
  Package,
  ShoppingBag,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Key,
  Webhook,
  Activity,
  Compass,
  Cpu,
  Sparkles,
  Bot,
  FolderGit2,
  FolderKanban,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export function useSidebarData(): SidebarData {
  const { t } = useTranslation(['platform', 'model-provider', 'common'])

  return useMemo<SidebarData>(
    () => ({
      user: {
        name: 'vexaltrix',
        email: 'huuhadev@gmail.com',
        avatar: '/avatars/shadcn.jpg',
      },
      teams: [
        {
          name: 'Shadcn Admin',
          logo: Command,
          plan: 'Vite + ShadcnUI',
        },
        {
          name: 'Acme Inc',
          logo: GalleryVerticalEnd,
          plan: 'Enterprise',
        },
        {
          name: 'Acme Corp.',
          logo: AudioWaveform,
          plan: 'Startup',
        },
      ],
      navGroups: [
        {
          title: t('General', 'General'),
          items: [
            {
              title: t('Dashboard', 'Dashboard'),
              url: '/',
              icon: LayoutDashboard,
            },
            {
              title: t('Products', 'Products'),
              url: '/products',
              icon: ShoppingBag,
            },
            {
              title: t('Workspaces', 'Workspaces'),
              icon: Building2,
              items: [
                {
                  title: t('Overview', 'Overview'),
                  url: '/workspaces',
                  icon: Building2,
                },
                {
                  title: t('Team & Members', 'Team & Members'),
                  url: '/workspaces/team',
                  icon: Users,
                },
                {
                  title: t('Audit & Activity', 'Audit & Activity'),
                  url: '/workspaces/activity',
                  icon: Activity,
                },
              ],
            },
            {
              title: t('Billing & Plans', 'Billing & Plans'),
              url: '/billing',
              icon: CreditCard,
            },
            {
              title: t('Notifications', 'Notifications'),
              url: '/notifications',
              icon: Inbox,
            },
            {
              title: t('React Query', 'React Query'),
              url: '/react-query',
              icon: Database,
            },
            {
              title: t('Tasks', 'Tasks'),
              url: '/tasks',
              icon: ListTodo,
            },
            {
              title: t('Apps', 'Apps'),
              url: '/apps',
              icon: Package,
            },
            {
              title: t('Chats', 'Chats'),
              url: '/chats',
              badge: '3',
              icon: MessagesSquare,
            },
            {
              title: t('Users', 'Users'),
              url: '/users',
              icon: Users,
            },
            {
              title: t('Secured by Clerk', 'Secured by Clerk'),
              icon: ClerkLogo,
              items: [
                {
                  title: t('Sign In', 'Sign In'),
                  url: '/clerk/sign-in',
                },
                {
                  title: t('Sign Up', 'Sign Up'),
                  url: '/clerk/sign-up',
                },
                {
                  title: t('User Management', 'User Management'),
                  url: '/clerk/user-management',
                },
              ],
            },
          ],
        },
        {
          title: t('modelProvider.aiEngine', {
            ns: 'model-provider',
            defaultValue: 'AI Engine',
          }),
          items: [
            {
              title: t('session.title', {
                ns: 'model-provider',
                defaultValue: 'AI Agent Chat',
              }),
              url: '/session',
              icon: Bot,
            },
            {
              title: t('modelProvider.aiProviders', 'AI Providers'),
              url: '/settings/providers',
              icon: Cpu,
            },
            {
              title: t('modelProvider.aiModels', 'AI Models'),
              url: '/settings/models',
              icon: Sparkles,
            },
            {
              title: t('settings.workspaces.title', {
                ns: 'model-provider',
                defaultValue: 'Workspaces',
              }),
              url: '/settings/workspaces',
              icon: FolderGit2,
            },
            {
              title: t('settings.projects.title', {
                ns: 'model-provider',
                defaultValue: 'Projects',
              }),
              url: '/settings/projects',
              icon: FolderKanban,
            },
            {
              title: t('Auth', 'Auth'),
              icon: ShieldCheck,
              items: [
                {
                  title: t('Sign In', 'Sign In'),
                  url: '/sign-in',
                },
                {
                  title: t('Sign In (2 Col)', 'Sign In (2 Col)'),
                  url: '/sign-in-2',
                },
                {
                  title: t('Sign Up', 'Sign Up'),
                  url: '/sign-up',
                },
                {
                  title: t('Forgot Password', 'Forgot Password'),
                  url: '/forgot-password',
                },
                {
                  title: t('OTP', 'OTP'),
                  url: '/otp',
                },
              ],
            },
            {
              title: t('Errors', 'Errors'),
              icon: Bug,
              items: [
                {
                  title: t('Unauthorized', 'Unauthorized'),
                  url: '/errors/unauthorized',
                  icon: Lock,
                },
                {
                  title: t('Forbidden', 'Forbidden'),
                  url: '/errors/forbidden',
                  icon: UserX,
                },
                {
                  title: t('Not Found', 'Not Found'),
                  url: '/errors/not-found',
                  icon: FileX,
                },
                {
                  title: t('Internal Server Error', 'Internal Server Error'),
                  url: '/errors/internal-server-error',
                  icon: ServerOff,
                },
                {
                  title: t('Maintenance Error', 'Maintenance Error'),
                  url: '/errors/maintenance-error',
                  icon: Construction,
                },
              ],
            },
          ],
        },
        {
          title: t('Other', 'Other'),
          items: [
            {
              title: t('Settings', 'Settings'),
              icon: Settings,
              items: [
                {
                  title: t('modelProvider.profile', {
                    ns: 'model-provider',
                    defaultValue: t('Profile', 'Profile'),
                  }),
                  url: '/settings',
                  icon: UserCog,
                },
                {
                  title: t('modelProvider.account', {
                    ns: 'model-provider',
                    defaultValue: t('Account', 'Account'),
                  }),
                  url: '/settings/account',
                  icon: Wrench,
                },
                {
                  title: t('modelProvider.securityAndSessions', {
                    ns: 'model-provider',
                    defaultValue: t(
                      'Security & Sessions',
                      'Security & Sessions'
                    ),
                  }),
                  url: '/settings/security',
                  icon: ShieldCheck,
                },
                {
                  title: t('modelProvider.apiKeys', {
                    ns: 'model-provider',
                    defaultValue: t('API Keys', 'API Keys'),
                  }),
                  url: '/settings/api-keys',
                  icon: Key,
                },
                {
                  title: t('modelProvider.webhooks', {
                    ns: 'model-provider',
                    defaultValue: t('Webhooks', 'Webhooks'),
                  }),
                  url: '/settings/webhooks',
                  icon: Webhook,
                },
                {
                  title: t('modelProvider.appearance', {
                    ns: 'model-provider',
                    defaultValue: t('Appearance', 'Appearance'),
                  }),
                  url: '/settings/appearance',
                  icon: Palette,
                },
                {
                  title: t('modelProvider.notifications', {
                    ns: 'model-provider',
                    defaultValue: t('Notifications', 'Notifications'),
                  }),
                  url: '/settings/notifications',
                  icon: Bell,
                },
                {
                  title: t('modelProvider.display', {
                    ns: 'model-provider',
                    defaultValue: t('Display', 'Display'),
                  }),
                  url: '/settings/display',
                  icon: Monitor,
                },
                {
                  title: t('settings.workspaces.title', {
                    ns: 'model-provider',
                    defaultValue: 'Workspaces',
                  }),
                  url: '/settings/workspaces',
                  icon: FolderGit2,
                },
                {
                  title: t('settings.projects.title', {
                    ns: 'model-provider',
                    defaultValue: 'Projects',
                  }),
                  url: '/settings/projects',
                  icon: FolderKanban,
                },
              ],
            },
            {
              title: t('Onboarding Demo', 'Onboarding Demo'),
              url: '/onboarding',
              icon: Compass,
            },
            {
              title: t('Help Center', 'Help Center'),
              url: '/help-center',
              icon: HelpCircle,
            },
          ],
        },
      ],
    }),
    [t]
  )
}

export const sidebarData: SidebarData = {
  user: {
    name: 'vexaltrix',
    email: 'huuhadev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Products',
          url: '/products',
          icon: ShoppingBag,
        },
        {
          title: 'Workspaces',
          icon: Building2,
          items: [
            {
              title: 'Overview',
              url: '/workspaces',
              icon: Building2,
            },
            {
              title: 'Team & Members',
              url: '/workspaces/team',
              icon: Users,
            },
            {
              title: 'Audit & Activity',
              url: '/workspaces/activity',
              icon: Activity,
            },
          ],
        },
        {
          title: 'Billing & Plans',
          url: '/billing',
          icon: CreditCard,
        },
        {
          title: 'Notifications',
          url: '/notifications',
          icon: Inbox,
        },
        {
          title: 'React Query',
          url: '/react-query',
          icon: Database,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Secured by Clerk',
          icon: ClerkLogo,
          items: [
            {
              title: 'Sign In',
              url: '/clerk/sign-in',
            },
            {
              title: 'Sign Up',
              url: '/clerk/sign-up',
            },
            {
              title: 'User Management',
              url: '/clerk/user-management',
            },
          ],
        },
      ],
    },
    {
      title: 'AI Engine',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Security & Sessions',
              url: '/settings/security',
              icon: ShieldCheck,
            },
            {
              title: 'API Keys',
              url: '/settings/api-keys',
              icon: Key,
            },
            {
              title: 'Webhooks',
              url: '/settings/webhooks',
              icon: Webhook,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Onboarding Demo',
          url: '/onboarding',
          icon: Compass,
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
