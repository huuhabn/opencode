import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useModels } from '@/features/settings/models/api'
import { formatTokens } from '@/features/settings/models/format-tokens'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { SessionInfo, SessionMessageInfo } from '../api'

interface SessionContextPanelProps {
  session: SessionInfo | null
  messages: SessionMessageInfo[]
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-baseline justify-between gap-3 py-1.5 min-w-0'>
      <span className='shrink-0 text-[12px] text-muted-foreground'>{label}</span>
      <span
        className='min-w-0 text-right text-[12px] font-medium text-foreground truncate'
        title={value}
      >
        {value}
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='min-w-0'>
      <h3 className='mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80'>
        {title}
      </h3>
      <div className='divide-y divide-border/40'>{children}</div>
    </section>
  )
}

function RawMessage({ message }: { message: SessionMessageInfo }) {
  const [open, setOpen] = useState(false)
  const id = (message as { id?: string }).id || message.type
  const created = (message.time as { created?: number } | undefined)?.created
  const timeLabel = created
    ? new Date(created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : ''

  return (
    <Collapsible open={open} onOpenChange={setOpen} className='border-b border-border/40 last:border-b-0'>
      <CollapsibleTrigger className='flex w-full items-center justify-between gap-2 px-1 py-2 text-left text-[12px] hover:bg-muted/40'>
        <span className='min-w-0 truncate font-mono text-foreground'>
          {message.type}
          <span className='text-muted-foreground'> · {id}</span>
        </span>
        <span className='flex shrink-0 items-center gap-1 text-muted-foreground'>
          {timeLabel && <span className='text-[11px]'>{timeLabel}</span>}
          {open ? <ChevronDown className='h-3.5 w-3.5' /> : <ChevronRight className='h-3.5 w-3.5' />}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className='mb-2 max-h-56 overflow-auto rounded-md bg-muted/40 p-2 text-[11px] font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap break-words'>
          {JSON.stringify(message, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SessionContextPanel({ session, messages }: SessionContextPanelProps) {
  const { t, i18n } = useTranslation(['model-provider', 'common'])
  const { data: models = [] } = useModels()

  const detail = useMemo(() => {
    const tokens = session?.tokens
    const total =
      (tokens?.input ?? 0) +
      (tokens?.output ?? 0) +
      (tokens?.reasoning ?? 0) +
      (tokens?.cache?.read ?? 0) +
      (tokens?.cache?.write ?? 0)

    const modelRef = session?.model && typeof session.model !== 'string' ? session.model : undefined
    const model = modelRef ? models.find((m) => m.id === modelRef.id) : undefined
    const limit = model?.limit?.context
    const usage = limit ? Math.min(Math.round((total / limit) * 100), 100) : null

    const userCount = messages.reduce((n, m) => n + (m.type === 'user' ? 1 : 0), 0)
    const assistantCount = messages.reduce((n, m) => n + (m.type === 'assistant' ? 1 : 0), 0)

    const time = (value?: number) =>
      value
        ? new Intl.DateTimeFormat(i18n.language, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(value)
        : '—'

    const number = (value?: number | null) =>
      value == null ? '—' : new Intl.NumberFormat(i18n.language).format(value)

    const cost = session?.cost ?? 0
    const costLabel =
      cost > 0
        ? new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD' }).format(cost)
        : '—'

    return {
      session: session?.title || session?.id || '—',
      messages: number(messages.length),
      userMessages: number(userCount),
      assistantMessages: number(assistantCount),
      provider: modelRef?.providerID || model?.providerID || '—',
      model: model?.name || modelRef?.id || '—',
      limit: limit ? formatTokens(limit) : '—',
      total: number(total),
      usage: usage == null ? '—' : `${usage}%`,
      input: number(tokens?.input ?? 0),
      output: number(tokens?.output ?? 0),
      reasoning: number(tokens?.reasoning ?? 0),
      cache: `${number(tokens?.cache?.read ?? 0)} / ${number(tokens?.cache?.write ?? 0)}`,
      cost: costLabel,
      created: time(session?.time?.created),
      updated: time(session?.time?.updated),
    }
  }, [session, messages, models, i18n.language])

  if (!session) {
    return (
      <div className='flex flex-1 items-center justify-center p-6 text-center text-xs text-muted-foreground'>
        {t('session.context.empty', 'Open a session to view context usage.')}
      </div>
    )
  }

  return (
    <div className='flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5'>
      <Section title={t('session.context.section.session', 'Session')}>
        <Row label={t('session.context.session', 'Session')} value={detail.session} />
        <Row label={t('session.context.messages', 'Messages')} value={detail.messages} />
        <Row label={t('session.context.userMessages', 'User')} value={detail.userMessages} />
        <Row
          label={t('session.context.assistantMessages', 'Assistant')}
          value={detail.assistantMessages}
        />
        <Row label={t('session.context.created', 'Created')} value={detail.created} />
        <Row label={t('session.context.updated', 'Updated')} value={detail.updated} />
      </Section>

      <Section title={t('session.context.section.model', 'Model')}>
        <Row label={t('session.context.provider', 'Provider')} value={detail.provider} />
        <Row label={t('session.context.model', 'Model')} value={detail.model} />
        <Row label={t('session.contextLimit', 'Context Limit')} value={detail.limit} />
      </Section>

      <Section title={t('session.context.section.usage', 'Usage')}>
        <Row label={t('session.context.totalTokens', 'Total Tokens')} value={detail.total} />
        <Row label={t('session.context.usage', 'Usage')} value={detail.usage} />
        <Row label={t('session.inputTokens', 'Input')} value={detail.input} />
        <Row label={t('session.outputTokens', 'Output')} value={detail.output} />
        <Row label={t('session.reasoningTokens', 'Reasoning')} value={detail.reasoning} />
        <Row label={t('session.cacheTokens', 'Cache')} value={detail.cache} />
        <Row label={t('session.cost', 'Cost')} value={detail.cost} />
      </Section>

      <section className='min-w-0'>
        <h3 className='mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80'>
          {t('session.context.rawMessages', 'Raw messages')}
        </h3>
        {messages.length === 0 ? (
          <p className='py-2 text-[12px] text-muted-foreground'>—</p>
        ) : (
          <div className='rounded-md border border-border/50 px-2'>
            {messages.map((message, index) => (
              <RawMessage
                key={(message as { id?: string }).id || `${message.type}-${index}`}
                message={message}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
