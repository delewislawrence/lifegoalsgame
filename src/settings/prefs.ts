import { parseGoalPlan } from '../ai/plan'
import type { GoalPlan } from '../ai/plan'

export const SETTINGS_KEY = 'animus-settings-v1'

export const THEMES = [
  { id: 'animus', label: 'The Animus (Original Default)', color: '#000000' },
  { id: 'cyber', label: 'Cyber-Terminal', color: '#07090b' },
  { id: 'zen', label: 'Zen Minimalist', color: '#f7f6f3' },
  { id: 'ash', label: 'Ash', color: '#E9E3E6' },
  { id: 'ember', label: 'Ember', color: '#001524' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export interface AppSettings {
  version: 1
  theme: ThemeId
  plan: GoalPlan | null
}

export function themeLabel(theme: ThemeId): string {
  return THEMES.find((item) => item.id === theme)?.label ?? THEMES[0].label
}

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((item) => item.id === value)
}

export function emptySettings(): AppSettings {
  return { version: 1, theme: 'animus', plan: null }
}

function parseStoredPlan(raw: unknown): GoalPlan | null {
  if (!raw || typeof raw !== 'object') return null
  return parseGoalPlan(JSON.stringify(raw))
}

export function parseSettings(raw: unknown): AppSettings | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as { version?: unknown; theme?: unknown; plan?: unknown }
  if (record.version !== 1 || !isThemeId(record.theme)) return null
  const plan = record.plan == null ? null : parseStoredPlan(record.plan)
  if (record.plan != null && !plan) return null
  return { version: 1, theme: record.theme, plan }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return emptySettings()
    return parseSettings(JSON.parse(raw)) ?? emptySettings()
  } catch {
    return emptySettings()
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset.theme = theme
  const color = THEMES.find((item) => item.id === theme)?.color ?? THEMES[0].color
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  window.dispatchEvent(new Event('animus-theme'))
}
