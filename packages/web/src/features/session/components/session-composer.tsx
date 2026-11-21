import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Plus,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowUp,
  CircleDashed,
  Square,
  ChevronDown,
  X,
  FileCode,
  DollarSign,
  Layers,
  Database,
  Bot,
  Paperclip,
  AtSign,
  Sparkles,
  Command,
  Package,
  Search,
  Check,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useModels, useDefaultModel } from '@/features/settings/models/api'
import { formatTokens } from '@/features/settings/models/format-tokens'
import {
  useAgentsList,
  useSkillsList,
  type SessionInfo,
  type AgentItem,
  type SkillItem,
  type ComposerModelRef,
} from '../api'

const STORAGE_MODEL_KEY = 'opencode_selected_model'
const STORAGE_VARIANT_KEY = 'opencode_selected_variant'

interface SessionComposerProps {
  session?: SessionInfo | null
  onSend: (text: string, model?: ComposerModelRef, agent?: string) => void
  onInterrupt?: () => void
  isStreaming?: boolean
  disabled?: boolean
  initialPrompt?: string
}

interface MentionSuggestionItem {
  type: 'agent' | 'skill'
  id: string
  name: string
  description?: string
}

export function SessionComposer({
  session,
  onSend,
  onInterrupt,
  isStreaming,
  disabled,
  initialPrompt,
}: SessionComposerProps) {
  const { t } = useTranslation(['model-provider', 'common'])
  const [prompt, setPrompt] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState<string>('build')
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [selectedVariant, setSelectedVariant] = useState<string>('medium')
  const [modelSearch, setModelSearch] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Mention Suggestions state
  const [caretPosition, setCaretPosition] = useState<number>(0)
  const [isMentionDismissed, setIsMentionDismissed] = useState<boolean>(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const suggestionListRef = useRef<HTMLDivElement>(null)

  const { data: models = [] } = useModels()
  const { data: defaultModel } = useDefaultModel()
  const { data: agents = [] } = useAgentsList()
  const { data: skills = [] } = useSkillsList()

  const sessionModelKey = !session?.model
    ? ''
    : typeof session.model === 'string'
      ? session.model
      : `${session.model.providerID}/${session.model.id}/${session.model.variant ?? ''}`

  // Sync model/variant from session when the session record changes (not on every local selection).
  useEffect(() => {
    if (!sessionModelKey || !session?.model) return
    const modelRef = typeof session.model === 'string' ? null : session.model
    const modelId = typeof session.model === 'string' ? session.model : modelRef?.id
    if (modelId) setSelectedModelId(modelId)
    if (modelRef?.variant) setSelectedVariant(modelRef.variant)
  }, [sessionModelKey, session])

  // Initialize from localStorage / default only when nothing is selected yet.
  useEffect(() => {
    setSelectedModelId((prev) => {
      if (prev) return prev
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_MODEL_KEY)
        if (saved && models.some((m) => m.id === saved)) return saved
      }
      if (defaultModel?.id) return defaultModel.id
      if (models.length > 0) return models[0].id
      return prev
    })
  }, [defaultModel, models])

  // Initialize variant from localStorage if saved
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedVariant = localStorage.getItem(STORAGE_VARIANT_KEY)
      if (savedVariant) {
        setSelectedVariant(savedVariant)
      }
    }
  }, [])

  // Initialize selected agent from session if exists
  useEffect(() => {
    if (session?.agent) {
      setSelectedAgentId(session.agent)
    }
  }, [session?.agent])

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt)
      textareaRef.current?.focus()
    }
  }, [initialPrompt])

  const currentModel = models.find((m) => m.id === selectedModelId) || models[0]
  const currentAgent = agents.find((a) => a.id === selectedAgentId) || {
    id: selectedAgentId,
    name: selectedAgentId === 'build' ? 'Build' : selectedAgentId,
  }

  // Model-specific variants if available, or standard default variants
  const availableVariants = useMemo(() => {
    if (currentModel?.variants && currentModel.variants.length > 0) {
      return currentModel.variants.map((v: { id?: string; name?: string } | string) =>
        typeof v === 'string' ? v : v.id || v.name || String(v)
      )
    }
    return ['none', 'low', 'medium', 'high']
  }, [currentModel])

  // Drop a stale variant when the selected model no longer supports it
  useEffect(() => {
    if (availableVariants.length === 0) return
    if (availableVariants.includes(selectedVariant)) return
    const next = availableVariants.includes('medium') ? 'medium' : availableVariants[0]
    setSelectedVariant(next)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_VARIANT_KEY, next)
    }
  }, [availableVariants, selectedVariant])

  // Group models by provider with search filtering
  const groupedModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase()
    const filtered = models.filter((m) => {
      if (!query) return true
      return (
        m.name?.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query) ||
        m.providerID?.toLowerCase().includes(query)
      )
    })

    const groups: Record<string, typeof models> = {}
    filtered.forEach((m) => {
      const p = m.providerID || 'other'
      if (!groups[p]) groups[p] = []
      groups[p].push(m)
    })
    return groups
  }, [models, modelSearch])

  const handleSelectModel = (id: string) => {
    setSelectedModelId(id)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_MODEL_KEY, id)
    }
  }

  const handleSelectVariant = (v: string) => {
    setSelectedVariant(v)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_VARIANT_KEY, v)
    }
  }

  // Detect whether @ mention is active before caret
  const textBeforeCaret = prompt.slice(0, caretPosition)
  const mentionMatch = textBeforeCaret.match(/@([a-zA-Z0-9_\-]*)$/)
  const isMentionActive = Boolean(mentionMatch) && !isMentionDismissed
  const mentionQuery = mentionMatch ? mentionMatch[1].toLowerCase() : ''

  // Filter suggestion list
  const suggestionsList: MentionSuggestionItem[] = useMemo(() => {
    if (!isMentionActive) return []

    const agentItems: MentionSuggestionItem[] = agents
      .filter(
        (a: AgentItem) =>
          a.id.toLowerCase().includes(mentionQuery) ||
          a.name.toLowerCase().includes(mentionQuery)
      )
      .map((a: AgentItem) => ({
        type: 'agent',
        id: a.id,
        name: a.name,
        description: a.description,
      }))

    const skillItems: MentionSuggestionItem[] = skills
      .filter(
        (s: SkillItem) =>
          s.id.toLowerCase().includes(mentionQuery) ||
          s.name?.toLowerCase().includes(mentionQuery) ||
          s.description?.toLowerCase().includes(mentionQuery)
      )
      .map((s: SkillItem) => ({
        type: 'skill',
        id: s.id,
        name: s.name || s.id,
        description: s.description,
      }))

    return [...agentItems, ...skillItems]
  }, [isMentionActive, mentionQuery, agents, skills])

  // Reset highlight index when suggestions list changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [suggestionsList.length])

  // Select a mention item and replace @query with @id
  const selectMention = (item: MentionSuggestionItem) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const pos = textarea.selectionStart ?? caretPosition
    const before = prompt.slice(0, pos)
    const after = prompt.slice(pos)
    const atIndex = before.lastIndexOf('@')

    if (atIndex !== -1) {
      const replacement = `@${item.id} `
      const nextPrompt = before.slice(0, atIndex) + replacement + after
      setPrompt(nextPrompt)
      setIsMentionDismissed(true)

      // Also switch active agent if user picked an agent
      if (item.type === 'agent') {
        setSelectedAgentId(item.id)
      }

      setTimeout(() => {
        textarea.focus()
        const newPos = atIndex + replacement.length
        textarea.setSelectionRange(newPos, newPos)
        setCaretPosition(newPos)
      }, 10)
    }
  }

  const handleSend = () => {
    const trimmed = prompt.trim()
    if (!trimmed || isStreaming || disabled) return

    const matchedModel = currentModel
    const variant =
      selectedVariant === 'none' || selectedVariant === 'default' ? undefined : selectedVariant
    const modelParam: ComposerModelRef | undefined = matchedModel
      ? { id: matchedModel.id, providerID: matchedModel.providerID, variant }
      : undefined

    let fullText = trimmed
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => f.name).join(', ')
      fullText = `[Attached files: ${fileNames}]\n\n${trimmed}`
    }

    onSend(fullText, modelParam, selectedAgentId)
    setPrompt('')
    setAttachedFiles([])
    setIsMentionDismissed(false)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If mention suggestions are active, intercept Arrow keys, Enter and Escape
    if (isMentionActive && suggestionsList.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev + 1) % suggestionsList.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev - 1 + suggestionsList.length) % suggestionsList.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        if (suggestionsList[highlightedIndex]) {
          selectMention(suggestionsList[highlightedIndex])
        }
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsMentionDismissed(true)
        return
      }
    }

    // Escape stops streaming
    if (e.key === 'Escape' && isStreaming) {
      e.preventDefault()
      onInterrupt?.()
      return
    }

    // Enter sends message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setPrompt(val)
    setCaretPosition(e.target.selectionStart ?? val.length)
    setIsMentionDismissed(false)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }

  const handleSelectOrClick = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    setCaretPosition(target.selectionStart ?? 0)
    setIsMentionDismissed(false)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      setAttachedFiles((prev) => [...prev, ...files])
      toast.success(`${files.length} file(s) attached`)
    }
  }

  // Voice dictation toggle
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        toast.info(t('session.voiceListening', 'Listening...'))
      }

      recognition.onresult = (event: {
        resultIndex: number
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>
      }) => {
        let chunk = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (!event.results[i].isFinal) continue
          chunk += event.results[i][0].transcript
        }
        if (!chunk) return
        setPrompt((prev) => (prev ? `${prev} ${chunk}` : chunk))
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
      recognitionRef.current = recognition
    } catch {
      setIsListening(false)
    }
  }

  // Text-to-speech readout
  const toggleTextToSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const textToRead = prompt.trim() || 'Ready to assist.'
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setAttachedFiles((prev) => [...prev, ...newFiles])
      toast.success(`${newFiles.length} file(s) attached`)
    }
  }

  const removeFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  // Quick insertion helpers for @ and /
  const insertMention = (char: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setPrompt((prev) => `${prev}${char}`)
      return
    }

    const start = textarea.selectionStart ?? prompt.length
    const end = textarea.selectionEnd ?? prompt.length
    const next = prompt.slice(0, start) + char + prompt.slice(end)
    setPrompt(next)
    setIsMentionDismissed(false)

    setTimeout(() => {
      textarea.focus()
      const newPos = start + char.length
      textarea.setSelectionRange(newPos, newPos)
      setCaretPosition(newPos)
    }, 10)
  }

  // Calculate token usage breakdown
  const tokens = session?.tokens
  const totalTokens =
    (tokens?.input ?? 0) +
    (tokens?.output ?? 0) +
    (tokens?.reasoning ?? 0)
  const contextLimit = currentModel?.limit?.context ?? 128_000
  const tokenUsagePercent =
    totalTokens === 0 ? 0 : Math.min(Math.round((totalTokens / contextLimit) * 100), 100)

  return (
    <div className='p-3 sm:p-5 flex flex-col items-center bg-transparent select-text w-full max-w-4xl mx-auto shrink-0 relative'>
      {/* Hidden file input */}
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className='hidden'
      />

      {/* Floating Mention Suggestions Popover */}
      {isMentionActive && (
        <div
          ref={suggestionListRef}
          className='absolute bottom-full mb-2 left-3 right-3 sm:left-6 sm:max-w-md z-50 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md text-popover-foreground shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150'
        >
          {/* Header */}
          <div className='flex items-center justify-between border-b border-border/40 px-3 py-1.5 bg-muted/40'>
            <div className='flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground'>
              <AtSign className='h-3.5 w-3.5 text-primary' />
              <span>Mention Agent or Skill</span>
            </div>
            <span className='text-[10px] text-muted-foreground/70 font-mono'>
              ↑↓ navigate · ↵ select · esc
            </span>
          </div>

          {/* Suggestions List */}
          <div className='max-h-60 overflow-y-auto p-1.5 space-y-0.5 select-none'>
            {suggestionsList.length === 0 ? (
              <div className='p-3 text-center text-xs text-muted-foreground'>
                No matching agents or skills found for &apos;@{mentionQuery}&apos;
              </div>
            ) : (
              suggestionsList.map((item, index) => {
                const isSelected = index === highlightedIndex
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type='button'
                    onClick={() => selectMention(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className='flex items-center gap-2 min-w-0 pr-2'>
                      {item.type === 'agent' ? (
                        <div className='h-5 w-5 rounded-md bg-primary/20 text-primary flex items-center justify-center shrink-0'>
                          <Bot className='h-3 w-3' />
                        </div>
                      ) : (
                        <div className='h-5 w-5 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0'>
                          <Package className='h-3 w-3' />
                        </div>
                      )}
                      <div className='flex flex-col min-w-0'>
                        <span className='font-semibold truncate text-[11px]'>{item.name}</span>
                        {item.description && (
                          <span className='text-[10px] text-muted-foreground truncate max-w-[260px]'>
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant='outline'
                      className='text-[9px] h-4 px-1 font-mono uppercase text-muted-foreground shrink-0'
                    >
                      {item.type}
                    </Badge>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Floating Card with Drag and Drop Support */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full rounded-2xl border bg-background shadow-xs transition-all overflow-hidden ${
          isDragging
            ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
            : 'border-border/80 hover:border-border'
        }`}
      >
        {/* Attached files pills */}
        {attachedFiles.length > 0 && (
          <div className='flex flex-wrap gap-1.5 px-4 pt-2.5'>
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className='flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs text-foreground font-mono shadow-2xs border border-border/50'
              >
                <FileCode className='h-3.5 w-3.5 text-primary' />
                <span className='truncate max-w-[160px] font-medium'>{file.name}</span>
                <span className='text-[10px] text-muted-foreground'>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type='button'
                  onClick={() => removeFile(idx)}
                  className='text-muted-foreground hover:text-foreground ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20'
                >
                  <X className='h-3 w-3' />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Area */}
        <div className='px-4 pt-3 pb-2'>
          <Textarea
            ref={textareaRef}
            rows={2}
            value={prompt}
            onChange={handleInput}
            onSelect={handleSelectOrClick}
            onClick={handleSelectOrClick}
            onKeyUp={handleSelectOrClick}
            onKeyDown={handleKeyDown}
            disabled={disabled || isStreaming}
            placeholder={t(
              'session.composerPlaceholderNew',
              'Ask, search, or brainstorm. @ to bring in other agents.'
            )}
            className='min-h-[50px] max-h-[180px] w-full resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/60 leading-relaxed font-sans'
          />
        </div>

        {/* Bottom Toolbar inside Card */}
        <div className='flex items-center justify-between px-3 py-2 border-t border-border/30 bg-muted/15'>
          {/* Left Toolbar: Add Menu (+), Voice (Mic) */}
          <div className='flex items-center gap-1 text-muted-foreground'>
            {/* Add Menu (+) like ComposerEditorAddMenu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg'
                  title={t('session.attachFiles', 'Add attachment or mention')}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-52 text-xs'>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className='h-3.5 w-3.5 mr-2 text-primary' />
                  <span>{t('session.attachFiles', 'Attach Files...')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertMention('@')}>
                  <AtSign className='h-3.5 w-3.5 mr-2 text-indigo-500' />
                  <span>{t('session.mentionSkill', 'Mention Skill / Agent (@)')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertMention('/')}>
                  <Command className='h-3.5 w-3.5 mr-2 text-emerald-500' />
                  <span>{t('session.commands', 'Commands (/)')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mic Button */}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={toggleSpeechRecognition}
              className={`h-7 w-7 rounded-lg transition-colors ${
                isListening
                  ? 'bg-rose-500/20 text-rose-500 animate-pulse'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={isListening ? t('session.voiceStop', 'Stop listening') : t('session.voiceListening', 'Voice input')}
            >
              {isListening ? <MicOff className='h-4 w-4' /> : <Mic className='h-4 w-4' />}
            </Button>
          </div>

          {/* Center / Right Toolbar: Agent Selector + Model Selector + Variant + Audio + Send */}
          <div className='flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end'>
            {/* 1. Agent Selector Chip (from Composer view.agent) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  disabled={disabled || isStreaming}
                  className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/60 transition-colors font-medium border border-border/40'
                  title='Choose Agent'
                >
                  <Bot className='h-3 w-3 text-primary shrink-0' />
                  <span className='capitalize font-semibold'>{currentAgent.name}</span>
                  <ChevronDown className='h-2.5 w-2.5 text-muted-foreground' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48 text-xs'>
                <DropdownMenuLabel className='text-[10px] text-muted-foreground'>
                  {t('session.chooseAgent', 'Select Agent')}
                </DropdownMenuLabel>
                {agents.map((ag: AgentItem) => (
                  <DropdownMenuItem
                    key={ag.id}
                    onClick={() => setSelectedAgentId(ag.id)}
                    className={ag.id === selectedAgentId ? 'bg-muted font-medium' : ''}
                  >
                    <div className='flex flex-col'>
                      <span className='font-semibold'>{ag.name}</span>
                      {ag.description && (
                        <span className='text-[10px] text-muted-foreground line-clamp-1'>
                          {ag.description}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 2. Model Selector Chip (with Search & Provider Grouping) */}
            <DropdownMenu onOpenChange={(open) => !open && setModelSearch('')}>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  disabled={disabled || isStreaming}
                  className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/60 transition-colors border border-border/40'
                  title='Choose Model'
                >
                  <span className='font-normal text-muted-foreground/70 hidden sm:inline'>
                    {currentModel?.providerID || 'google'} /
                  </span>
                  <span className='font-medium text-foreground truncate max-w-[120px] sm:max-w-[150px]'>
                    {currentModel?.name || currentModel?.id || 'Gemini 3.8 Flash'}
                  </span>
                  <ChevronDown className='h-3 w-3 text-muted-foreground' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-72 text-xs p-0 overflow-hidden shadow-lg'>
                {/* Search input at top */}
                <div className='p-2 border-b border-border/50 bg-muted/20'>
                  <div className='relative'>
                    <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                    <Input
                      placeholder={t('common.search', 'Search models or providers...')}
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className='h-7.5 pl-8 text-xs bg-background'
                      autoFocus
                    />
                  </div>
                </div>

                {/* Grouped models list */}
                <div className='max-h-64 overflow-y-auto p-1'>
                  {Object.keys(groupedModels).length === 0 ? (
                    <div className='p-4 text-center text-xs text-muted-foreground'>
                      No models matching &apos;{modelSearch}&apos;
                    </div>
                  ) : (
                    Object.entries(groupedModels).map(([provider, providerModels]) => (
                      <div key={provider} className='mb-2 last:mb-0'>
                        <div className='px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40 rounded-sm mb-1 flex items-center justify-between'>
                          <span>{provider}</span>
                          <span className='text-[9px] font-mono text-muted-foreground/70'>
                            {providerModels.length}
                          </span>
                        </div>
                        {providerModels.map((m) => {
                          const isSelected = m.id === selectedModelId
                          return (
                            <DropdownMenuItem
                              key={m.id}
                              onClick={() => handleSelectModel(m.id)}
                              className={`flex items-center justify-between px-2 py-1.5 rounded-md ${
                                isSelected ? 'bg-primary/10 font-semibold text-primary' : ''
                              }`}
                            >
                              <div className='flex flex-col min-w-0 pr-2'>
                                <span className='truncate text-xs'>{m.name || m.id}</span>
                                <span className='text-[10px] font-mono text-muted-foreground/70 truncate'>
                                  {m.id}
                                  {m.limit?.context
                                    ? ` · ${formatTokens(m.limit.context)}`
                                    : ''}
                                </span>
                              </div>
                              {isSelected && <Check className='h-3.5 w-3.5 text-primary shrink-0' />}
                            </DropdownMenuItem>
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. Variant Selector Chip (ComposerEditorConfiguredSelect) */}
            {availableVariants.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type='button'
                    disabled={disabled || isStreaming}
                    className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1.5 py-1 rounded-md hover:bg-muted/60 transition-colors capitalize'
                    title='Reasoning Variant'
                  >
                    <Sparkles className='h-3 w-3 text-amber-500 shrink-0' />
                    <span>{selectedVariant}</span>
                    <ChevronDown className='h-2.5 w-2.5 text-muted-foreground' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-40 text-xs'>
                  <DropdownMenuLabel className='text-[10px] text-muted-foreground'>
                    {t('session.variant', 'Variant / Reasoning Effort')}
                  </DropdownMenuLabel>
                  {availableVariants.map((v: string) => (
                    <DropdownMenuItem
                      key={v}
                      onClick={() => handleSelectVariant(v)}
                      className={v === selectedVariant ? 'bg-muted font-medium' : ''}
                    >
                      <span className='capitalize'>{v}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* 4. Speaker / Readout Icon */}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={toggleTextToSpeech}
              className={`h-7 w-7 rounded-lg transition-colors ${
                isSpeaking
                  ? 'bg-emerald-500/20 text-emerald-500 animate-pulse'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={isSpeaking ? t('session.speaking', 'Speaking...') : t('session.speakLast', 'Read response aloud')}
            >
              {isSpeaking ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
            </Button>

            {/* 5. Submit / Stop Button (Upright ArrowUp icon) */}
            {isStreaming ? (
              <Button
                type='button'
                size='icon'
                onClick={onInterrupt}
                className='h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center shadow-xs'
                title={t('session.stopPrompt', 'Stop agent (Esc)')}
              >
                <Square className='h-3 w-3 fill-current' />
              </Button>
            ) : (
              <Button
                type='button'
                size='icon'
                onClick={handleSend}
                disabled={!prompt.trim() || disabled}
                className='h-7 w-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center justify-center shadow-xs disabled:opacity-40 transition-transform active:scale-95'
                title={t('session.sendPrompt', 'Send message (Enter)')}
              >
                <ArrowUp className='h-4 w-4 stroke-[2.5]' />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Below Composer Indicator: Token Usage Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='flex items-center gap-1.5 text-[11px] text-muted-foreground/75 hover:text-muted-foreground transition-colors mt-2'
            title='View token breakdown'
          >
            <CircleDashed className='h-3 w-3 text-muted-foreground/80' />
            <span>
              {t('session.usedPercent', '{{percent}}% used', { percent: tokenUsagePercent })}
            </span>
            <ChevronDown className='h-2.5 w-2.5' />
          </button>
        </PopoverTrigger>
        <PopoverContent align='center' className='w-64 p-3 text-xs space-y-2'>
          <h4 className='font-semibold text-xs border-b pb-1.5 text-foreground'>
            {t('session.tokensBreakdown', 'Token Usage Breakdown')}
          </h4>
          <div className='space-y-1.5 text-muted-foreground text-[11px] font-mono'>
            <div className='flex justify-between items-center'>
              <span className='flex items-center gap-1.5'>
                <Layers className='h-3 w-3 text-primary' />
                {t('session.inputTokens', 'Input')}
              </span>
              <span className='font-semibold text-foreground'>{tokens?.input ?? 0}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='flex items-center gap-1.5'>
                <ArrowUp className='h-3 w-3 text-emerald-500' />
                {t('session.outputTokens', 'Output')}
              </span>
              <span className='font-semibold text-foreground'>{tokens?.output ?? 0}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='flex items-center gap-1.5'>
                <CircleDashed className='h-3 w-3 text-amber-500' />
                {t('session.reasoningTokens', 'Reasoning')}
              </span>
              <span className='font-semibold text-foreground'>{tokens?.reasoning ?? 0}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='flex items-center gap-1.5'>
                <Database className='h-3 w-3 text-blue-500' />
                {t('session.cacheTokens', 'Cache')}
              </span>
              <span>
                {tokens?.cache?.read ?? 0} / {tokens?.cache?.write ?? 0}
              </span>
            </div>
            <div className='flex justify-between items-center border-t pt-1'>
              <span className='flex items-center gap-1.5'>
                <DollarSign className='h-3 w-3 text-primary' />
                {t('session.cost', 'Cost')}
              </span>
              <span className='font-semibold text-foreground'>
                ${(session?.cost ?? 0).toFixed(4)}
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
