import { useEffect, useState } from 'react'
import {
  Package,
  FileText,
  PanelRightClose,
  Search,
  Sparkles,
  CircleDashed,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSkillsList, type SessionInfo, type SessionMessageInfo, type SkillItem } from '../api'
import { SessionContextPanel } from './session-context-panel'

export type InspectorTab = 'context' | 'skills' | 'documents'

interface SessionInspectorProps {
  session?: SessionInfo | null
  messages?: SessionMessageInfo[]
  activeTab?: InspectorTab
  openTabs?: InspectorTab[]
  onTabChange?: (tab: InspectorTab) => void
  onCloseTab?: (tab: InspectorTab) => void
  onClose?: () => void
}

export function SessionInspector({
  session = null,
  messages = [],
  activeTab: controlledTab,
  openTabs,
  onTabChange,
  onCloseTab,
  onClose,
}: SessionInspectorProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [uncontrolledTab, setUncontrolledTab] = useState<InspectorTab>('context')
  const [search, setSearch] = useState('')

  const activeTab = controlledTab ?? uncontrolledTab
  const tabs = openTabs ?? (['context', 'skills', 'documents'] as InspectorTab[])

  const setActiveTab = (tab: InspectorTab) => {
    onTabChange?.(tab)
    if (controlledTab === undefined) setUncontrolledTab(tab)
  }

  useEffect(() => {
    if (controlledTab) setUncontrolledTab(controlledTab)
  }, [controlledTab])

  const { data: skills = [], isLoading: isLoadingSkills } = useSkillsList()

  const filteredSkills = skills.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.name?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    )
  })

  const tabMeta: Record<InspectorTab, { icon: typeof CircleDashed; label: string }> = {
    context: {
      icon: CircleDashed,
      label: t('session.context.tab', 'Context'),
    },
    skills: {
      icon: Package,
      label: t('session.skills', 'Skills'),
    },
    documents: {
      icon: FileText,
      label: t('session.documents', 'Documents'),
    },
  }

  return (
    <div className='flex h-full w-full flex-col border-l border-border/50 bg-background/95 select-text min-h-0 overflow-hidden'>
      <div className='flex h-11 shrink-0 items-center justify-between border-b border-border/50 px-2 gap-1'>
        <div className='flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar'>
          {tabs.map((tab) => {
            const meta = tabMeta[tab]
            const Icon = meta.icon
            const selected = activeTab === tab
            return (
              <div
                key={tab}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <button
                  type='button'
                  onClick={() => setActiveTab(tab)}
                  className='flex items-center gap-1.5'
                >
                  <Icon className='h-3.5 w-3.5' />
                  <span>{meta.label}</span>
                </button>
                {onCloseTab && (
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      onCloseTab(tab)
                    }}
                    className='rounded p-0.5 text-muted-foreground/70 hover:text-foreground'
                    title={t('session.closeTab', 'Close tab')}
                    aria-label={t('session.closeTab', 'Close tab')}
                  >
                    <X className='h-3 w-3' />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {onClose && (
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='h-7 w-7 text-muted-foreground hover:text-foreground shrink-0'
            title={t('session.closePanel', 'Close sidebar')}
          >
            <PanelRightClose className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>

      {activeTab === 'context' && tabs.includes('context') && (
        <SessionContextPanel session={session} messages={messages} />
      )}

      {activeTab === 'skills' && tabs.includes('skills') && (
        <div className='flex flex-1 flex-col overflow-hidden min-h-0'>
          {skills.length > 0 && (
            <div className='p-2 border-b border-border/40 shrink-0'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                <Input
                  placeholder={t('common.search', 'Search...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='h-8 pl-8 text-xs bg-muted/30'
                />
              </div>
            </div>
          )}

          <div className='flex-1 min-h-0 overflow-y-auto p-3'>
            {isLoadingSkills ? (
              <div className='space-y-3 p-2'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='h-16 rounded-xl bg-muted/40 animate-pulse' />
                ))}
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className='flex h-full min-h-[240px] flex-col items-center justify-center p-6 text-center select-none'>
                <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/40 bg-muted/20 text-muted-foreground/60'>
                  <Package className='h-8 w-8 stroke-[1.25]' />
                </div>
                <p className='text-xs text-muted-foreground'>
                  {t('session.noSkillsAvailable', 'No skills available')}
                </p>
              </div>
            ) : (
              <div className='space-y-2.5'>
                {filteredSkills.map((skill: SkillItem) => (
                  <div
                    key={skill.id}
                    className='rounded-xl border border-border/60 bg-muted/20 p-3 hover:bg-muted/40 transition-colors'
                  >
                    <div className='mb-1 flex items-center justify-between gap-2'>
                      <div className='flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground'>
                        <Sparkles className='h-3 w-3 shrink-0 text-primary' />
                        <span className='truncate'>{skill.name || skill.id}</span>
                      </div>
                      <Badge
                        variant='outline'
                        className='h-4.5 shrink-0 px-1.5 font-mono text-[10px] text-muted-foreground'
                      >
                        {skill.id}
                      </Badge>
                    </div>
                    {skill.description && (
                      <p className='text-[11px] leading-relaxed text-muted-foreground line-clamp-3'>
                        {skill.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && tabs.includes('documents') && (
        <div className='flex flex-1 flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground min-h-0 overflow-y-auto'>
          <FileText className='mb-2 h-8 w-8 stroke-[1.25] text-muted-foreground/50' />
          <span>{t('session.noDocuments', 'No documents attached')}</span>
        </div>
      )}
    </div>
  )
}
