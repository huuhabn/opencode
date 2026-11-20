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
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeControls } from '@/components/themes/theme-controls'
import { NotificationCenter } from '@/features/notifications/components/notification-center'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Security & Sessions',
    href: '/settings/security',
    icon: <ShieldCheck size={18} />,
  },
  {
    title: 'API Keys',
    href: '/settings/api-keys',
    icon: <Key size={18} />,
  },
  {
    title: 'Webhooks',
    href: '/settings/webhooks',
    icon: <Webhook size={18} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: <Bell size={18} />,
  },
  {
    title: 'Display',
    href: '/settings/display',
    icon: <Monitor size={18} />,
  },
]

export function Settings() {
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
            Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex min-h-0 w-full flex-1 flex-col overflow-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
