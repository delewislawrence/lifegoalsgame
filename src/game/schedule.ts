import { GOAL_BY_ID, GOALS, SEQUENCES, isChecklist } from './catalog'
import type { GameEvent, GoalDefinition } from './types'

export interface AgendaRef {
  goalId: string
  subtaskId: string
}

export function completedStepIds(events: GameEvent[], goalId: string): Set<string> {
  const ids = new Set<string>()
  for (const event of events) {
    if (event.type === 'goal-progress' && event.goalId === goalId && event.subtaskId) ids.add(event.subtaskId)
  }
  return ids
}

export function stepDone(events: GameEvent[], goalId: string, subtaskId: string, current: number, goals: GoalDefinition[] = GOALS): boolean {
  const goal = goals.find((item) => item.id === goalId) ?? GOAL_BY_ID[goalId]
  if (!goal) return false
  const step = goal.subtasks.find((item) => item.id === subtaskId)
  if (!step) return false
  if (isChecklist(goal)) return completedStepIds(events, goalId).has(subtaskId)
  return current >= (step.at ?? goal.target)
}

export function nextAgenda(events: GameEvent[], currents: Record<string, number>, limit = 7, goals: GoalDefinition[] = GOALS): AgendaRef[] {
  const order = new Map(SEQUENCES.map((sequence, index) => [sequence.id, index]))
  const sorted = [...goals].sort((a, b) => (order.get(a.sequenceId) ?? 0) - (order.get(b.sequenceId) ?? 0))
  const agenda: AgendaRef[] = []
  for (const goal of sorted) {
    for (const step of goal.subtasks) {
      if (stepDone(events, goal.id, step.id, currents[goal.id] ?? 0, sorted)) continue
      agenda.push({ goalId: goal.id, subtaskId: step.id })
      if (agenda.length === limit) return agenda
    }
  }
  return agenda
}
