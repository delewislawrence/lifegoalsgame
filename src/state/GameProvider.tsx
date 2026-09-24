import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ACHIEVEMENTS, newAchievementIds } from '../game/achievements'
import { derive, type View } from '../game/derive'
import { formatSyncDelta } from '../game/formulas'
import { commit, type Action } from '../game/reducer'
import { playFeedback } from '../game/sound'
import { gradeDay, loadJournal, mergeJournal, persistJournal, type DayEntry, type Journal } from '../game/journal'
import { isActive, listGoals } from '../game/goals'
import { nextAgenda, stepDone } from '../game/schedule'
import { loadSave, persistSave } from '../game/storage'
import { localDate } from '../game/dates'
import type { Save } from '../game/types'

export interface Toast {
  id: string
  text: string
  kind: 'xp' | 'sync' | 'memory' | 'achieve'
}

interface GameApi {
  save: Save
  view: View
  today: string
  journal: Journal
  toasts: Toast[]
  storageError: string | null
  dispatch: (action: Action) => void
  submitDay: (reflection: string) => void
  deleteDay: (id: string) => void
  mergeDays: (entries: DayEntry[]) => void
}

const GameContext = createContext<GameApi | null>(null)

function toastsFor(before: View, after: View, previous: Save, next: Save): Toast[] {
  const items: Toast[] = []
  const xpDelta = after.xp - before.xp
  if (xpDelta !== 0) {
    items.push({ id: crypto.randomUUID(), text: `${xpDelta > 0 ? '+' : '−'}${Math.abs(xpDelta)} XP`, kind: 'xp' })
  }
  const syncText = formatSyncDelta(after.sync - before.sync)
  if (syncText) items.push({ id: crypto.randomUUID(), text: syncText, kind: 'sync' })
  if (!before.memorySynchronized && after.memorySynchronized) {
    items.push({ id: crypto.randomUUID(), text: 'MEMORY SYNCHRONIZED', kind: 'memory' })
  }
  for (const id of newAchievementIds(previous, next)) {
    const achievement = ACHIEVEMENTS.find((item) => item.id === id)
    if (achievement) items.push({ id: crypto.randomUUID(), text: achievement.title, kind: 'achieve' })
  }
  return items.slice(0, 4)
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<Save>(() => loadSave())
  const [journal, setJournal] = useState<Journal>(() => loadJournal(localDate()))
  const [toasts, setToasts] = useState<Toast[]>([])
  const [storageError, setStorageError] = useState<string | null>(null)
  const saveRef = useRef(save)
  saveRef.current = save
  const today = localDate()

  const view = useMemo(() => derive(save, today), [save, today])

  useEffect(() => {
    setStorageError(persistSave(save))
  }, [save])

  useEffect(() => {
    persistJournal(journal)
  }, [journal])

  useEffect(() => {
    setJournal((current) => {
      if (current.agendaDate === today && current.agenda.length > 0) return current
      const agenda = nextAgenda(save.events, derive(save, today).goalCurrent, 7, listGoals(save).filter((goal) => isActive(save, goal.id)))
      if (current.agendaDate === today && agenda.length === 0) return current
      return { ...current, agendaDate: today, agenda }
    })
  }, [today, save])

  useEffect(() => {
    if (toasts.length === 0) return
    const timer = window.setTimeout(() => setToasts((current) => current.slice(1)), 1600)
    return () => window.clearTimeout(timer)
  }, [toasts])

  const dispatch = (action: Action) => {
    const previous = saveRef.current
    const before = derive(previous, today)
    const nowIso = new Date().toISOString()
    const next = commit(previous, action, today, nowIso)
    if (next === previous) return
    saveRef.current = next
    setSave(next)
    const after = derive(next, today)
    const items = toastsFor(before, after, previous, next)
    if (items.length) setToasts((current) => [...current, ...items].slice(-4))
    const kind = items.some((item) => item.kind === 'memory') ? 'memory' : items.some((item) => item.kind === 'achieve') ? 'achieve' : 'tick'
    if (items.some((item) => item.kind === 'xp' || item.kind === 'memory' || item.kind === 'achieve')) {
      playFeedback(kind, next.sound)
    }
  }

  const submitDay = (reflection: string) => {
    const previous = saveRef.current
    const snapshot = derive(previous, today)
    const goals = listGoals(previous)
    const steps = journal.agenda.filter((item) => stepDone(previous.events, item.goalId, item.subtaskId, snapshot.goalCurrent[item.goalId] ?? 0, goals))
    const tasksCompleted = snapshot.todayCount + steps.length
    const tasksExpected = 3 + journal.agenda.length
    const graded = gradeDay(tasksCompleted, tasksExpected)
    const xp = previous.events.filter((event) => event.date === today).reduce((sum, event) => sum + event.xp, 0)
    const label = (item: { goalId: string; subtaskId: string }) => {
      const goal = goals.find((candidate) => candidate.id === item.goalId)
      return goal?.subtasks.find((step) => step.id === item.subtaskId)?.title ?? item.subtaskId
    }
    const daySnapshot = {
      contracts: snapshot.todayDone,
      questsDone: steps.map(label),
      questsOpen: journal.agenda.filter((item) => !steps.includes(item)).map(label),
      xp,
      sync: snapshot.sync,
      streak: snapshot.streak,
    }
    setJournal((current) => {
      const existing = current.entries.find((entry) => entry.date === today)
      const entry: DayEntry = {
        id: existing?.id ?? crypto.randomUUID(),
        date: today,
        reflection: reflection.trim(),
        tasksCompleted,
        tasksExpected,
        score: graded.score,
        grade: graded.grade,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        snapshot: daySnapshot,
      }
      const entries = existing
        ? current.entries.map((item) => (item.date === today ? entry : item))
        : [entry, ...current.entries]
      return { ...current, entries }
    })
  }

  const deleteDay = (id: string) => {
    setJournal((current) => ({ ...current, entries: current.entries.filter((entry) => entry.id !== id) }))
  }

  const mergeDays = (entries: DayEntry[]) => {
    setJournal((current) => mergeJournal(current, entries))
  }

  return (
    <GameContext.Provider value={{ save, view, today, journal, toasts, storageError, dispatch, submitDay, deleteDay, mergeDays }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameApi {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame must be used inside GameProvider')
  return value
}
