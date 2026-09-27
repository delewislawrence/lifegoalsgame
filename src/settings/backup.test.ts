import { createSave } from '../game/reducer'
import { emptyJournal } from '../game/journal'
import { readBackup } from './backup'
import { emptySettings } from './prefs'

describe('backup import', () => {
  const today = '2026-09-26'
  const save = createSave(new Date('2026-09-26T12:00:00'))

  it('rejects a file that is not a campaign', () => {
    expect(readBackup('{"hello":true}', today)).toBeNull()
  })

  it('restores the journal and settings only when both are valid', () => {
    const file = {
      kind: 'animus-backup',
      version: 1,
      save,
      journal: { ...emptyJournal(today), entries: [{ id: 'd1', date: today, reflection: 'Kept', tasksCompleted: 1, tasksExpected: 10, score: 10, grade: 'Started', createdAt: today }] },
      settings: { ...emptySettings(), theme: 'zen' },
    }
    const restored = readBackup(JSON.stringify(file), today)
    expect(restored?.journal?.entries[0]?.reflection).toBe('Kept')
    expect(restored?.settings?.theme).toBe('zen')
  })

  it('keeps a valid campaign when the journal in the file is unusable', () => {
    const file = { kind: 'animus-backup', version: 1, save, journal: { version: 2 }, settings: { version: 1, theme: 'nope' } }
    const restored = readBackup(JSON.stringify(file), today)
    expect(restored?.save.playerName).toBe('Initiate')
    expect(restored?.journal).toBeNull()
    expect(restored?.settings).toBeNull()
  })
})
