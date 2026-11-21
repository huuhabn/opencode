export interface AgentSettings {
  // 1. Execution & Interaction
  followUpBehavior: 'steer' | 'queue'
  autoApprovePermissions: boolean
  maxSteps: number
  showCustomAgents: boolean

  // 2. Model & Prompt Parameters
  defaultModelId: string
  temperature: number
  customInstructions: string

  // 3. Agent Activity & Tool Visibility
  thinkingDetail: 'expanded' | 'collapsed'
  shellVisibility: 'separate' | 'grouped' | 'hidden'
  showTurnDiffs: boolean
}

export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  followUpBehavior: 'steer',
  autoApprovePermissions: false,
  maxSteps: 25,
  showCustomAgents: true,
  defaultModelId: '',
  temperature: 0.7,
  customInstructions: '',
  thinkingDetail: 'collapsed',
  shellVisibility: 'separate',
  showTurnDiffs: true,
}

export const AGENT_SETTINGS_STORAGE_KEY = 'opencode_agent_settings_v1'
