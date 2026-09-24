import type { AgendaRef } from './schedule'

export const JOURNAL_KEY = 'animus-journal-v1'
export const DAY_TASKS = 10

export interface DayEntry {
  id: string
  date: string
  reflection: string
  tasksCompleted: number
  tasksExpected: number
  score: number
  grade: string
  createdAt: string
}

export interface Journal {
  version: 1
  agendaDate: string
  agenda: AgendaRef[]
  entries: DayEntry[]
}

const GRADES: Record<number, string> = {
  100: 'Perfect',
  90: 'Excellent',
  80: 'Good',
  70: 'Fair',
  60: 'Steady',
  50: 'Half',
  40: 'Behind',
  30: 'Thin',
  20: 'Sparse',
  10: 'Started',
  0: 'Missed',
}

export function emptyJournal(date: string): Journal {
  return { version: 1, agendaDate: date, agenda: [], entries: [] }
}

export function gradeDay(tasksCompleted: number, tasksExpected = DAY_TASKS): { score: number; grade: string } {
  const expected = Math.max(1, tasksExpected)
  const done = Math.max(0, Math.min(expected, tasksCompleted))
  const score = Math.round((done / expected) * 10) * 10
  return { score, grade: GRADES[score] ?? 'Missed' }
}

export function loadJournal(today: string): Journal {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY)
    if (!raw) return emptyJournal(today)
    const parsed = JSON.parse(raw) as Journal
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) return emptyJournal(today)
    return {
      version: 1,
      agendaDate: parsed.agendaDate || today,
      agenda: Array.isArray(parsed.agenda) ? parsed.agenda : [],
      entries: parsed.entries.filter((entry) => entry && typeof entry.id === 'string' && typeof entry.date === 'string'),
    }
  } catch {
    return emptyJournal(today)
  }
}

export function persistJournal(journal: Journal): void {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal))
}

export function mergeJournal(current: Journal, incoming: DayEntry[]): Journal {
  const ids = new Set(current.entries.map((entry) => entry.id))
  const added = incoming.filter((entry) => entry?.id && !ids.has(entry.id))
  return { ...current, entries: [...current.entries, ...added] }
}
