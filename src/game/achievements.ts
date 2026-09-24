import { GOAL_BY_ID, GOALS, MAJOR_XP } from './catalog'
import type { View } from './derive'
import type { Save } from './types'

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  earned: (view: View) => boolean
}

function current(view: View, goalId: string): number {
  return view.goalCurrent[goalId] ?? 0
}

function done(view: View, goalId: string): boolean {
  const goal = GOAL_BY_ID[goalId]
  return !!goal && current(view, goalId) >= goal.target
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first-memory', title: 'First Memory', description: 'Complete your first Daily Contract.', earned: (view) => view.contractsCompleted >= 1 },
  { id: 'full-sync-day', title: 'Full Synchronization', description: 'Complete all Daily Contracts in one day.', earned: (view) => view.perfectDays >= 1 },
  { id: 'streak-7', title: 'Seven Days', description: 'Hold a 7-day synchronization streak.', earned: (view) => view.bestStreak >= 7 },
  { id: 'streak-30', title: 'Thirty Days', description: 'Hold a 30-day synchronization streak.', earned: (view) => view.bestStreak >= 30 },
  { id: 'memories-100', title: '100 Memories', description: 'Complete 100 Daily Contracts.', earned: (view) => view.contractsCompleted >= 100 },
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Complete your first major goal.',
    earned: (view) => GOALS.some((goal) => goal.xpReward >= MAJOR_XP && (view.goalCurrent[goal.id] ?? 0) >= goal.target),
  },
  { id: 'warrior-25', title: 'Warrior', description: 'Complete 25 martial arts sessions.', earned: (view) => current(view, 'martial-arts') >= 25 },
  { id: 'warrior-200', title: 'Master of the Mat', description: 'Complete 200 martial arts sessions.', earned: (view) => done(view, 'martial-arts') },
  { id: 'engineer', title: 'Engineer', description: 'Deploy your first software project.', earned: (view) => current(view, 'deploy-projects') >= 1 },
  {
    id: 'creator',
    title: 'Creator',
    description: 'Release your first creative project.',
    earned: (view) =>
      done(view, 'beat-tape') ||
      current(view, 'dj-mixes') >= 1 ||
      done(view, 'novel') ||
      done(view, 'short-film') ||
      done(view, 'live-performance'),
  },
  { id: 'explorer', title: 'Explorer', description: 'Visit your first new destination.', earned: (view) => current(view, 'places') >= 1 },
  { id: 'artisan-10', title: 'Artisan', description: 'Cook 10 different meals.', earned: (view) => current(view, 'meals') >= 10 },
  { id: 'wealth-builder', title: 'Wealth Builder', description: 'Complete your first monthly investment.', earned: (view) => current(view, 'invest-months') >= 1 },
  { id: 'scholar', title: 'Scholar', description: 'Complete the coding course.', earned: (view) => done(view, 'coding-course') },
  { id: 'brotherhood', title: 'Brotherhood', description: 'Strengthen your first friendship.', earned: (view) => current(view, 'friendships') >= 1 },
  { id: 'inner-temple-30', title: 'Inner Temple', description: 'Reflect for 30 days.', earned: (view) => current(view, 'reflection-days') >= 30 },
  { id: 'eagle', title: 'Eagle', description: 'Complete your first monthly review.', earned: (view) => current(view, 'monthly-reviews') >= 1 },
  { id: 'sequence-01', title: 'Sequence 01', description: 'Complete The Awakening.', earned: (view) => view.sequenceProgress.awakening >= 99.999 },
  { id: 'sequence-02', title: 'Sequence 02', description: 'Complete The Apprentice.', earned: (view) => view.sequenceProgress.apprentice >= 99.999 },
  { id: 'sequence-03', title: 'Sequence 03', description: 'Complete The Assassin.', earned: (view) => view.sequenceProgress.assassin >= 99.999 },
  { id: 'sequence-04', title: 'Sequence 04', description: 'Complete The Master.', earned: (view) => view.sequenceProgress.master >= 99.999 },
]

export function applyAchievements(save: Save, view: View, nowIso: string): Save {
  let changed = false
  const unlocks = { ...save.achievementUnlocks }
  for (const achievement of ACHIEVEMENTS) {
    if (!unlocks[achievement.id] && achievement.earned(view)) {
      unlocks[achievement.id] = nowIso
      changed = true
    }
  }
  if (!changed) return save
  return { ...save, achievementUnlocks: unlocks }
}

export function newAchievementIds(before: Save, after: Save): string[] {
  return ACHIEVEMENTS.filter((achievement) => !before.achievementUnlocks[achievement.id] && after.achievementUnlocks[achievement.id]).map(
    (achievement) => achievement.id,
  )
}
