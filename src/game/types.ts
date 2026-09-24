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

export interface GameEvent {
  id: string
  type: 'contract' | 'daily-bonus' | 'goal-progress'
  at: string
  date: string
  xp: number
  contractId?: ContractId
  goalId?: string
  amount?: number
  parentId?: string
  subtaskId?: string
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
