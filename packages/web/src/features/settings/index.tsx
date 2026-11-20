import { useMemo } from 'react'
import { Outlet } from '@tanstack/react-router'
import {
  Monitor,
  Bell,
  Palette,
  Wrench,
  UserCog,
  Key,
  Webhook,
  ShieldCheck,
  Cpu,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeControls } from '@/components/themes/theme-controls'
import { NotificationCenter } from '@/features/notifications/components/notification-center'
import { SidebarNav, type NavGroup } from './components/sidebar-nav'

export function Settings() {
  const { t } = useTranslation(['model-provider', 'common'])

  const sidebarNavGroups: NavGroup[] = useMemo(
    () => [
      {
        title: t('modelProvider.aiEngine', 'AI Engine'),
        items: [
          {
            title: t('modelProvider.aiProviders', 'AI Providers'),
            href: '/settings/providers',
            icon: <Cpu size={18} />,
          },
          {
            title: t('modelProvider.aiModels', 'AI Models'),
            href: '/settings/models',
            icon: <Sparkles size={18} />,
          },
        ],
      },
      {
        title: t('modelProvider.accountAndPreferences', 'Account & Preferences'),
        items: [
          {
            title: t('modelProvider.profile', 'Profile'),
            href: '/settings',
            icon: <UserCog size={18} />,
          },
          {
            title: t('modelProvider.account', 'Account'),
            href: '/settings/account',
            icon: <Wrench size={18} />,
          },
          {
            title: t('modelProvider.securityAndSessions', 'Security & Sessions'),
            href: '/settings/security',
            icon: <ShieldCheck size={18} />,
          },
          {
            title: t('modelProvider.auth.apiKeys', 'API Keys'),
            href: '/settings/api-keys',
            icon: <Key size={18} />,
          },
          {
            title: t('modelProvider.webhooks', 'Webhooks'),
            href: '/settings/webhooks',
            icon: <Webhook size={18} />,
          },
          {
            title: t('modelProvider.appearance', 'Appearance'),
            href: '/settings/appearance',
            icon: <Palette size={18} />,
          },
          {
            title: t('modelProvider.notifications', 'Notifications'),
            href: '/settings/notifications',
            icon: <Bell size={18} />,
          },
          {
            title: t('modelProvider.display', 'Display'),
            href: '/settings/display',
            icon: <Monitor size={18} />,
          },
        ],
      },
    ],
    [t]
  )

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search className='me-auto' />
        <NotificationCenter />
        <ThemeControls />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('common:operation.settings', 'Settings')}
          </h1>
          <p className='text-muted-foreground'>
            {t(
              'modelProvider.settingsPageDesc',
              'Configure your AI model providers, models catalog, and account preferences.'
            )}
          </p>
        </div>
        <Separator className='my-4' />
        <div className='flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 flex min-h-0 flex-col lg:sticky lg:h-full lg:w-1/5 lg:shrink-0 lg:overflow-y-auto lg:pe-2'>
            <SidebarNav groups={sidebarNavGroups} />
          </aside>
          <div className='flex min-h-0 w-full flex-1 flex-col overflow-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
