import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ACHIEVEMENTS, newAchievementIds } from '../game/achievements'
import { derive, type View } from '../game/derive'
import { formatSyncDelta } from '../game/formulas'
import { commit, type Action } from '../game/reducer'
import { playFeedback } from '../game/sound'
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
  toasts: Toast[]
  storageError: string | null
  dispatch: (action: Action) => void
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

  return (
    <GameContext.Provider value={{ save, view, today, toasts, storageError, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameApi {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame must be used inside GameProvider')
  return value
}
