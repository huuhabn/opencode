import { useState, useEffect, useCallback } from 'react'
import {
  type AgentSettings,
  DEFAULT_AGENT_SETTINGS,
  AGENT_SETTINGS_STORAGE_KEY,
} from './types'

export function useAgentSettings() {
  const [settings, setSettings] = useState<AgentSettings>(() => {
    try {
      const stored = localStorage.getItem(AGENT_SETTINGS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_AGENT_SETTINGS, ...parsed }
      }
    } catch {
      // fallback
    }
    return DEFAULT_AGENT_SETTINGS
  })

  const [savedAt, setSavedAt] = useState<number | null>(null)

  const saveSettings = useCallback((newSettings: AgentSettings) => {
    try {
      localStorage.setItem(AGENT_SETTINGS_STORAGE_KEY, JSON.stringify(newSettings))
      setSavedAt(Date.now())
      // Dispatch storage event for other components listening
      window.dispatchEvent(new Event('agent-settings-updated'))
    } catch {
      // ignore
    }
  }, [])

  const updateSetting = useCallback(
    <K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        saveSettings(next)
        return next
      })
    },
    [saveSettings]
  )

  const resetDefaults = useCallback(() => {
    setSettings(DEFAULT_AGENT_SETTINGS)
    saveSettings(DEFAULT_AGENT_SETTINGS)
  }, [saveSettings])

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem(AGENT_SETTINGS_STORAGE_KEY)
        if (stored) {
          setSettings({ ...DEFAULT_AGENT_SETTINGS, ...JSON.parse(stored) })
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener('agent-settings-updated', handleStorage)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('agent-settings-updated', handleStorage)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  return {
    settings,
    updateSetting,
    resetDefaults,
    savedAt,
  }
}
