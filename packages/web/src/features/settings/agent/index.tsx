import { useMemo } from 'react'
import {
  Bot,
  Zap,
  Eye,
  RotateCcw,
  Check,
  ShieldCheck,
  Terminal,
  Sliders,
  FileCode,
  Flame,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgentSettings } from './use-agent-settings'
import { useModels, useDefaultModel } from '@/features/settings/models/api'

export function AgentSettings() {
  const { t } = useTranslation(['model-provider', 'common'])
  const { settings, updateSetting, resetDefaults, savedAt } = useAgentSettings()

  const { data: modelsData } = useModels()
  const { data: defaultModelData } = useDefaultModel()

  const modelsList = useMemo(() => {
    if (!modelsData || !Array.isArray(modelsData)) return []
    return modelsData
  }, [modelsData])

  const handleReset = () => {
    resetDefaults()
    toast.success(t('modelProvider.settingsResetSuccess', 'Agent settings restored to defaults'))
  }

  return (
    <div className='w-full space-y-4 pb-12 select-text'>
      {/* Header Bar */}
      <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-3'>
        <div>
          <div className='flex items-center gap-2'>
            <Bot className='h-5 w-5 text-primary' />
            <h2 className='text-lg font-bold tracking-tight'>
              {t('modelProvider.agentSettingsTitle', 'AI Agent Configuration')}
            </h2>
          </div>
          <p className='text-sm text-muted-foreground mt-0.5'>
            {t(
              'modelProvider.agentSettingsDesc',
              'Configure execution autonomy, interaction preferences, and default model parameters.'
            )}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {savedAt && (
            <Badge
              variant='outline'
              className='text-xs h-6 px-2 gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-normal transition-all'
            >
              <Check className='h-3 w-3' />
              {t('modelProvider.autoSaved', 'Saved')}
            </Badge>
          )}

          <Button
            variant='outline'
            size='sm'
            onClick={handleReset}
            className='gap-1 text-sm h-8 px-3 text-muted-foreground hover:text-foreground'
          >
            <RotateCcw className='h-3.5 w-3.5' />
            {t('modelProvider.resetDefaults', 'Reset Defaults')}
          </Button>
        </div>
      </div>

      {/* SECTION 1: Execution & Interaction */}
      <Card className='p-0 gap-0 border-border/60 shadow-xs rounded-lg overflow-hidden'>
        <CardHeader className='px-4 py-3 border-b border-border/40 gap-1 [.border-b]:pb-3'>
          <div className='flex items-center gap-2'>
            <Zap className='h-4 w-4 text-amber-500' />
            <CardTitle className='text-base font-semibold'>
              {t('modelProvider.agentSectionExecution', 'Execution & Interaction')}
            </CardTitle>
          </div>
          <CardDescription className='text-sm text-muted-foreground leading-normal'>
            {t(
              'modelProvider.agentSectionExecutionDesc',
              'Control how the agent handles user prompts during thinking, tool permissions, and task looping.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0 divide-y divide-border/40'>
          {/* Row 1: Follow-up Behavior */}
          <div className='px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5 max-w-lg'>
              <Label className='text-sm font-medium text-foreground'>
                {t('modelProvider.followUpBehavior', 'Follow-up Behavior')}
              </Label>
              <p className='text-xs text-muted-foreground leading-normal'>
                {t(
                  'modelProvider.followUpBehaviorDesc',
                  'Choose whether incoming user messages immediately steer the ongoing agent step or queue until finished.'
                )}
              </p>
            </div>
            <Select
              value={settings.followUpBehavior}
              onValueChange={(val: 'steer' | 'queue') => updateSetting('followUpBehavior', val)}
            >
              <SelectTrigger className='w-[160px] h-8 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='steer'>
                  {t('modelProvider.followUpSteer', 'Steer (Immediate)')}
                </SelectItem>
                <SelectItem value='queue'>
                  {t('modelProvider.followUpQueue', 'Queue (Sequential)')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Auto-Approve Permissions */}
          <div className='px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5 max-w-lg'>
              <div className='flex items-center gap-1.5'>
                <Label className='text-sm font-medium text-foreground'>
                  {t('modelProvider.autoApprovePermissions', 'Auto-Approve Tool Permissions')}
                </Label>
                <ShieldCheck className='h-4 w-4 text-emerald-500' />
              </div>
              <p className='text-xs text-muted-foreground leading-normal'>
                {t(
                  'modelProvider.autoApprovePermissionsDesc',
                  'Allow the agent to automatically execute shell commands and modify code without pausing for confirmation.'
                )}
              </p>
            </div>
            <Switch
              checked={settings.autoApprovePermissions}
              onCheckedChange={(checked) => updateSetting('autoApprovePermissions', checked)}
            />
          </div>

          {/* Row 3: Max Iteration Steps */}
          <div className='px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5 max-w-lg'>
              <Label className='text-sm font-medium text-foreground'>
                {t('modelProvider.maxStepsTitle', 'Max Iteration Steps')}
              </Label>
              <p className='text-xs text-muted-foreground leading-normal'>
                {t(
                  'modelProvider.maxStepsDesc',
                  'Upper limit on tool calls and thinking iterations per turn to prevent unbounded execution loops.'
                )}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                min={5}
                max={100}
                value={settings.maxSteps}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  if (!isNaN(val) && val >= 1) {
                    updateSetting('maxSteps', Math.min(100, Math.max(1, val)))
                  }
                }}
                className='w-20 h-8 text-sm text-center font-mono'
              />
              <span className='text-xs text-muted-foreground'>
                {t('modelProvider.stepsUnit', 'steps')}
              </span>
            </div>
          </div>

          {/* Row 4: Custom Subagents */}
          <div className='px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5 max-w-lg'>
              <Label className='text-sm font-medium text-foreground'>
                {t('modelProvider.showCustomAgents', 'Custom Subagents')}
              </Label>
              <p className='text-xs text-muted-foreground leading-normal'>
                {t(
                  'modelProvider.showCustomAgentsDesc',
                  'Allow the agent to dynamically invoke specialized subagents (e.g. researcher, reviewer).'
                )}
              </p>
            </div>
            <Switch
              checked={settings.showCustomAgents}
              onCheckedChange={(checked) => updateSetting('showCustomAgents', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Model & Prompt Parameters */}
      <Card className='p-0 gap-0 border-border/60 shadow-xs rounded-lg overflow-hidden'>
        <CardHeader className='px-4 py-3 border-b border-border/40 gap-1 [.border-b]:pb-3'>
          <div className='flex items-center gap-2'>
            <Sliders className='h-4 w-4 text-primary' />
            <CardTitle className='text-base font-semibold'>
              {t('modelProvider.agentSectionModel', 'Model & Prompt Parameters')}
            </CardTitle>
          </div>
          <CardDescription className='text-sm text-muted-foreground leading-normal'>
            {t(
              'modelProvider.agentSectionModelDesc',
              'Specify default model routing, creativity temperature, and system guidance.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0 divide-y divide-border/40'>
          {/* Row 1: Default Model Selection */}
          <div className='px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5 max-w-lg'>
              <Label className='text-sm font-medium text-foreground'>
                {t('modelProvider.agentDefaultModel', 'Primary Agent Model')}
              </Label>
              <p className='text-xs text-muted-foreground leading-normal'>
                {t(
                  'modelProvider.agentDefaultModelDesc',
                  'The default AI model selected when initiating new conversation sessions.'
                )}
              </p>
            </div>
            <Select
              value={settings.defaultModelId || defaultModelData?.id || 'auto'}
              onValueChange={(val) => updateSetting('defaultModelId', val === 'auto' ? '' : val)}
            >
              <SelectTrigger className='w-[220px] h-8 text-sm'>
                <SelectValue placeholder={t('modelProvider.autoDefaultModel', 'Server Auto / Default')} />
              </SelectTrigger>
              <SelectContent className='max-h-60'>
                <SelectItem value='auto'>
                  {t('modelProvider.autoDefaultModel', 'Server Auto / Default')}
                </SelectItem>
                {modelsList.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <span className='font-mono text-sm'>{model.name || model.id}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Temperature */}
          <div className='px-4 py-3 space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <div className='flex items-center gap-1.5'>
                  <Label className='text-sm font-medium text-foreground'>
                    {t('modelProvider.temperature', 'Creativity (Temperature)')}
                  </Label>
                  <Flame className='h-3.5 w-3.5 text-orange-500' />
                </div>
                <p className='text-xs text-muted-foreground leading-normal'>
                  {t(
                    'modelProvider.temperatureDesc',
                    'Lower values produce focused code; higher values encourage creative problem-solving.'
                  )}
                </p>
              </div>
              <Badge variant='outline' className='font-mono text-xs font-semibold px-2 py-0.5'>
                {settings.temperature.toFixed(2)}
              </Badge>
            </div>

            <div className='pt-1'>
              <input
                type='range'
                min={0}
                max={1}
                step={0.05}
                value={settings.temperature}
                onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary'
              />
              <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                <span>0.0 ({t('modelProvider.tempStrict', 'Strict')})</span>
                <span>0.7 ({t('modelProvider.tempBalanced', 'Balanced')})</span>
                <span>1.0 ({t('modelProvider.tempCreative', 'Creative')})</span>
              </div>
            </div>
          </div>

          {/* Row 3: Custom System Instructions */}
          <div className='px-4 py-3 space-y-1.5'>
            <Label className='text-sm font-medium text-foreground'>
              {t('modelProvider.customInstructions', 'Custom System Instructions')}
            </Label>
            <p className='text-xs text-muted-foreground leading-normal'>
              {t(
                'modelProvider.customInstructionsDesc',
                'Global instructions injected into the system prompt for every session.'
              )}
            </p>
            <Textarea
              rows={3}
              value={settings.customInstructions}
              onChange={(e) => updateSetting('customInstructions', e.target.value)}
              placeholder={t(
                'modelProvider.customInstructionsPlaceholder',
                'e.g. Always write code in TypeScript, keep explanations concise, use conventional commit format...'
              )}
              className='text-sm font-mono leading-relaxed bg-background/80 resize-y min-h-[80px] p-2.5'
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Agent Activity & Tool Visibility */}
      <Card className='p-0 gap-0 border-border/60 shadow-xs rounded-lg overflow-hidden'>
        <CardHeader className='px-4 py-3 border-b border-border/40 gap-1 [.border-b]:pb-3'>
          <div className='flex items-center gap-2'>
            <Eye className='h-4 w-4 text-indigo-500' />
            <CardTitle className='text-base font-semibold'>
              {t('modelProvider.agentSectionVisibility', 'Activity & Tool Output Visibility')}
            </CardTitle>
          </div>
          <CardDescription className='text-sm text-muted-foreground leading-normal'>
            {t(
              'modelProvider.agentSectionVisibilityDesc',
              'Customize how detailed thinking steps, tool outputs, and code changes are presented.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0 divide-y divide-border/40'>
          {/* Row 1: Thinking Detail */}
          <div className='px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5 max-w-lg'>
              <Label className='text-sm font-medium text-foreground'>
                {t('modelProvider.thinkingDetail', 'Thinking Process Display')}
              </Label>
              <p className='text-xs text-muted-foreground leading-normal'>
                {t(
                  'modelProvider.thinkingDetailDesc',
                  'Display reasoning spans expanded by default or collapsed into a neat accordion.'
                )}
              </p>
            </div>
            <Select
              value={settings.thinkingDetail}
              onValueChange={(val: 'expanded' | 'collapsed') => updateSetting('thinkingDetail', val)}
            >
              <SelectTrigger className='w-[160px] h-8 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='collapsed'>
                  {t('modelProvider.thinkingCollapsed', 'Collapsed (Default)')}
                </SelectItem>
                <SelectItem value='expanded'>
                  {t('modelProvider.thinkingExpanded', 'Expanded')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Shell Output Visibility */}
          <div className='px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5 max-w-lg'>
              <div className='flex items-center gap-1.5'>
                <Label className='text-sm font-medium text-foreground'>
                  {t('modelProvider.shellVisibility', 'Shell & Command Output')}
                </Label>
                <Terminal className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-xs text-muted-foreground leading-normal'>
                {t(
                  'modelProvider.shellVisibilityDesc',
                  'Configure whether command-line executions appear as individual blocks or grouped.'
                )}
              </p>
            </div>
            <Select
              value={settings.shellVisibility}
              onValueChange={(val: 'separate' | 'grouped' | 'hidden') =>
                updateSetting('shellVisibility', val)
              }
            >
              <SelectTrigger className='w-[160px] h-8 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='separate'>
                  {t('modelProvider.shellSeparate', 'Separate Blocks')}
                </SelectItem>
                <SelectItem value='grouped'>
                  {t('modelProvider.shellGrouped', 'Grouped')}
                </SelectItem>
                <SelectItem value='hidden'>
                  {t('modelProvider.shellHidden', 'Hidden')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 3: Turn Diffs */}
          <div className='px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-0.5 max-w-lg'>
              <div className='flex items-center gap-1.5'>
                <Label className='text-sm font-medium text-foreground'>
                  {t('modelProvider.showTurnDiffs', 'File Modification Diffs')}
                </Label>
                <FileCode className='h-4 w-4 text-muted-foreground' />
              </div>
              <p className='text-xs text-muted-foreground leading-normal'>
                {t(
                  'modelProvider.showTurnDiffsDesc',
                  'Display inline unified diffs for every file created or modified by the agent.'
                )}
              </p>
            </div>
            <Switch
              checked={settings.showTurnDiffs}
              onCheckedChange={(checked) => updateSetting('showTurnDiffs', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
