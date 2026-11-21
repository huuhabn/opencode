import { useState } from 'react'
import {
  Package,
  FileText,
  Plus,
  PanelRightClose,
  X,
  Search,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSkillsList, type SkillItem } from '../api'

interface SessionInspectorProps {
  onClose?: () => void
}

export function SessionInspector({ onClose }: SessionInspectorProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [activeTab, setActiveTab] = useState<'skills' | 'documents'>('skills')
  const [search, setSearch] = useState('')

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

  return (
    <div className='flex h-full w-full flex-col border-l border-border/50 bg-background/95 select-text min-h-0 overflow-hidden'>
      {/* Top Tabs Bar */}
      <div className='flex h-11 shrink-0 items-center justify-between border-b border-border/50 px-2'>
        <div className='flex items-center gap-1 min-w-0'>
          {/* Skills Tab */}
          <button
            type='button'
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === 'skills'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <Package className='h-3.5 w-3.5' />
            <span>{t('session.skills', 'Skills')}</span>
            <X
              className='h-3 w-3 opacity-60 hover:opacity-100 cursor-pointer ml-0.5'
              onClick={(e) => {
                e.stopPropagation()
                onClose?.()
              }}
            />
          </button>

          {/* Documents Tab */}
          <button
            type='button'
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === 'documents'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <FileText className='h-3.5 w-3.5' />
            <span>{t('session.documents', 'Documents')}</span>
          </button>

          {/* Add Tab Button */}
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 text-muted-foreground hover:text-foreground rounded-md'
            title='Add panel'
          >
            <Plus className='h-3 w-3' />
          </Button>
        </div>

        {/* Panel Collapse Icon */}
        {onClose && (
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='h-7 w-7 text-muted-foreground hover:text-foreground shrink-0'
            title='Close sidebar'
          >
            <PanelRightClose className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>

      {/* Panel Body */}
      {activeTab === 'skills' && (
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
              /* Exact empty state matching screenshot */
              <div className='flex h-full min-h-[360px] flex-col items-center justify-center p-6 text-center select-none'>
                <div className='relative mb-3 flex items-center justify-center'>
                  <div className='h-16 w-16 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center text-muted-foreground/60'>
                    <Package className='h-9 w-9 stroke-[1.25]' />
                  </div>
                </div>
                <p className='text-xs text-muted-foreground font-normal'>
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
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-1.5 font-semibold text-xs text-foreground'>
                        <Sparkles className='h-3 w-3 text-primary' />
                        <span className='truncate'>{skill.name || skill.id}</span>
                      </div>
                      <Badge variant='outline' className='text-[10px] h-4.5 px-1.5 font-mono text-muted-foreground'>
                        {skill.id}
                      </Badge>
                    </div>
                    {skill.description && (
                      <p className='text-[11px] text-muted-foreground leading-relaxed line-clamp-3'>
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

      {activeTab === 'documents' && (
        <div className='flex flex-1 flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground min-h-0 overflow-y-auto'>
          <FileText className='h-8 w-8 stroke-[1.25] text-muted-foreground/50 mb-2' />
          <span>{t('session.noDocuments', 'No documents attached')}</span>
        </div>
      )}
    </div>
  )
}
