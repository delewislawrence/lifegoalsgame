import { SEQUENCES } from './catalog'
import { daysBetween } from './dates'
import type { LevelInfo, SequenceId } from './types'

export const LEVELS: { level: number; title: string; xp: number }[] = [
  { level: 1, title: 'Initiate', xp: 0 },
  { level: 2, title: 'Recruit', xp: 300 },
  { level: 3, title: 'Apprentice', xp: 900 },
  { level: 4, title: 'Assassin', xp: 2000 },
  { level: 5, title: 'Master Assassin', xp: 4500 },
  { level: 6, title: 'Mentor', xp: 8000 },
  { level: 7, title: 'Grandmaster', xp: 14000 },
  { level: 8, title: 'Full Synchronization', xp: 22000 },
]

export function levelFromXp(xp: number): LevelInfo {
  let index = 0
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (xp >= LEVELS[i].xp) index = i
  }
  const current = LEVELS[index]
  const next = LEVELS[index + 1] ?? null
  const span = next ? next.xp - current.xp : 1
  return {
    level: current.level,
    title: current.title,
    floorXp: current.xp,
    nextTitle: next?.title ?? null,
    nextXp: next?.xp ?? null,
    intoLevel: xp - current.xp,
    span,
  }
}

export function xpForProgress(xpReward: number, target: number, current: number): number {
  if (target <= 0) return 0
  if (current >= target) return xpReward
  if (current <= 0) return 0
  return Math.floor((xpReward * current) / target)
}

export function ratio(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(1, Math.max(0, current / target))
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function syncFromRatios(ratios: number[]): number {
  return average(ratios) * 100
}

export function formatSync(value: number): string {
  if (value >= 99.999) return '100%'
  if (value <= 0) return '0%'
  if (value < 1) return `${value.toFixed(2)}%`
  if (value < 10) return `${value.toFixed(1)}%`
  return `${Math.floor(value)}%`
}

export function formatSyncDelta(delta: number): string | null {
  if (Math.abs(delta) < 0.1) return null
  const digits = Math.abs(delta) >= 10 ? 0 : 1
  const rounded = Math.abs(delta).toFixed(digits)
  return `SYNC ${delta >= 0 ? '+' : '−'}${rounded}%`
}

export function sequenceForCampaignDay(dayIndex: number): SequenceId {
  const day = Math.max(0, dayIndex)
  let current: SequenceId = 'awakening'
  for (const sequence of SEQUENCES) {
    if (day >= sequence.startDay) current = sequence.id
  }
  return current
}

export function campaignDayIndex(startedAt: string, today: string): number {
  return Math.max(0, daysBetween(startedAt, today))
}

export function isWon(sync: number): boolean {
  return sync >= 99.999
}
