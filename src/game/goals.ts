import { GOAL_BY_ID, GOALS } from './catalog'
import type { CustomGoal, GoalDefinition, Save } from './types'

export function customGoalDefinition(goal: CustomGoal): GoalDefinition {
  return {
    id: goal.id,
    title: goal.title,
    description: 'Added during a quarterly review.',
    category: goal.category,
    type: 'checkbox',
    target: 1,
    unit: 'step',
    xpReward: 50,
    skillPathId: 'hidden-bureau',
    sequenceId: 'awakening',
    subtasks: [{ id: 'done', title: goal.title }],
  }
}

export function resolveGoal(save: Pick<Save, 'customGoals' | 'goalStatus'>, id: string): GoalDefinition | undefined {
  const catalog = GOAL_BY_ID[id]
  const custom = save.customGoals.find((goal) => goal.id === id)
  const goal = catalog ?? (custom ? customGoalDefinition(custom) : undefined)
  if (!goal) return undefined
  const title = save.goalStatus[id]?.title
  return title ? { ...goal, title } : goal
}

export function listGoals(save: Pick<Save, 'customGoals' | 'goalStatus'>): GoalDefinition[] {
  return [...GOALS.map((goal) => resolveGoal(save, goal.id)!), ...save.customGoals.map((goal) => resolveGoal(save, goal.id)!)]
}

export function isActive(save: Pick<Save, 'goalStatus'>, id: string): boolean {
  const state = save.goalStatus[id]?.state
  return state !== 'paused' && state !== 'removed'
}
