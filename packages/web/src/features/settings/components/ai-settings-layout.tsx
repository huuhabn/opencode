import { Link, useLocation, Outlet } from '@tanstack/react-router'
import { ChevronLeft, Cpu, Sparkles, Bot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { buttonVariants, Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { Main } from '@/components/layout/main'
import { Separator } from '@/components/ui/separator'
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
      <Main fixed>
        <div className='space-y-0.5'>
          <h2 className='text-xl font-bold tracking-tight md:text-2xl'>
            <span>{t('modelProvider.aiEngine', 'AI Engine')}</span>
          </h2>
          <p className='text-sm text-muted-foreground'>
            {t(
              'modelProvider.aiEngineDesc',
              'Configure your AI model providers, models catalog, and agents configuration.'
            )}
          </p>
        </div>
        <Separator className='my-4' />
        <div className='flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {/* AI Engine Sidebar */}
          <aside className='top-0 flex min-h-0 flex-col lg:sticky lg:h-full lg:w-1/5 lg:shrink-0 lg:overflow-y-auto lg:pe-2'>
            {/* Back to general settings */}
            <div className='py-3 border-b border-border/50'>
              <Button
                variant='ghost'
                size='sm'
                asChild
                className='w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground h-8 gap-1.5 px-0'
              >
                <Link to='/settings'>
                  <ChevronLeft className='h-4 w-4' />
                  {t('modelProvider.backToSettings', 'Back to Settings')}
                </Link>
              </Button>
            </div>

            {/* AI Engine Navigation Menu */}
            <div className='flex-1 overflow-y-auto py-3 space-y-1.5'>
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

              <Link
                to='/settings/agent'
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  pathname.startsWith('/settings/agent')
                    ? 'bg-muted text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  'w-full justify-start text-sm h-9 px-3 gap-2.5'
                )}
              >
                <Bot className='h-4 w-4 text-emerald-500' />
                <span>{t('modelProvider.aiAgent', 'AI Agent')}</span>
              </Link>
            </div>
          </aside>

          {/* Independent Scrollable Content Area */}
          <div className='flex min-h-0 w-full flex-1 flex-col overflow-y-auto scroll-smooth pe-2 sm:pe-4 pb-12 select-text'>
            <div className='w-full max-w-4xl mx-auto lg:mx-0'>
              <Outlet />
            </div>
          </div>
        </div>
      </Main>
    </div>
  )
}
