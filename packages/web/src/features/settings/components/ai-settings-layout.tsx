import { Link, useLocation, Outlet } from '@tanstack/react-router'
import { ChevronLeft, Cpu, Sparkles, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { buttonVariants, Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { NotificationCenter } from '@/features/notifications/components/notification-center'
import { ThemeControls } from '@/components/themes/theme-controls'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function AiSettingsLayout() {
  const { t } = useTranslation(['model-provider', 'common'])
  const { pathname } = useLocation()

  return (
    <div className='flex h-full w-full flex-col overflow-hidden'>
      {/* Top Header */}
      <Header>
        <Search className='me-auto' />
        <NotificationCenter />
        <ThemeControls />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* Main Split Layout: Fixed Scrollable Sidebar + Independent Scrollable Content */}
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row'>
        {/* AI Engine Sidebar */}
        <aside className='flex w-full shrink-0 flex-col border-b border-border/70 bg-sidebar/30 lg:h-full lg:w-64 lg:border-b-0 lg:border-r'>
          {/* Back to general settings */}
          <div className='p-3 border-b border-border/50'>
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground h-8 gap-1.5'
            >
              <Link to='/settings'>
                <ChevronLeft className='h-4 w-4' />
                {t('modelProvider.backToSettings', 'Back to Settings')}
              </Link>
            </Button>
          </div>

          {/* AI Engine Navigation Menu */}
          <div className='flex-1 overflow-y-auto p-3 space-y-1.5'>
            <div className='flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80'>
              <Layers className='h-3 w-3' />
              <span>{t('modelProvider.aiEngine', 'AI Engine')}</span>
            </div>

            <Link
              to='/settings/providers'
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                pathname.startsWith('/settings/providers')
                  ? 'bg-muted text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                'w-full justify-start text-sm h-9 px-3 gap-2.5'
              )}
            >
              <Cpu className='h-4 w-4 text-primary' />
              <span>{t('modelProvider.aiProviders', 'AI Providers')}</span>
            </Link>

            <Link
              to='/settings/models'
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                pathname.startsWith('/settings/models')
                  ? 'bg-muted text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                'w-full justify-start text-sm h-9 px-3 gap-2.5'
              )}
            >
              <Sparkles className='h-4 w-4 text-amber-500' />
              <span>{t('modelProvider.aiModels', 'AI Models')}</span>
            </Link>
          </div>

          {/* Sidebar Footer Info */}
          <div className='p-3 border-t border-border/40 text-[11px] text-muted-foreground/70 hidden lg:block'>
            <p className='truncate font-medium'>OpenCode AI Engine</p>
            <p className='truncate text-[10px] text-muted-foreground/50'>
              Manage model routing & providers
            </p>
          </div>
        </aside>

        {/* Independent Scrollable Content Area */}
        <section className='flex-1 min-h-0 h-full overflow-y-auto bg-background/50 px-4 sm:px-8 py-6 select-text'>
          <div className='mx-auto max-w-6xl w-full'>
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  )
}
