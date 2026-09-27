import { parseJournal } from '../game/journal'
import { parseSave } from '../game/storage'
import type { Journal } from '../game/journal'
import type { Save } from '../game/types'
import { parseSettings, type AppSettings } from './prefs'

export interface BackupFile {
  kind: 'animus-backup'
  version: 1
  save: Save
  journal: Journal
  settings: AppSettings
}

export interface RestoredBackup {
  save: Save
  journal: Journal | null
  settings: AppSettings | null
}

export function readBackup(text: string, today: string): RestoredBackup | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null
  const record = data as { kind?: unknown; save?: unknown; journal?: unknown; settings?: unknown }
  const saveSource = record.kind === 'animus-backup' ? record.save : data
  const save = parseSave(JSON.stringify(saveSource))
  if (!save) return null
  if (record.kind !== 'animus-backup') return { save, journal: null, settings: null }
  return {
    save,
    journal: parseJournal(record.journal, today),
    settings: parseSettings(record.settings),
  }
}
