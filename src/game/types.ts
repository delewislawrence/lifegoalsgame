export type GoalType = 'counter' | 'streak' | 'checkbox' | 'time' | 'collection'

export type SkillPathId =
  | 'combat'
  | 'stealth'
  | 'eagle'
  | 'economic'
  | 'creator'
  | 'brotherhood'
  | 'intimacy'
  | 'inner-temple'
  | 'artisan'
  | 'hidden-bureau'
  | 'explorer'
  | 'play'
  | 'character'

export type SequenceId = 'awakening' | 'apprentice' | 'assassin' | 'master'

export type ContractId = 'body' | 'mind' | 'inner-temple'

export interface Subtask {
  id: string
  title: string
  at?: number
}

export interface GoalDefinition {
  id: string
  title: string
  description: string
  category: string
  type: GoalType
  target: number
  unit: string
  xpReward: number
  skillPathId: Exclude<SkillPathId, 'character'>
  sequenceId: SequenceId
  headline?: boolean
  subtasks: Subtask[]
}

export interface ContractDefinition {
  id: ContractId
  xp: number
  skillPathId: Exclude<SkillPathId, 'character'>
  linkedGoalId: string
  defaultTitle: string
  defaultDescription: string
}

export type ReviewKind = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type GoalLife = 'active' | 'paused' | 'removed'

export interface GameEvent {
  id: string
  type:
    | 'contract'
    | 'daily-bonus'
    | 'goal-progress'
    | 'weekly-review'
    | 'monthly-review'
    | 'quarterly-review'
    | 'yearly-review'
    | 'goal-created'
    | 'goal-modified'
    | 'goal-paused'
    | 'goal-removed'
    | 'income'
    | 'expense'
    | 'budget-edit'
    | 'debt-payment'
    | 'emergency-update'
    | 'baby-step'
    | 'ledger-correction'
  at: string
  date: string
  xp: number
  contractId?: ContractId
  goalId?: string
  amount?: number
  parentId?: string
  subtaskId?: string
  reviewId?: string
  note?: string
}

export interface ReviewPeriod {
  weekStart?: string
  weekEnd?: string
  month?: number
  year?: number
  sequenceId?: SequenceId
  campaign?: number
}

export interface ReviewRecord {
  id: string
  kind: ReviewKind
  period: ReviewPeriod
  grade?: number
  answers: Record<string, string>
  snapshot: { sync: number; xp: number; streak: number }
  updatedAt: string
}

export interface GoalStatus {
  state: GoalLife
  note?: string
  title?: string
}

export interface CustomGoal {
  id: string
  title: string
  category: string
  createdAt: string
}

export interface LedgerEntry {
  id: string
  type: 'income' | 'expense'
  amountCents: number
  date: string
  note: string
  categoryId?: string
}

export interface Debt {
  id: string
  name: string
  balanceCents: number
  minimumCents: number
  rateBps?: number
  due?: string
  order: number
}

export interface DebtPayment {
  id: string
  debtId: string
  amountCents: number
  date: string
}

export interface FinanceState {
  entries: LedgerEntry[]
  template: Record<string, number>
  months: Record<string, Record<string, number>>
  debts: Debt[]
  debtPayments: DebtPayment[]
  emergency: { amountCents: number; essentialCents: number; targetMonths: number }
  baby: { step1: boolean; step2: boolean; step3: boolean; step2Clear: boolean }
}

export interface ContractText {
  title: string
  description: string
}

export interface AchievementUnlock {
  [id: string]: string
}

export interface CampaignArchive {
  campaign: number
  startedAt: string
  endedAt: string
  xp: number
  sync: number
  bestStreak: number
  contractsCompleted: number
  goalsCompleted: number
  achievements: { id: string; title: string; unlockedAt: string }[]
  creativeCompleted: string[]
  projectsShipped: number
  experiences: number
  pathsDeveloped: number
}

export interface Save {
  version: 1
  startedAt: string
  campaign: number
  playerName: string
  sound: boolean
  contracts: Record<ContractId, ContractText>
  events: GameEvent[]
  achievementUnlocks: AchievementUnlock
  history: CampaignArchive[]
  reviews: ReviewRecord[]
  goalStatus: Record<string, GoalStatus>
  customGoals: CustomGoal[]
  finance: FinanceState
}

export interface LevelInfo {
  level: number
  title: string
  floorXp: number
  nextTitle: string | null
  nextXp: number | null
  intoLevel: number
  span: number
}
