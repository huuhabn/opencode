import { useState, useEffect, useMemo } from 'react'
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
import { SessionInspector } from './components/session-inspector'
import {
  useSessionDetails,
  useSessionMessages,
  useSendPrompt,
  useInterruptSession,
  useCreateSession,
  useDeleteSession,
  type SessionMessageAssistant,
} from './api'

interface SessionFeatureProps {
  sessionId?: string
}

export function SessionFeature({ sessionId }: SessionFeatureProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const navigate = useNavigate()
  const [quickPrompt, setQuickPrompt] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isInspectorOpen, setIsInspectorOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: session = null, refetch: refetchSession } = useSessionDetails(sessionId)

  const sendPromptMutation = useSendPrompt()
  const interruptMutation = useInterruptSession()
  const createSessionMutation = useCreateSession()
  const deleteSessionMutation = useDeleteSession()

  // Pre-declare messages query with dynamic refetch interval
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
    isFetching: isFetchingMessages,
  } = useSessionMessages(sessionId, true)

  // Derive whether the agent is currently busy (submitting, reasoning, or streaming output)
  const isAgentBusy = useMemo(() => {
    if (isSubmitting) return true
    if (!messages || messages.length === 0) return false

    // Find the boundary of the latest turn after the last 'idle' marker
    const lastIdleIdx = messages.findLastIndex((m) => m.type === 'idle')
    const turnMessages = lastIdleIdx >= 0 ? messages.slice(lastIdleIdx + 1) : messages

    // Look for user message in current turn
    const userMsg = turnMessages.findLast((m) => m.type === 'user')
    if (!userMsg) return false

    const userMsgIdx = turnMessages.lastIndexOf(userMsg)
    const assistantMsg = turnMessages
      .slice(userMsgIdx + 1)
      .find((m) => m.type === 'assistant') as SessionMessageAssistant | undefined

    if (!assistantMsg) return true // User prompt sent, awaiting response -> thinking!
    if (!(assistantMsg.time as { completed?: number })?.completed) return true // Streaming in progress!

    return false
  }, [isSubmitting, messages])

  useEffect(() => {
    if (!isAgentBusy && isSubmitting) {
      setIsSubmitting(false)
    }
  }, [isAgentBusy, isSubmitting])

  const handleSend = async (
    text: string,
    model?: { id: string; providerID: string; variant?: string },
    agent?: string
  ) => {
    let currentId = sessionId

    try {
      setIsSubmitting(true)

      // 1. If no active session, create one first with a valid project/workspace location
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

      // 2. Send prompt to session (applies agent/model/variant via switch APIs when needed)
      await sendPromptMutation.mutateAsync({
        sessionID: currentId,
        text,
        model,
        agent,
      })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error', 'An error occurred'))
      setIsSubmitting(false)
    } finally {
      setQuickPrompt('')
    }
  }

  const handleInterrupt = async () => {
    if (!sessionId) return
    try {
      await interruptMutation.mutateAsync(sessionId)
      setIsSubmitting(false)
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

  return (
    <>
      {/* Top Header */}
      <Header>
        <Search className='me-auto' />
        <NotificationCenter />
        <ThemeControls />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* Main 3-Column Split Layout matching Screenshot */}
      <Main fixed className='p-0 sm:p-0 md:p-0 lg:p-0 overflow-hidden min-h-0 flex-1'>
        <div className='flex h-full w-full min-h-0 overflow-hidden bg-background'>
          {/* Left Session Sidebar */}
          {isSidebarOpen && (
            <aside className='w-64 lg:w-72 h-full shrink-0 flex flex-col transition-all min-h-0 overflow-hidden'>
              <SessionSidebar
                currentSessionId={sessionId}
                onCollapse={() => setIsSidebarOpen(false)}
              />
            </aside>
          )}

          {/* Center Main Chat Panel */}
          <div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-background relative h-full'>
            <SessionHeader
              session={session}
              isRefreshing={isFetchingMessages}
              isSidebarOpen={isSidebarOpen}
              isInspectorOpen={isInspectorOpen}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
              onRefresh={() => {
                refetchSession()
                refetchMessages()
              }}
              onDelete={handleDeleteSession}
            />

            <SessionTimeline
              messages={messages}
              isLoading={isLoadingMessages && !!sessionId}
              isStreaming={isAgentBusy}
              onQuickPrompt={(p) => setQuickPrompt(p)}
              onRetry={(text) => handleSend(text)}
              onInterrupt={handleInterrupt}
            />

            <SessionComposer
              session={session}
              onSend={handleSend}
              onInterrupt={handleInterrupt}
              isStreaming={isAgentBusy}
              disabled={sendPromptMutation.isPending}
              initialPrompt={quickPrompt}
            />
          </div>

          {/* Right Inspector Panel (Skills & Documents) */}
          {isInspectorOpen && (
            <aside className='w-72 lg:w-80 h-full shrink-0 flex flex-col transition-all min-h-0 overflow-hidden'>
              <SessionInspector onClose={() => setIsInspectorOpen(false)} />
            </aside>
          )}
        </div>
      </Main>
    </>
  )
}
