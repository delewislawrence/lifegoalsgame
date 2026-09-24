import { createSave } from './reducer'
import type { Save } from './types'

export const SAVE_KEY = 'animus-save-v1'

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return createSave()
    const parsed = JSON.parse(raw) as Save
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.events) || !parsed.startedAt) {
      return createSave()
    }
    return parsed
  } catch {
    return createSave()
  }
}

export function persistSave(save: Save): string | null {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    return null
  } catch {
    return 'This browser could not store the campaign. Export a backup from Profile.'
  }
}

export function parseSave(raw: string): Save | null {
  try {
    const parsed = JSON.parse(raw) as Save
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.events) || typeof parsed.startedAt !== 'string') {
      return null
    }
    if (!parsed.contracts || !parsed.achievementUnlocks || !Array.isArray(parsed.history)) return null
    return parsed
  } catch {
    return null
  }
}
