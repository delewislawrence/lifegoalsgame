import { CONTRACTS, GOAL_BY_ID, GOALS, SKILL_PATHS, isChecklist, sequenceById } from './catalog'
import { isActive, listGoals } from './goals'
import { addDays } from './dates'
import {
  average,
  campaignDayIndex,
  levelFromXp,
  ratio,
  sequenceForCampaignDay,
  syncFromRatios,
  xpForProgress,
} from './formulas'
import type { ContractId, GameEvent, Save, SequenceId, SkillPathId } from './types'

export interface View {
  xp: number
  level: ReturnType<typeof levelFromXp>
  sync: number
  goalCurrent: Record<string, number>
  todayDone: Record<ContractId, boolean>
  todayCount: number
  memorySynchronized: boolean
  streak: number
  bestStreak: number
  sequence: ReturnType<typeof sequenceById>
  campaignDay: number
  sequenceProgress: Record<SequenceId, number>
  skillProgress: Record<SkillPathId, number>
  contractsCompleted: number
  perfectDays: number
  goalsCompleted: number
  pathsDeveloped: number
}

function goalCurrents(events: GameEvent[]): Record<string, number> {
  const totals: Record<string, number> = {}
  const checks = new Map<string, Set<string>>()
  for (const goal of GOALS) {
    totals[goal.id] = 0
    if (isChecklist(goal)) checks.set(goal.id, new Set())
  }
  for (const event of events) {
    if (event.type !== 'goal-progress' || !event.goalId) continue
    const goal = GOAL_BY_ID[event.goalId]
    if (goal && isChecklist(goal)) {
      if (event.subtaskId) checks.get(goal.id)?.add(event.subtaskId)
      continue
    }
    if (!goal && event.subtaskId) {
      const set = checks.get(event.goalId) ?? new Set<string>()
      set.add(event.subtaskId)
      checks.set(event.goalId, set)
      continue
    }
    totals[event.goalId] = (totals[event.goalId] ?? 0) + (event.amount ?? 0)
  }
  for (const goal of GOALS) {
    const current = isChecklist(goal) ? checks.get(goal.id)?.size ?? 0 : totals[goal.id] ?? 0
    totals[goal.id] = Math.min(goal.target, Math.max(0, current))
  }
  for (const [id, set] of checks) {
    if (GOAL_BY_ID[id]) continue
    totals[id] = Math.min(1, set.size)
  }
  return totals
}

export function completedContractDates(events: GameEvent[]): string[] {
  const byDate = new Map<string, Set<ContractId>>()
  for (const event of events) {
    if (event.type !== 'contract' || !event.contractId) continue
    const set = byDate.get(event.date) ?? new Set<ContractId>()
    set.add(event.contractId)
    byDate.set(event.date, set)
  }
  return [...byDate.entries()]
    .filter(([, set]) => CONTRACTS.every((contract) => set.has(contract.id)))
    .map(([date]) => date)
}

export function streakStats(dates: string[], today: string): { current: number; best: number } {
  const unique = [...new Set(dates)].sort()
  let best = 0
  let run = 0
  let prev = ''
  for (const date of unique) {
    run = prev && daysBetweenSafe(prev, date) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = date
  }
  const anchor = unique.includes(today) ? today : addDays(today, -1)
  let current = 0
  if (unique.includes(anchor)) {
    let cursor = anchor
    while (unique.includes(cursor)) {
      current += 1
      cursor = addDays(cursor, -1)
    }
  }
  return { current, best: Math.max(best, current) }
}

function daysBetweenSafe(start: string, end: string): number {
  const [ay, am, ad] = start.split('-').map(Number)
  const [by, bm, bd] = end.split('-').map(Number)
  return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86400000)
}

export function derive(save: Save, today: string): View {
  const goalCurrent = goalCurrents(save.events)
  for (const goal of save.customGoals ?? []) {
    if (goalCurrent[goal.id] === undefined) goalCurrent[goal.id] = 0
  }
  const active = listGoals(save).filter((goal) => isActive(save, goal.id))
  const ratios = active.map((goal) => ratio(goalCurrent[goal.id] ?? 0, goal.target))
  const sync = syncFromRatios(ratios)
  const xp = save.events.reduce((sum, event) => sum + event.xp, 0)
  const todayDone = {
    body: false,
    mind: false,
    'inner-temple': false,
  } as Record<ContractId, boolean>
  for (const event of save.events) {
    if (event.type === 'contract' && event.date === today && event.contractId) {
      todayDone[event.contractId] = true
    }
  }
  const todayCount = CONTRACTS.filter((contract) => todayDone[contract.id]).length
  const fullDates = completedContractDates(save.events)
  const streak = streakStats(fullDates, today)
  const sequenceProgress = {
    awakening: 0,
    apprentice: 0,
    assassin: 0,
    master: 0,
  } as Record<SequenceId, number>
  for (const sequence of ['awakening', 'apprentice', 'assassin', 'master'] as SequenceId[]) {
    const goals = active.filter((goal) => goal.sequenceId === sequence)
    sequenceProgress[sequence] = average(goals.map((goal) => ratio(goalCurrent[goal.id] ?? 0, goal.target))) * 100
  }
  const skillProgress = {} as Record<SkillPathId, number>
  for (const path of SKILL_PATHS) {
    if (path.id === 'character') continue
    const goals = active.filter((goal) => goal.skillPathId === path.id)
    skillProgress[path.id] = average(goals.map((goal) => ratio(goalCurrent[goal.id] ?? 0, goal.target))) * 100
  }
  const others = SKILL_PATHS.filter((path) => path.id !== 'character').map((path) => skillProgress[path.id])
  skillProgress.character = average(others)
  const contractsCompleted = save.events.filter((event) => event.type === 'contract').length
  const goalsCompleted = GOALS.filter((goal) => (goalCurrent[goal.id] ?? 0) >= goal.target).length
  const day = campaignDayIndex(save.startedAt, today)
  return {
    xp,
    level: levelFromXp(xp),
    sync,
    goalCurrent,
    todayDone,
    todayCount,
    memorySynchronized: todayCount === CONTRACTS.length,
    streak: streak.current,
    bestStreak: streak.best,
    sequence: sequenceById(sequenceForCampaignDay(day)),
    campaignDay: day + 1,
    sequenceProgress,
    skillProgress,
    contractsCompleted,
    perfectDays: fullDates.length,
    goalsCompleted,
    pathsDeveloped: SKILL_PATHS.filter((path) => path.id !== 'character' && skillProgress[path.id] > 0).length,
  }
}

export function goalXpDelta(goalId: string, before: number, after: number): number {
  const goal = GOAL_BY_ID[goalId]
  if (!goal) {
    if (before <= 0 && after > 0) return 50
    if (before > 0 && after <= 0) return -50
    return 0
  }
  return xpForProgress(goal.xpReward, goal.target, after) - xpForProgress(goal.xpReward, goal.target, before)
}
