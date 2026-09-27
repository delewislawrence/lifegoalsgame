import { useEffect, useState } from 'react'
import type { SequenceId } from '../game/types'
import { loadSettings, type ThemeId } from './prefs'

const LEVELS: Record<ThemeId, readonly string[]> = {
  animus: ['Initiate', 'Recruit', 'Apprentice', 'Assassin', 'Master Assassin', 'Mentor', 'Grandmaster', 'Full Synchronization'],
  cyber: ['Guest', 'User', 'Operator', 'Root', 'Sysadmin', 'Kernel', 'Architect', 'Full Access'],
  zen: ['Beginner', 'Student', 'Practitioner', 'Adept', 'Guide', 'Teacher', 'Elder', 'Still Point'],
  ash: ['Page', 'Chapter', 'Volume', 'Binding', 'Press', 'Editor', 'Publisher', 'Canon'],
  ember: ['Spark', 'Kindling', 'Flame', 'Hearth', 'Smith', 'Kiln', 'Beacon', 'Wildfire'],
}

const SEQUENCES: Record<ThemeId, Record<SequenceId, string>> = {
  animus: { awakening: 'The Awakening', apprentice: 'The Apprentice', assassin: 'The Assassin', master: 'The Master' },
  cyber: { awakening: 'Boot', apprentice: 'Compile', assassin: 'Execute', master: 'Persist' },
  zen: { awakening: 'The Opening', apprentice: 'The Practice', assassin: 'The Deepening', master: 'The Stillness' },
  ash: { awakening: 'The Margin', apprentice: 'The Draft', assassin: 'The Revision', master: 'The Edition' },
  ember: { awakening: 'The Spark', apprentice: 'The Hearth', assassin: 'The Forge', master: 'The Beacon' },
}

export function levelTitle(theme: ThemeId, level: number): string {
  return LEVELS[theme][level - 1] ?? LEVELS.animus[level - 1] ?? 'Initiate'
}

export function sequenceName(theme: ThemeId, id: SequenceId): string {
  return SEQUENCES[theme][id]
}

const SEQUENCE_ACHIEVEMENTS: Record<string, SequenceId> = {
  'sequence-01': 'awakening',
  'sequence-02': 'apprentice',
  'sequence-03': 'assassin',
  'sequence-04': 'master',
}

export function achievementDescription(theme: ThemeId, id: string, fallback: string): string {
  const sequence = SEQUENCE_ACHIEVEMENTS[id]
  return sequence ? `Complete ${sequenceName(theme, sequence)}.` : fallback
}

export function useThemeId(): ThemeId {
  const [theme, setTheme] = useState<ThemeId>(() => loadSettings().theme)
  useEffect(() => {
    const sync = () => setTheme(loadSettings().theme)
    window.addEventListener('animus-theme', sync)
    return () => window.removeEventListener('animus-theme', sync)
  }, [])
  return theme
}
