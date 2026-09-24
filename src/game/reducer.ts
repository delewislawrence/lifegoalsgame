import { applyAchievements } from './achievements'
import { ACHIEVEMENTS } from './achievements'
import { BONUS_XP, CONTRACTS, GOAL_BY_ID, GOALS, contractById } from './catalog'
import { derive, goalXpDelta } from './derive'
import { localDate } from './dates'
import type { CampaignArchive, ContractId, ContractText, GameEvent, Save } from './types'

export type Action =
  | { type: 'complete-contract'; contractId: ContractId; date: string; at: string }
  | { type: 'uncomplete-contract'; contractId: ContractId; date: string; today: string }
  | { type: 'log-goal'; goalId: string; amount: number; date: string; at: string }
  | { type: 'update-settings'; playerName?: string; sound?: boolean; contracts?: Partial<Record<ContractId, ContractText>> }
  | { type: 'import-save'; save: Save }
  | { type: 'reset-campaign'; at: string; date: string }
  | { type: 'begin-next-year'; at: string; date: string }

function uid(): string {
  return crypto.randomUUID()
}

export function createSave(now = new Date()): Save {
  const contracts = {} as Save['contracts']
  for (const contract of CONTRACTS) {
    contracts[contract.id] = { title: contract.defaultTitle, description: contract.defaultDescription }
  }
  return {
    version: 1,
    startedAt: localDate(now),
    campaign: 1,
    playerName: 'Initiate',
    sound: true,
    contracts,
    events: [],
    achievementUnlocks: {},
    history: [],
  }
}

function contractDone(save: Save, date: string, contractId: ContractId): boolean {
  return save.events.some((event) => event.type === 'contract' && event.date === date && event.contractId === contractId)
}

function withGoalProgress(events: GameEvent[], goalId: string, amount: number, date: string, at: string, parentId?: string): GameEvent[] {
  const goal = GOAL_BY_ID[goalId]
  if (!goal || amount === 0) return events
  const before = events.reduce((sum, event) => (event.type === 'goal-progress' && event.goalId === goalId ? sum + (event.amount ?? 0) : sum), 0)
  const clampedBefore = Math.min(goal.target, Math.max(0, before))
  const clampedAfter = Math.min(goal.target, Math.max(0, clampedBefore + amount))
  const applied = clampedAfter - clampedBefore
  if (applied === 0) return events
  const xp = goalXpDelta(goalId, clampedBefore, clampedAfter)
  events.push({
    id: uid(),
    type: 'goal-progress',
    at,
    date,
    xp,
    goalId,
    amount: applied,
    parentId,
  })
  return events
}

function maybeBonus(events: GameEvent[], date: string, at: string): GameEvent[] {
  const done = new Set(events.filter((event) => event.type === 'contract' && event.date === date).map((event) => event.contractId))
  const complete = CONTRACTS.every((contract) => done.has(contract.id))
  const hasBonus = events.some((event) => event.type === 'daily-bonus' && event.date === date)
  if (complete && !hasBonus) {
    events.push({ id: uid(), type: 'daily-bonus', at, date, xp: BONUS_XP })
  }
  if (!complete && hasBonus) {
    return events.filter((event) => !(event.type === 'daily-bonus' && event.date === date))
  }
  return events
}

export function reduce(save: Save, action: Action): Save {
  switch (action.type) {
    case 'complete-contract': {
      if (contractDone(save, action.date, action.contractId)) return save
      const contract = contractById(action.contractId)
      const parentId = uid()
      let events = [...save.events, {
        id: parentId,
        type: 'contract' as const,
        at: action.at,
        date: action.date,
        xp: contract.xp,
        contractId: action.contractId,
      }]
      events = withGoalProgress(events, contract.linkedGoalId, 1, action.date, action.at, parentId)
      events = maybeBonus(events, action.date, action.at)
      return { ...save, events }
    }
    case 'uncomplete-contract': {
      if (action.date !== action.today) return save
      const removed = save.events.find((event) => event.type === 'contract' && event.date === action.date && event.contractId === action.contractId)
      if (!removed) return save
      let events = save.events.filter((event) => event.id !== removed.id && event.parentId !== removed.id)
      events = maybeBonus(events, action.date, removed.at)
      return { ...save, events }
    }
    case 'log-goal': {
      const events = withGoalProgress([...save.events], action.goalId, action.amount, action.date, action.at)
      if (events.length === save.events.length) return save
      return { ...save, events }
    }
    case 'update-settings': {
      const contracts = { ...save.contracts }
      if (action.contracts) {
        for (const contract of CONTRACTS) {
          const next = action.contracts[contract.id]
          if (!next) continue
          contracts[contract.id] = {
            title: next.title.trim() || contract.defaultTitle,
            description: next.description.trim() || contract.defaultDescription,
          }
        }
      }
      return {
        ...save,
        playerName: action.playerName?.trim() || save.playerName,
        sound: action.sound ?? save.sound,
        contracts,
      }
    }
    case 'import-save':
      return action.save
    case 'reset-campaign':
      return {
        ...createSave(new Date(action.at)),
        campaign: save.campaign,
        playerName: save.playerName,
        sound: save.sound,
        contracts: save.contracts,
        history: save.history,
        startedAt: action.date,
      }
    case 'begin-next-year': {
      const view = derive(save, action.date)
      if (view.sync < 99.999) return save
      const archive = archiveCampaign(save, view, action.date)
      const fresh = createSave(new Date(action.at))
      return {
        ...fresh,
        campaign: save.campaign + 1,
        playerName: save.playerName,
        sound: save.sound,
        contracts: save.contracts,
        history: [...save.history, archive],
        startedAt: action.date,
      }
    }
    default:
      return save
  }
}

export function archiveCampaign(save: Save, view: ReturnType<typeof derive>, endedAt: string): CampaignArchive {
  const creative = GOALS.filter((goal) => goal.skillPathId === 'creator' && (view.goalCurrent[goal.id] ?? 0) >= goal.target).map((goal) => goal.title)
  return {
    campaign: save.campaign,
    startedAt: save.startedAt,
    endedAt,
    xp: view.xp,
    sync: view.sync,
    bestStreak: view.bestStreak,
    contractsCompleted: view.contractsCompleted,
    goalsCompleted: view.goalsCompleted,
    achievements: ACHIEVEMENTS.filter((achievement) => save.achievementUnlocks[achievement.id]).map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      unlockedAt: save.achievementUnlocks[achievement.id],
    })),
    creativeCompleted: creative,
    projectsShipped: view.goalCurrent['deploy-projects'] ?? 0,
    experiences: view.goalCurrent.experiences ?? 0,
    pathsDeveloped: view.pathsDeveloped,
  }
}

export function commit(save: Save, action: Action, today: string, nowIso: string): Save {
  const next = reduce(save, action)
  return applyAchievements(next, derive(next, today), nowIso)
}
