import { useState, useEffect, useMemo, useRef, type MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeControls } from '@/components/themes/theme-controls'
import { NotificationCenter } from '@/features/notifications/components/notification-center'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { SessionSidebar } from './components/session-sidebar'
import { SessionHeader } from './components/session-header'
import { SessionTimeline } from './components/session-timeline'
import { SessionComposer } from './components/session-composer'
import { SessionInspector, type InspectorTab } from './components/session-inspector'
import { useResizableWidth } from './hooks/use-resizable-width'
import { deriveSessionBusy } from './lib/session-busy'
import {
  useSessionDetails,
  useSessionMessages,
  useSendPrompt,
  useInterruptSession,
  useCreateSession,
  useDeleteSession,
} from './api'

interface SessionFeatureProps {
  sessionId?: string
}

const ALL_TABS: InspectorTab[] = ['context', 'skills', 'documents']

function ResizeHandle({
  onMouseDown,
  label,
}: {
  onMouseDown: (event: ReactMouseEvent) => void
  label: string
}) {
  return (
    <div
      role='separator'
      aria-orientation='vertical'
      aria-label={label}
      onMouseDown={onMouseDown}
      className='relative z-20 w-1 shrink-0 cursor-col-resize bg-transparent'
    >
      <div className='pointer-events-none absolute inset-y-0 -left-1 -right-1' />
    </div>
  )
}

