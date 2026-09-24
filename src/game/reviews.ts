import { CONTRACTS } from './catalog'
import { daysBetween } from './dates'
import { average, ratio } from './formulas'
import { isActive, listGoals } from './goals'
import type { DayEntry } from './journal'
import type { GoalDefinition, Save } from './types'

export const DOMAINS: { id: string; label: string; categories: string[] }[] = [
  { id: 'body', label: 'Body', categories: ['Body'] },
  { id: 'education', label: 'Education', categories: ['Education'] },
  { id: 'create', label: 'Create', categories: ['Create'] },
  { id: 'finance', label: 'Finance', categories: ['Finance'] },
  { id: 'investing', label: 'Investing', categories: ['Investing'] },
  { id: 'business', label: 'Business', categories: ['Business'] },
  { id: 'relationships', label: 'Relationships', categories: ['Relationships', 'Intimacy'] },
  { id: 'soul', label: 'Soul', categories: ['Soul'] },
  { id: 'life-skills', label: 'Life Skills', categories: ['Life Skills'] },
  { id: 'adventure', label: 'Adventure', categories: ['Adventure', 'Fun'] },
]

export function periodSync(entries: DayEntry[], start: string, end: string, contractsDone: number, daysElapsed: number): number {
  const graded = entries.filter((entry) => entry.date >= start && entry.date <= end)
  if (graded.length > 0) return average(graded.map((entry) => entry.score))
  const available = Math.max(0, daysElapsed) * CONTRACTS.length
  if (available === 0) return 0
  return (contractsDone / available) * 100
}

export function daysElapsedIn(today: string, start: string, end: string): number {
  const from = today < start ? start : today < end ? today : end
  if (from < start) return 0
  return daysBetween(start, from) + 1
}

export function domainProgress(save: Pick<Save, 'customGoals' | 'goalStatus'>, current: Record<string, number>): { id: string; label: string; value: number }[] {
  const goals = listGoals(save).filter((goal) => isActive(save, goal.id))
  return DOMAINS.map((domain) => {
    const matched = goals.filter((goal) => domain.categories.includes(goal.category))
    const value = matched.length === 0 ? 0 : average(matched.map((goal) => ratio(current[goal.id] ?? 0, goal.target))) * 100
    return { id: domain.id, label: domain.label, value }
  })
}

export function paceSplit(save: Pick<Save, 'customGoals' | 'goalStatus'>, current: Record<string, number>, campaignDay: number): { behind: GoalDefinition[]; ahead: GoalDefinition[] } {
  const pace = Math.max(0, Math.min(1, campaignDay / 365))
  const behind: GoalDefinition[] = []
  const ahead: GoalDefinition[] = []
  for (const goal of listGoals(save)) {
    if (!isActive(save, goal.id)) continue
    const progress = ratio(current[goal.id] ?? 0, goal.target)
    if (progress + 0.001 < pace) behind.push(goal)
    else if (progress > pace + 0.001) ahead.push(goal)
  }
  return { behind, ahead }
}

export function extremeDomains(rows: { label: string; value: number }[]): { high: string[]; low: string[] } {
  if (rows.length === 0) return { high: [], low: [] }
  const max = Math.max(...rows.map((row) => row.value))
  const min = Math.min(...rows.map((row) => row.value))
  return {
    high: rows.filter((row) => row.value === max).map((row) => row.label),
    low: rows.filter((row) => row.value === min).map((row) => row.label),
  }
}
