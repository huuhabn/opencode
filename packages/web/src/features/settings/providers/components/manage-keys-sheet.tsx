import { useState, useMemo, useEffect } from 'react'
import {
  Check,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  Eye,
  EyeOff,
  Lock,
  RotateCw,
  Search,
  LayoutGrid,
  MessageSquare,
  Image as ImageIcon,
  Video,
  AudioLines,
  Wrench,
  ArrowUpDown,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  useActivateCredential,
  useConnectKey,
  useRemoveCredential,
  useUpdateCredential,
} from '../api'
import { useModels } from '../../models/api'
import { testApiKey, getDefaultProxyUrl, type TestKeyResult } from '../lib/test-key'
import { ProviderIcon } from './provider-icon'
import type { ProviderItem } from './provider-card'
import type { CredentialEntryItem } from './account-list'

interface ManageKeysSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: ProviderItem
  credentials: CredentialEntryItem[]
  onAddConnection?: () => void
  onAddKey?: () => void
}

interface ProviderModelItem {
  id: string
  modelID: string
  name: string
  type?: string
  released?: string
  inputCost?: number
  outputCost?: number
  limitContext?: number
  hasVision?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
  hasTools?: boolean
  isNew?: boolean
  enabled: boolean
}

// Built-in catalog models to ensure pixel-perfect rendering for major providers
const FALLBACK_MODELS_BY_PROVIDER: Record<string, ProviderModelItem[]> = {
  google: [
    {
      id: 'gemini-4-carbon',
      modelID: 'gemini-4-carbon',
      name: 'Gemini 4 Carbon',
      type: 'chat',
      released: '2026-11-10',
      inputCost: 2.0,
      outputCost: 10.0,
      limitContext: 1_048_576,
      hasVision: true,
      hasVideo: true,
      hasAudio: true,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'gemini-4-neon',
      modelID: 'gemini-4-neon',
      name: 'Gemini 4 Neon',
      type: 'chat',
      released: '2026-11-18',
      inputCost: 3.0,
      outputCost: 15.0,
      limitContext: 1_048_576,
      hasVision: true,
      hasVideo: true,
      hasAudio: true,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'gemini-2.5-flash-lite',
      modelID: 'gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      type: 'chat',
      released: '2025-06-01',
      inputCost: 0.075,
      outputCost: 0.3,
      limitContext: 1_048_576,
      hasVision: true,
      hasVideo: false,
      hasAudio: true,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'gemini-2.5-flash',
      modelID: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      type: 'chat',
      released: '2025-05-15',
      inputCost: 0.15,
      outputCost: 0.6,
      limitContext: 1_048_576,
      hasVision: true,
      hasVideo: true,
      hasAudio: true,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'gemini-2.5-pro',
      modelID: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      type: 'chat',
      released: '2025-05-15',
      inputCost: 1.25,
      outputCost: 5.0,
      limitContext: 2_097_152,
      hasVision: true,
      hasVideo: true,
      hasAudio: true,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'imagen-3',
      modelID: 'imagen-3',
      name: 'Imagen 3',
      type: 'image',
      released: '2025-02-01',
      inputCost: 0.03,
      outputCost: 0.03,
      limitContext: 8_192,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: false,
      isNew: false,
      enabled: true,
    },
    {
      id: 'veo-2',
      modelID: 'veo-2',
      name: 'Veo 2',
      type: 'video',
      released: '2025-03-10',
      inputCost: 0.25,
      outputCost: 0.5,
      limitContext: 32_768,
      hasVision: true,
      hasVideo: true,
      hasAudio: false,
      hasTools: false,
      isNew: false,
      enabled: true,
    },
    {
      id: 'gemini-tts-1',
      modelID: 'gemini-tts-1',
      name: 'Gemini TTS Expressive',
      type: 'tts',
      released: '2025-04-12',
      inputCost: 0.015,
      outputCost: 0.03,
      limitContext: 16_384,
      hasVision: false,
      hasVideo: false,
      hasAudio: true,
      hasTools: false,
      isNew: false,
      enabled: true,
    },
  ],
  openai: [
    {
      id: 'gpt-4o',
      modelID: 'gpt-4o',
      name: 'GPT-4o',
      type: 'chat',
      released: '2024-05-13',
      inputCost: 2.5,
      outputCost: 10.0,
      limitContext: 128_000,
      hasVision: true,
      hasVideo: false,
      hasAudio: true,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'gpt-4o-mini',
      modelID: 'gpt-4o-mini',
      name: 'GPT-4o mini',
      type: 'chat',
      released: '2024-07-18',
      inputCost: 0.15,
      outputCost: 0.6,
      limitContext: 128_000,
      hasVision: true,
      hasVideo: false,
      hasAudio: true,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'o3-mini',
      modelID: 'o3-mini',
      name: 'o3-mini',
      type: 'chat',
      released: '2025-01-31',
      inputCost: 1.1,
      outputCost: 4.4,
      limitContext: 200_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'dall-e-3',
      modelID: 'dall-e-3',
      name: 'DALL-E 3',
      type: 'image',
      released: '2023-10-01',
      inputCost: 0.04,
      outputCost: 0.08,
      limitContext: 4_096,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: false,
      isNew: false,
      enabled: true,
    },
    {
      id: 'tts-1',
      modelID: 'tts-1',
      name: 'TTS-1',
      type: 'tts',
      released: '2023-11-06',
      inputCost: 0.015,
      outputCost: 0.03,
      limitContext: 4_096,
      hasVision: false,
      hasVideo: false,
      hasAudio: true,
      hasTools: false,
      isNew: false,
      enabled: true,
    },
  ],
  anthropic: [
    {
      id: 'claude-3-7-sonnet',
      modelID: 'claude-3-7-sonnet-20250219',
      name: 'Claude 3.7 Sonnet',
      type: 'chat',
      released: '2025-02-24',
      inputCost: 3.0,
      outputCost: 15.0,
      limitContext: 200_000,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'claude-3-5-sonnet',
      modelID: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      type: 'chat',
      released: '2024-10-22',
      inputCost: 3.0,
      outputCost: 15.0,
      limitContext: 200_000,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'claude-3-5-haiku',
      modelID: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      type: 'chat',
      released: '2024-11-04',
      inputCost: 0.8,
      outputCost: 4.0,
      limitContext: 200_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
  ],
  groq: [
    {
      id: 'llama-3.3-70b-versatile',
      modelID: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B Versatile',
      type: 'chat',
      released: '2024-12-06',
      inputCost: 0.59,
      outputCost: 0.79,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'llama-3.1-8b-instant',
      modelID: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B Instant',
      type: 'chat',
      released: '2024-07-23',
      inputCost: 0.05,
      outputCost: 0.08,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'deepseek-r1-distill-llama-70b',
      modelID: 'deepseek-r1-distill-llama-70b',
      name: 'DeepSeek R1 Distill Llama 70B',
      type: 'chat',
      released: '2025-01-20',
      inputCost: 0.75,
      outputCost: 0.99,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
  ],
  deepseek: [
    {
      id: 'deepseek-chat',
      modelID: 'deepseek-chat',
      name: 'DeepSeek-V3',
      type: 'chat',
      released: '2024-12-26',
      inputCost: 0.14,
      outputCost: 0.28,
      limitContext: 64_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'deepseek-reasoner',
      modelID: 'deepseek-reasoner',
      name: 'DeepSeek-R1',
      type: 'chat',
      released: '2025-01-20',
      inputCost: 0.55,
      outputCost: 2.19,
      limitContext: 64_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
  ],
  mistral: [
    {
      id: 'mistral-large-latest',
      modelID: 'mistral-large-latest',
      name: 'Mistral Large 2411',
      type: 'chat',
      released: '2024-11-18',
      inputCost: 2.0,
      outputCost: 6.0,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'codestral-latest',
      modelID: 'codestral-latest',
      name: 'Codestral 2501',
      type: 'chat',
      released: '2025-01-14',
      inputCost: 0.3,
      outputCost: 0.9,
      limitContext: 256_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'pixtral-12b-2409',
      modelID: 'pixtral-12b-2409',
      name: 'Pixtral 12B',
      type: 'image',
      released: '2024-09-17',
      inputCost: 0.15,
      outputCost: 0.15,
      limitContext: 128_000,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: false,
      isNew: false,
      enabled: true,
    },
  ],
  togetherai: [
    {
      id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      modelID: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      name: 'Llama 3.3 70B Turbo',
      type: 'chat',
      released: '2024-12-06',
      inputCost: 0.88,
      outputCost: 0.88,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'deepseek-ai/DeepSeek-R1',
      modelID: 'deepseek-ai/DeepSeek-R1',
      name: 'DeepSeek R1 (Together)',
      type: 'chat',
      released: '2025-01-20',
      inputCost: 0.8,
      outputCost: 2.4,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
  ],
  xai: [
    {
      id: 'grok-2-1212',
      modelID: 'grok-2-1212',
      name: 'Grok 2',
      type: 'chat',
      released: '2024-12-12',
      inputCost: 2.0,
      outputCost: 10.0,
      limitContext: 131_072,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'grok-2-vision-1212',
      modelID: 'grok-2-vision-1212',
      name: 'Grok 2 Vision',
      type: 'image',
      released: '2024-12-12',
      inputCost: 2.0,
      outputCost: 10.0,
      limitContext: 32_768,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
  ],
  cohere: [
    {
      id: 'command-r-plus-08-2024',
      modelID: 'command-r-plus-08-2024',
      name: 'Command R+',
      type: 'chat',
      released: '2024-08-20',
      inputCost: 2.5,
      outputCost: 10.0,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'command-r-08-2024',
      modelID: 'command-r-08-2024',
      name: 'Command R',
      type: 'chat',
      released: '2024-08-20',
      inputCost: 0.15,
      outputCost: 0.6,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
  ],
  openrouter: [
    {
      id: 'openrouter/auto',
      modelID: 'openrouter/auto',
      name: 'OpenRouter Auto Router',
      type: 'chat',
      released: '2024-01-01',
      inputCost: 1.0,
      outputCost: 3.0,
      limitContext: 128_000,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: false,
      enabled: true,
    },
    {
      id: 'anthropic/claude-3.7-sonnet',
      modelID: 'anthropic/claude-3.7-sonnet',
      name: 'Claude 3.7 Sonnet (Router)',
      type: 'chat',
      released: '2025-02-24',
      inputCost: 3.0,
      outputCost: 15.0,
      limitContext: 200_000,
      hasVision: true,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
    {
      id: 'deepseek/deepseek-r1',
      modelID: 'deepseek/deepseek-r1',
      name: 'DeepSeek R1 (Router)',
      type: 'chat',
      released: '2025-01-20',
      inputCost: 0.7,
      outputCost: 2.5,
      limitContext: 128_000,
      hasVision: false,
      hasVideo: false,
      hasAudio: false,
      hasTools: true,
      isNew: true,
      enabled: true,
    },
  ],
}

function formatContext(tokens?: number): string {
  if (!tokens) return '128k'
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(0)}M`
  }
  if (tokens >= 1_000) {
    return `${Math.round(tokens / 1_000)}k`
  }
  return `${tokens}`
}

export function ManageKeysSheet({
  open,
  onOpenChange,
  provider,
  credentials,
  onAddConnection,
  onAddKey,
}: ManageKeysSheetProps) {
  const { t } = useTranslation(['model-provider', 'common'])

  const activateCred = useActivateCredential()
  const removeCred = useRemoveCredential()
  const updateCred = useUpdateCredential()
  const connectKey = useConnectKey()
  const { data: serverModels = [], refetch: refetchServerModels, isFetching: isFetchingModels } = useModels()

  // Selected account/credential (defaults to active account, or first, or null)
  const activeCredential = useMemo(() => {
    return credentials.find((c) => c.active) || credentials[0] || null
  }, [credentials])

  const [selectedCredId, setSelectedCredId] = useState<string | null>(
    activeCredential?.id || null
  )

  useEffect(() => {
    if (activeCredential && !selectedCredId) {
      setSelectedCredId(activeCredential.id)
    }
  }, [activeCredential, selectedCredId])

  const currentCred = useMemo(() => {
    if (selectedCredId === 'new') return null
    return credentials.find((c) => c.id === selectedCredId) || activeCredential || null
  }, [credentials, selectedCredId, activeCredential])

  const isAddingNew = credentials.length === 0 || selectedCredId === 'new'

  // Form State
  const defaultProxy = getDefaultProxyUrl(provider.id)
  const storageKey = `opencode_provider_settings_${provider.id}`

  const [apiKey, setApiKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [proxyUrl, setProxyUrl] = useState(defaultProxy)
  const [clientRequestMode, setClientRequestMode] = useState(false)
  const [accountLabel, setAccountLabel] = useState('')

  // Connectivity check state
  const [selectedTestModel, setSelectedTestModel] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<TestKeyResult | null>(null)

  // Model list UI state
  const [searchModel, setSearchModel] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'image' | 'video' | 'tts'>('all')
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false)
  const [sortAsc, setSortAsc] = useState(true)
  const [enabledModelMap, setEnabledModelMap] = useState<Record<string, boolean>>({})

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<CredentialEntryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CredentialEntryItem | null>(null)
  const [newLabel, setNewLabel] = useState('')

  // Synchronize when current credential changes or drawer opens
  useEffect(() => {
    if (currentCred?.value?.key) {
      setApiKey(currentCred.value.key)
    } else {
      setApiKey('')
    }
    setAccountLabel(currentCred?.label || '')

    // Load persisted proxy and client mode settings
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.proxyUrl !== undefined) setProxyUrl(parsed.proxyUrl)
        if (parsed.clientRequestMode !== undefined) setClientRequestMode(parsed.clientRequestMode)
        if (parsed.enabledModels) setEnabledModelMap(parsed.enabledModels)
      } else {
        setProxyUrl(defaultProxy)
      }
    } catch {
      setProxyUrl(defaultProxy)
    }
    setCheckResult(null)
  }, [currentCred, storageKey, defaultProxy, open])

  // Merge server models with fallback catalog models
  const providerModels: ProviderModelItem[] = useMemo(() => {
    const list: ProviderModelItem[] = []
    const pId = provider.id.toLowerCase()

    // 1. Filter models from server for this provider
    if (Array.isArray(serverModels) && serverModels.length > 0) {
      for (const m of serverModels) {
        if (
          m.providerID.toLowerCase() === pId ||
          pId.includes(m.providerID.toLowerCase()) ||
          m.providerID.toLowerCase().includes(pId)
        ) {
          const inputArr = m.capabilities?.input || []
          const outputArr = m.capabilities?.output || []
          const hasVision = inputArr.includes('image')
          const hasVideo = inputArr.includes('video')
          const hasAudio = inputArr.includes('audio') || m.type === 'tts'
          const isVid = m.type === 'video' || (outputArr.includes('video') && !outputArr.includes('text'))
          const isImg = m.type === 'image' || (outputArr.includes('image') && !outputArr.includes('text'))
          const isTts = m.type === 'tts' || (outputArr.includes('audio') && !outputArr.includes('text'))

          let releaseStr = '2025-01-01'
          if (m.time?.released) {
            try {
              releaseStr = new Date(m.time.released).toISOString().slice(0, 10)
            } catch {
              // fallback
            }
          }

          list.push({
            id: m.id,
            modelID: m.modelID || m.id,
            name: m.name,
            type: isVid ? 'video' : isImg ? 'image' : isTts ? 'tts' : 'chat',
            released: releaseStr,
            inputCost: m.cost?.[0]?.input ?? 1.5,
            outputCost: m.cost?.[0]?.output ?? 5.0,
            limitContext: m.limit?.context ?? 128_000,
            hasVision,
            hasVideo,
            hasAudio,
            hasTools: Boolean(m.capabilities?.tools),
            isNew: m.status === 'alpha' || m.status === 'beta',
            enabled: enabledModelMap[m.id] ?? (m.enabled ?? true),
          })
        }
      }
    }

    // 2. If no server models found, use fallback catalog models
    if (list.length === 0) {
      const fallbacks =
        FALLBACK_MODELS_BY_PROVIDER[pId] ||
        FALLBACK_MODELS_BY_PROVIDER[
          pId.includes('gemini') || pId.includes('google')
            ? 'google'
            : pId.includes('openai')
              ? 'openai'
              : pId.includes('anthropic')
                ? 'anthropic'
                : pId.includes('deepseek')
                  ? 'deepseek'
                  : pId.includes('groq')
                    ? 'groq'
                    : pId.includes('mistral')
                      ? 'mistral'
                      : pId.includes('together')
                        ? 'togetherai'
                        : pId.includes('xai') || pId.includes('grok')
                          ? 'xai'
                          : pId.includes('cohere')
                            ? 'cohere'
                            : pId.includes('openrouter')
                              ? 'openrouter'
                              : ''
        ] || [
          {
            id: `${pId}-standard`,
            modelID: `${pId}-standard`,
            name: `${provider.name} Standard Model`,
            type: 'chat',
            released: '2025-01-15',
            inputCost: 1.0,
            outputCost: 4.0,
            limitContext: 128_000,
            hasVision: true,
            hasVideo: false,
            hasAudio: false,
            hasTools: true,
            isNew: true,
            enabled: true,
          },
        ]

      for (const fb of fallbacks) {
        list.push({
          ...fb,
          enabled: enabledModelMap[fb.id] ?? fb.enabled,
        })
      }
    }

    return list
  }, [serverModels, provider.id, provider.name, enabledModelMap])

  // Set default connectivity check model if not selected
  useEffect(() => {
    if (!selectedTestModel && providerModels.length > 0) {
      setSelectedTestModel(providerModels[0].id)
    }
  }, [providerModels, selectedTestModel])

  // Counts for Category Tabs
  const counts = useMemo(() => {
    let all = 0
    let chat = 0
    let image = 0
    let video = 0
    let tts = 0

    for (const m of providerModels) {
      all++
      if (m.type === 'video') video++
      else if (m.type === 'image') image++
      else if (m.type === 'tts') tts++
      else chat++
    }

    return { all, chat, image, video, tts }
  }, [providerModels])

  // Filtered and Sorted Models
  const displayedModels = useMemo(() => {
    let res = providerModels

    // Tab filter
    if (activeTab === 'chat') {
      res = res.filter((m) => m.type === 'chat' || (!m.type && !m.hasVideo && !m.hasAudio))
    } else if (activeTab === 'image') {
      res = res.filter((m) => m.type === 'image')
    } else if (activeTab === 'video') {
      res = res.filter((m) => m.type === 'video')
    } else if (activeTab === 'tts') {
      res = res.filter((m) => m.type === 'tts')
    }

    // Search query filter
    if (searchModel.trim()) {
      const q = searchModel.toLowerCase().trim()
      res = res.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.modelID.toLowerCase().includes(q)
      )
    }

    // Show only enabled
    if (showOnlyEnabled) {
      res = res.filter((m) => m.enabled)
    }

    // Sort
    res = [...res].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return sortAsc ? cmp : -cmp
    })

    return res
  }, [providerModels, activeTab, searchModel, showOnlyEnabled, sortAsc])

  const enabledCount = providerModels.filter((m) => m.enabled).length

  // Toggle model enable/disable
  const handleToggleModel = (modelId: string, enabled: boolean) => {
    setEnabledModelMap((prev) => {
      const next = { ...prev, [modelId]: enabled }
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
        saved.enabledModels = next
        localStorage.setItem(storageKey, JSON.stringify(saved))
      } catch {
        // ignore
      }
      return next
    })
  }

  const handleAddNewAccount = () => {
    setSelectedCredId('new')
    setApiKey('')
    setAccountLabel('')
    setCheckResult(null)
    onAddConnection?.() || onAddKey?.()
  }

  // Handle Connectivity Check
  const handleConnectivityCheck = async () => {
    if (!apiKey.trim()) {
      toast.error(
        t('modelProvider.apiKeyTestEmptyError', 'Please enter an API Key to test')
      )
      return
    }

    setIsChecking(true)
    setCheckResult(null)
    const res = await testApiKey(
      provider.id,
      apiKey.trim(),
      proxyUrl.trim() || undefined,
      selectedTestModel
    )
    setIsChecking(false)
    setCheckResult(res)

    if (res.ok) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }

  // Save Settings
  const handleSaveConfiguration = async () => {
    if (!apiKey.trim()) {
      toast.error(
        t('modelProvider.apiKeyEmptyError', 'API Key cannot be empty')
      )
      return
    }

    try {
      // Save key in OpenCode
      await connectKey.mutateAsync({
        integrationID: provider.id,
        key: apiKey.trim(),
        label: accountLabel.trim() || undefined,
      })

      // Persist client settings in localStorage
      const settingsPayload = {
        proxyUrl: proxyUrl.trim(),
        clientRequestMode,
        enabledModels: enabledModelMap,
      }
      localStorage.setItem(storageKey, JSON.stringify(settingsPayload))

      toast.success(
        t('modelProvider.connectedSuccess', {
          defaultValue: `Configuration saved for ${provider.name}`,
          name: provider.name,
        })
      )
      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to save configuration for ${provider.name}`
      )
    }
  }

  // Switch Active Account
  const handleActivateAccount = async (id: string, label: string) => {
    try {
      await activateCred.mutateAsync(id)
      setSelectedCredId(id)
      toast.success(
        t('modelProvider.switchedActiveAccount', {
          defaultValue: `Switched active account to "${label}"`,
          label,
        })
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to switch account'
      )
    }
  }

  // Remove Connection
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await removeCred.mutateAsync(deleteTarget.id)
      toast.success(
        t('modelProvider.removedAccount', {
          defaultValue: `Removed connection "${deleteTarget.label}"`,
          label: deleteTarget.label,
        })
      )
      if (selectedCredId === deleteTarget.id) {
        setSelectedCredId(null)
      }
      setDeleteTarget(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to remove connection'
      )
    }
  }

  // Rename Account
  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renameTarget || !newLabel.trim()) return

    try {
      await updateCred.mutateAsync({
        credentialID: renameTarget.id,
        label: newLabel.trim(),
      })
      toast.success(
        t('modelProvider.renamedSuccess', {
          defaultValue: `Account renamed to "${newLabel.trim()}"`,
          label: newLabel.trim(),
        })
      )
      setRenameTarget(null)
      setNewLabel('')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to rename account'
      )
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side='right'
          className='flex w-full flex-col p-0 sm:max-w-2xl md:max-w-3xl select-text'
        >
          {/* Header Bar */}
          <SheetHeader className='flex flex-row items-center justify-between border-b border-border/50 px-6 py-4 pe-14 space-y-0'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 p-1.5'>
                <ProviderIcon providerId={provider.id} size={24} />
              </div>
              <div className='min-w-0 text-start'>
                <div className='flex items-center gap-2'>
                  <SheetTitle className='text-base font-semibold leading-tight truncate'>
                    {provider.name}
                  </SheetTitle>
                  <Badge
                    variant={credentials.length > 0 ? 'default' : 'secondary'}
                    className='text-[10px] h-4.5 px-1.5'
                  >
                    {credentials.length > 0
                      ? t('modelProvider.connected', 'Connected')
                      : t('modelProvider.notConfigured', 'Not configured')}
                  </Badge>
                </div>
                <SheetDescription className='text-xs text-muted-foreground truncate'>
                  {credentials.length > 0
                    ? t('modelProvider.keysSaved', {
                        count: credentials.length,
                        defaultValue: `${credentials.length} account(s) saved`,
                      })
                    : t('modelProvider.supportsApiKey', 'Supports API Key auth')}
                </SheetDescription>
              </div>
            </div>

            {/* Account Selector if multiple accounts exist */}
            <div className='flex items-center gap-1.5'>
              {credentials.length > 0 && (
                <Select
                  value={selectedCredId === 'new' ? 'new' : currentCred?.id}
                  onValueChange={(val) => {
                    setSelectedCredId(val)
                    if (val === 'new') {
                      setApiKey('')
                      setAccountLabel('')
                    }
                  }}
                >
                  <SelectTrigger className='h-8 text-xs w-[170px]'>
                    <SelectValue placeholder='Select account' />
                  </SelectTrigger>
                  <SelectContent>
                    {credentials.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label || 'API Key'} {c.active ? '(Active)' : ''}
                      </SelectItem>
                    ))}
                    <SelectItem value='new'>
                      + {t('modelProvider.addConnection', 'Add Connection')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {credentials.length > 0 && selectedCredId !== 'new' && (
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 px-2 text-xs gap-1'
                  onClick={handleAddNewAccount}
                  title={t('modelProvider.addAnotherKey', 'Add Connection')}
                >
                  <Plus className='h-3.5 w-3.5' />
                  <span className='hidden sm:inline'>{t('modelProvider.addConnection', 'Add Connection')}</span>
                </Button>
              )}

              {currentCred && !currentCred.active && selectedCredId !== 'new' && (
                <Button
                  size='sm'
                  variant='outline'
                  className='h-8 px-2 text-xs'
                  onClick={() => handleActivateAccount(currentCred.id, currentCred.label)}
                >
                  <Check className='mr-1 h-3.5 w-3.5' />
                  {t('modelProvider.useThisKey', 'Use')}
                </Button>
              )}

              {currentCred && selectedCredId !== 'new' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-40'>
                    <DropdownMenuItem
                      onClick={() => {
                        setRenameTarget(currentCred)
                        setNewLabel(currentCred.label)
                      }}
                    >
                      <Pencil className='mr-2 h-3.5 w-3.5' />
                      {t('modelProvider.rename', 'Rename')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      onClick={() => setDeleteTarget(currentCred)}
                    >
                      <Trash2 className='mr-2 h-3.5 w-3.5' />
                      {t('common:operation.delete', 'Delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className='flex-1 overflow-y-auto px-6 py-6 space-y-6 select-text'>
            {/* Top Form: API Key, Proxy URL, Client Request Mode, Connectivity Check */}
            <div className='space-y-4'>
              {/* Row 1: Account Name / Label */}
              <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                <div className='sm:w-5/12'>
                  <Label className='text-sm font-semibold text-foreground'>
                    {t('modelProvider.connectionName', 'Connect Name')}
                  </Label>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {t('modelProvider.connectionNameSubtitle', 'Optional name to identify this connection')}
                  </p>
                </div>

                <div className='sm:w-7/12'>
                  <Input
                    type='text'
                    name='provider-account-label'
                    id='provider-account-label'
                    autoComplete='off'
                    data-form-type='other'
                    placeholder={t('modelProvider.connectionNamePlaceholder', 'e.g. Personal Key, Work')}
                    value={accountLabel}
                    onChange={(e) => setAccountLabel(e.target.value)}
                    className='text-xs h-9'
                  />
                </div>
              </div>

              {/* Row 2: API Key */}
              <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                <div className='sm:w-5/12'>
                  <Label className='text-sm font-semibold text-foreground'>
                    {t('modelProvider.apiKey', 'API Key')}
                  </Label>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {t('modelProvider.apiKeySubtitle', {
                      defaultValue: `Please enter your ${provider.name} API Key`,
                      name: provider.name,
                    })}
                  </p>
                </div>

                <div className='sm:w-7/12'>
                  <div className='relative'>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name='provider-secret-access-token'
                      id='provider-secret-access-token'
                      autoComplete='new-password'
                      autoCorrect='off'
                      autoCapitalize='off'
                      spellCheck={false}
                      data-1p-ignore
                      data-lpignore='true'
                      data-bwignore='true'
                      data-form-type='other'
                      placeholder={
                        isAddingNew
                          ? provider.id.includes('google') || provider.id.includes('gemini')
                            ? 'AIzaSy...'
                            : provider.id.includes('openai')
                              ? 'sk-...'
                              : provider.id.includes('anthropic')
                                ? 'sk-ant-...'
                                : 'Enter your API key...'
                          : '••••••••••••••••••••••••••••'
                      }
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value)
                        setCheckResult(null)
                      }}
                      className='pe-9 font-mono text-xs h-9'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground'
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: API Proxy URL */}
              <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                <div className='sm:w-5/12'>
                  <Label className='text-sm font-semibold text-foreground'>
                    {t('modelProvider.apiProxyUrl', 'API Proxy URL')}
                  </Label>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {t('modelProvider.apiProxyUrlSubtitle', 'Must include http(s)://')}
                  </p>
                </div>

                <div className='sm:w-7/12'>
                  <Input
                    type='text'
                    name='provider-proxy-url'
                    id='provider-proxy-url'
                    autoComplete='off'
                    data-form-type='other'
                    placeholder={defaultProxy || 'https://api.example.com'}
                    value={proxyUrl}
                    onChange={(e) => {
                      setProxyUrl(e.target.value)
                      setCheckResult(null)
                    }}
                    className='font-mono text-xs h-9'
                  />
                </div>
              </div>

              {/* Row 3: Use Client Request Mode */}
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between hidden'>
                <div className='sm:w-5/12'>
                  <Label className='text-sm font-semibold text-foreground'>
                    {t('modelProvider.clientRequestMode', 'Use Client Request Mode')}
                  </Label>
                  <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
                    {t(
                      'modelProvider.clientRequestModeSubtitle',
                      'Client request mode will initiate session requests directly from the browser, which can improve response speed'
                    )}
                  </p>
                </div>

                <div className='sm:w-7/12 flex justify-end'>
                  <Switch
                    checked={clientRequestMode}
                    onCheckedChange={setClientRequestMode}
                  />
                </div>
              </div>

              {/* Row 4: Connectivity Check */}
              <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                <div className='sm:w-5/12'>
                  <Label className='text-sm font-semibold text-foreground'>
                    {t('modelProvider.connectivityCheck', 'Connectivity Check')}
                  </Label>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {t(
                      'modelProvider.connectivityCheckSubtitle',
                      'Test if the API Key and proxy URL are correctly filled'
                    )}
                  </p>
                </div>

                <div className='sm:w-7/12 flex items-center gap-2'>
                  <Select
                    value={selectedTestModel}
                    onValueChange={setSelectedTestModel}
                  >
                    <SelectTrigger className='h-9 flex-1 text-xs font-mono'>
                      <SelectValue placeholder='Select model' />
                    </SelectTrigger>
                    <SelectContent>
                      {providerModels.map((m) => (
                        <SelectItem key={m.id} value={m.id} className='font-mono text-xs'>
                          {m.modelID}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-9 px-4 text-xs font-medium shrink-0'
                    onClick={handleConnectivityCheck}
                    disabled={isChecking || !apiKey.trim()}
                  >
                    {isChecking ? (
                      <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    ) : null}
                    {t('modelProvider.check', 'Check')}
                  </Button>
                </div>
              </div>

              {/* Connectivity result badge */}
              {checkResult && (
                <div
                  className={`flex items-start gap-2 rounded-md p-2.5 text-xs ${
                    checkResult.ok
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border border-destructive/30 bg-destructive/10 text-destructive'
                  }`}
                >
                  {checkResult.ok ? (
                    <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-500' />
                  ) : (
                    <AlertCircle className='h-4 w-4 shrink-0' />
                  )}
                  <span>{checkResult.message}</span>
                </div>
              )}

              {/* Security encryption notice */}
              <div className='flex items-center justify-left gap-1.5 pt-2 text-xs text-muted-foreground'>
                <Lock className='h-3.5 w-3.5' />
                <span>
                  {t(
                    'modelProvider.aesGcmNoticeFront',
                    'Your key and proxy URL will be encrypted using'
                  )}{' '}
                  <span className='font-medium text-primary'>AES-GCM</span>{' '}
                  {t('modelProvider.aesGcmNoticeBack', 'encryption algorithm')}
                </span>
              </div>
            </div>

            <Separator />

            {/* Bottom Section: Model List */}
            <div className='space-y-4'>
              {/* Header Bar */}
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <h3 className='text-base font-bold text-foreground'>
                  {t('modelProvider.modelList', 'Model List')}
                </h3>

                <div className='flex items-center gap-2'>
                  <div className='relative w-44 sm:w-56'>
                    <Search className='absolute inset-y-0 start-2.5 my-auto h-3.5 w-3.5 text-muted-foreground' />
                    <Input
                      placeholder={t('modelProvider.searchModels', 'Search Models...')}
                      value={searchModel}
                      onChange={(e) => setSearchModel(e.target.value)}
                      className='ps-8 h-8 text-xs'
                    />
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 px-2.5 text-xs gap-1.5'
                    onClick={async () => {
                      try {
                        const res = await refetchServerModels()
                        if (res.data && res.data.length > 0) {
                          toast.success(t('modelProvider.fetchModelsSuccess', 'Models refreshed from server successfully'))
                        } else {
                          toast.info(t('modelProvider.fetchModelsEmpty', 'No models found on server for this provider.'))
                        }
                      } catch {
                        toast.error(t('modelProvider.fetchModelsError', 'Failed to fetch models from server'))
                      }
                    }}
                    disabled={isFetchingModels}
                  >
                    <RotateCw
                      className={`h-3.5 w-3.5 ${
                        isFetchingModels ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{t('modelProvider.fetchModels', 'Fetch models')}</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-muted-foreground'
                      >
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-40'>
                      <DropdownMenuItem
                        onClick={() => {
                          const next: Record<string, boolean> = {}
                          for (const m of providerModels) next[m.id] = true
                          setEnabledModelMap(next)
                          toast.success('All models enabled')
                        }}
                      >
                        Enable All
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const next: Record<string, boolean> = {}
                          for (const m of providerModels) next[m.id] = false
                          setEnabledModelMap(next)
                          toast.info('All models disabled')
                        }}
                      >
                        Disable All
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className='flex items-center gap-2 border-b border-border/50 pb-1 text-xs'>
                <button
                  type='button'
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutGrid className='h-3.5 w-3.5' />
                  <span>
                    {t('modelProvider.tabAll', 'All')} ({counts.all})
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className='h-3.5 w-3.5' />
                  <span>
                    {t('modelProvider.tabChat', 'Chat')} ({counts.chat})
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() => setActiveTab('image')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-medium transition-colors ${
                    activeTab === 'image'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ImageIcon className='h-3.5 w-3.5' />
                  <span>
                    {t('modelProvider.tabImage', 'Image')} ({counts.image})
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-medium transition-colors ${
                    activeTab === 'video'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Video className='h-3.5 w-3.5' />
                  <span>
                    {t('modelProvider.tabVideo', 'Video')} ({counts.video})
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() => setActiveTab('tts')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-medium transition-colors ${
                    activeTab === 'tts'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AudioLines className='h-3.5 w-3.5' />
                  <span>
                    {t('modelProvider.tabTts', 'TTS')} ({counts.tts})
                  </span>
                </button>
              </div>

              {/* Subheader: Enabled count & Filter icons */}
              <div className='flex items-center justify-between text-xs text-muted-foreground pt-1'>
                <span className='font-medium'>
                  {t('modelProvider.enabled', 'Enabled')} ({enabledCount})
                </span>

                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setShowOnlyEnabled(!showOnlyEnabled)}
                    className={`rounded p-1 transition-colors ${
                      showOnlyEnabled
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title='Filter enabled models'
                  >
                    <Eye className='h-4 w-4' />
                  </button>

                  <button
                    type='button'
                    onClick={() => setSortAsc(!sortAsc)}
                    className='rounded p-1 text-muted-foreground hover:text-foreground transition-colors'
                    title='Sort by name'
                  >
                    <ArrowUpDown className='h-4 w-4' />
                  </button>
                </div>
              </div>

              {/* Models List Rows */}
              <div className='space-y-2.5'>
                {displayedModels.map((model) => {
                  return (
                    <div
                      key={model.id}
                      className='flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-border'
                    >
                      {/* Left: Icon, Name, ID badge, New badge, Subtitle */}
                      <div className='flex items-center gap-3 min-w-0 flex-1'>
                        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 p-1'>
                          <ProviderIcon providerId={provider.id} size={22} />
                        </div>

                        <div className='min-w-0 flex-1 select-text'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <span className='text-sm font-semibold text-foreground truncate leading-tight select-text'>
                              {model.name}
                            </span>
                            <span className='rounded border border-border/60 bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground select-text'>
                              {model.modelID}
                            </span>
                            {model.isNew && (
                              <Badge
                                variant='outline'
                                className='border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] py-0 px-1.5 select-text'
                              >
                                {t('modelProvider.newBadge', 'New')}
                              </Badge>
                            )}
                          </div>

                          <p className='text-xs text-muted-foreground mt-0.5 truncate select-text'>
                            Released at {model.released || '2025-01-01'} · Input $
                            {model.inputCost?.toFixed(2) || '1.00'}/M · Output $
                            {model.outputCost?.toFixed(2) || '4.00'}/M
                          </p>
                        </div>
                      </div>

                      {/* Right: Capability icons, Context limit, Switch */}
                      <div className='flex items-center gap-3 shrink-0'>
                        <div className='flex items-center gap-1.5'>
                          {model.hasVision && (
                            <span
                              className='inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              title='Vision'
                            >
                              <Eye className='h-3.5 w-3.5' />
                            </span>
                          )}
                          {model.hasVideo && (
                            <span
                              className='inline-flex h-6 w-6 items-center justify-center rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400'
                              title='Video'
                            >
                              <Video className='h-3.5 w-3.5' />
                            </span>
                          )}
                          {model.hasAudio && (
                            <span
                              className='inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              title='Audio / TTS'
                            >
                              <AudioLines className='h-3.5 w-3.5' />
                            </span>
                          )}
                          {model.hasTools && (
                            <span
                              className='inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              title='Tools'
                            >
                              <Wrench className='h-3.5 w-3.5' />
                            </span>
                          )}
                          <span className='inline-flex h-6 items-center justify-center rounded-md bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground'>
                            {formatContext(model.limitContext)}
                          </span>
                        </div>

                        <Switch
                          checked={model.enabled}
                          onCheckedChange={(val) => handleToggleModel(model.id, val)}
                        />
                      </div>
                    </div>
                  )
                })}

                {displayedModels.length === 0 && (
                  <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground'>
                    <Sparkles className='mb-2 h-7 w-7 text-muted-foreground/50' />
                    <p className='font-semibold text-foreground'>
                      {credentials.length === 0
                        ? t('modelProvider.noModelsUnconfigured', 'Provider not connected yet')
                        : searchModel.trim()
                          ? t('modelProvider.noModelsFound', 'No models found matching your search.')
                          : t('modelProvider.noModelsAvailable', 'No models available for this provider.')}
                    </p>
                    <p className='text-[11px] text-muted-foreground mt-1 max-w-sm'>
                      {credentials.length === 0
                        ? t(
                            'modelProvider.noModelsUnconfiguredDesc',
                            'Enter your API Key above and click Connect to authenticate and load live models.'
                          )
                        : t('modelProvider.tryDifferentFilter', 'Try adjusting your search or category filter.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className='flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onOpenChange(false)}
            >
              {t('common:operation.cancel', 'Cancel')}
            </Button>

            <Button
              type='button'
              size='sm'
              onClick={handleSaveConfiguration}
              disabled={connectKey.isPending}
            >
              {connectKey.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <ShieldCheck className='mr-1.5 h-4 w-4' />
              )}
              {isAddingNew
                ? t('modelProvider.connectProvider', {
                    defaultValue: `Connect ${provider.name}`,
                    name: provider.name,
                  })
                : t('modelProvider.saveConfiguration', 'Save Configuration')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Rename Dialog */}
      <Dialog
        open={Boolean(renameTarget)}
        onOpenChange={(next) => {
          if (!next) setRenameTarget(null)
        }}
      >
        <DialogContent className='sm:max-w-[400px]'>
          <form onSubmit={handleSaveRename}>
            <DialogHeader>
              <DialogTitle>{t('modelProvider.renameAccount')}</DialogTitle>
              <DialogDescription>
                {t('modelProvider.renameAccountDesc')}
              </DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <Label htmlFor='sheet-rename-label'>
                {t('modelProvider.accountLabel')}
              </Label>
              <Input
                id='sheet-rename-label'
                className='mt-2'
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                autoFocus
                required
              />
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setRenameTarget(null)}
              >
                {t('common:operation.cancel', 'Cancel')}
              </Button>
              <Button type='submit' disabled={updateCred.isPending}>
                {updateCred.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {t('common:operation.save', 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next && !removeCred.isPending) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('modelProvider.removeConnectionTitle', 'Delete Connection')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('modelProvider.removeConnectionDesc', {
                defaultValue: `Are you sure you want to delete connection "${deleteTarget?.label}"? This action cannot be undone.`,
                label: deleteTarget?.label,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeCred.isPending}>
              {t('common:operation.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={removeCred.isPending}
            >
              {removeCred.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {t('common:operation.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