export function SessionFeature({ sessionId }: SessionFeatureProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const navigate = useNavigate()
  const [quickPrompt, setQuickPrompt] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isInspectorOpen, setIsInspectorOpen] = useState(true)
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('context')
  const [openTabs, setOpenTabs] = useState<InspectorTab[]>(ALL_TABS)
  // Optimistic bridge until session/messages report busy — never folded into deriveSessionBusy.
  const [awaitingTurn, setAwaitingTurn] = useState(false)
  const busyRef = useRef(false)

  const leftSidebar = useResizableWidth('session_sidebar_width', {
    defaultWidth: 280,
    min: 200,
    max: 480,
  })
  const rightSidebar = useResizableWidth('session_inspector_width', {
    defaultWidth: 320,
    min: 240,
    max: 560,
  })

  const { data: session = null, refetch: refetchSession } = useSessionDetails(sessionId)

  const sendPromptMutation = useSendPrompt()
  const interruptMutation = useInterruptSession()
  const createSessionMutation = useCreateSession()
  const deleteSessionMutation = useDeleteSession()

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
    isFetching: isFetchingMessages,
  } = useSessionMessages(sessionId, {
    live: true,
    fast: awaitingTurn || busyRef.current,
  })

  const sessionBusy = useMemo(() => deriveSessionBusy(session, messages), [session, messages])
  busyRef.current = sessionBusy
  const isStreaming = awaitingTurn || sessionBusy

  useEffect(() => {
    if (!awaitingTurn) return
    if (sessionBusy) {
      setAwaitingTurn(false)
      return
    }
    // Clear once this turn shows an assistant or idle — keep waiting after a fresh user message.
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]
      if (message.type === 'idle') {
        setAwaitingTurn(false)
        return
      }
      if (message.type === 'user') return
      if (message.type === 'assistant') {
        setAwaitingTurn(false)
        return
      }
    }
  }, [awaitingTurn, sessionBusy, messages])

  useEffect(() => {
    if (!sessionId || !isStreaming) return
    const timer = setInterval(() => {
      void refetchSession()
    }, 800)
    return () => clearInterval(timer)
  }, [sessionId, isStreaming, refetchSession])

  const handleSend = async (
    text: string,
    model?: { id: string; providerID: string; variant?: string },
    agent?: string
  ) => {
    let currentId = sessionId

    try {
      setAwaitingTurn(true)

      if (!currentId) {
        const newSession = await createSessionMutation.mutateAsync({
          title: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
          model,
          agent,
        })
        if (!newSession?.id) throw new Error('Failed to create session')
        currentId = newSession.id
        navigate({ to: '/session/$sessionId', params: { sessionId: currentId } })
      }

      await sendPromptMutation.mutateAsync({
        sessionID: currentId,
        text,
        model,
        agent,
      })
      await Promise.all([refetchMessages(), refetchSession()])
    } catch (err: unknown) {
      setAwaitingTurn(false)
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
    } finally {
      setQuickPrompt('')
    }
  }

  const handleInterrupt = async () => {
    if (!sessionId) return
    try {
      await interruptMutation.mutateAsync(sessionId)
      setAwaitingTurn(false)
      await Promise.all([refetchMessages(), refetchSession()])
      toast.info(t('session.interrupted', 'Agent generation stopped'))
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
    }
  }

  const handleDeleteSession = async () => {
    if (!sessionId) return
    try {
      await deleteSessionMutation.mutateAsync(sessionId)
      toast.success(t('session.deleteSuccess', 'Conversation deleted'))
      navigate({ to: '/session' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
    }
  }

  const toggleInspector = () => {
    setIsInspectorOpen((prev) => {
      if (!prev) {
        setInspectorTab('context')
        setOpenTabs(ALL_TABS)
      }
      return !prev
    })
  }

  const closeInspectorTab = (tab: InspectorTab) => {
    const next = openTabs.filter((item) => item !== tab)
    if (next.length === 0) {
      setIsInspectorOpen(false)
      setOpenTabs(ALL_TABS)
      return
    }
    setOpenTabs(next)
    if (inspectorTab === tab) setInspectorTab(next[0])
  }

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <NotificationCenter />
        <ThemeControls />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed className='p-0 sm:p-0 md:p-0 lg:p-0 overflow-hidden min-h-0 flex-1'>
        <div className='flex h-full w-full min-h-0 overflow-hidden bg-background'>
          {isSidebarOpen && (
            <>
              <aside
                style={{ width: leftSidebar.width }}
                className='h-full shrink-0 flex flex-col min-h-0 overflow-hidden'
              >
                <SessionSidebar
                  currentSessionId={sessionId}
                  onCollapse={() => setIsSidebarOpen(false)}
                />
              </aside>
              <ResizeHandle
                label={t('session.resizeSidebar', 'Resize session list')}
                onMouseDown={(event) => leftSidebar.beginResize(event, 1)}
              />
            </>
          )}

          <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background relative h-full'>
            <SessionHeader
              session={session}
              isRefreshing={isFetchingMessages}
              isSidebarOpen={isSidebarOpen}
              isInspectorOpen={isInspectorOpen}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              onToggleInspector={toggleInspector}
              onRefresh={() => {
                refetchSession()
                refetchMessages()
              }}
              onDelete={handleDeleteSession}
            />

            <SessionTimeline
              messages={messages}
              isLoading={isLoadingMessages && !!sessionId}
              isStreaming={isStreaming}
              onQuickPrompt={(p) => setQuickPrompt(p)}
              onRetry={(text) => handleSend(text)}
            />

            <SessionComposer
              session={session}
              onSend={handleSend}
              onInterrupt={handleInterrupt}
              isStreaming={isStreaming}
              disabled={sendPromptMutation.isPending}
              initialPrompt={quickPrompt}
            />
          </div>

          {isInspectorOpen && (
            <>
              <ResizeHandle
                label={t('session.resizeInspector', 'Resize context panel')}
                onMouseDown={(event) => rightSidebar.beginResize(event, -1)}
              />
              <aside
                style={{ width: rightSidebar.width }}
                className='h-full shrink-0 flex flex-col min-h-0 overflow-hidden'
              >
                <SessionInspector
                  session={session}
                  messages={messages}
                  activeTab={inspectorTab}
                  openTabs={openTabs}
                  onTabChange={setInspectorTab}
                  onCloseTab={closeInspectorTab}
                  onClose={() => setIsInspectorOpen(false)}
                />
              </aside>
            </>
          )}
        </div>
      </Main>
    </>
  )
}
