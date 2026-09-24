import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatLongDate } from '../game/dates'
import { percentColor } from '../game/formulas'
import { useGame } from '../state/GameProvider'

export default function Days() {
  const { journal, deleteDay } = useGame()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const entries = [...journal.entries].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <>
      <p className="brand">DAYS</p>
      <h1>Recorded days</h1>
      <p>Each day keeps its grade and reflection. Resetting the campaign does not remove these. Delete an entry only from here.</p>
      {entries.length === 0 ? <p>No days submitted yet. Write today's reflection on Home.</p> : null}
      {entries.map((entry) => (
        <article key={entry.id} className="card">
          <p className="kicker">{formatLongDate(entry.date)}</p>
          <h3><span style={{ color: percentColor(entry.score) }}>{entry.score}</span> — {entry.grade}</h3>
          <p>{entry.tasksCompleted} / {entry.tasksExpected} tasks</p>
          {entry.snapshot ? (
            <>
              <p>Body {entry.snapshot.contracts.body ? 'done' : 'open'} · Mind {entry.snapshot.contracts.mind ? 'done' : 'open'} · Inner Temple {entry.snapshot.contracts['inner-temple'] ? 'done' : 'open'}</p>
              <p>Quests done: {entry.snapshot.questsDone.length ? entry.snapshot.questsDone.join(', ') : 'none'}</p>
              <p>Quests open: {entry.snapshot.questsOpen.length ? entry.snapshot.questsOpen.join(', ') : 'none'}</p>
              <p>{entry.snapshot.xp} XP · Sync {Math.round(entry.snapshot.sync)}% · Streak {entry.snapshot.streak}</p>
            </>
          ) : null}
          <p>{entry.reflection || 'No reflection written.'}</p>
          {pendingId === entry.id ? (
            <div className="button-row">
              <button className="btn" type="button" onClick={() => { deleteDay(entry.id); setPendingId(null) }}>Confirm delete</button>
              <button className="btn ghost" type="button" onClick={() => setPendingId(null)}>Keep</button>
            </div>
          ) : (
            <div className="button-row">
              <button className="btn ghost" type="button" onClick={() => setPendingId(entry.id)}>Delete</button>
            </div>
          )}
        </article>
      ))}
      <p className="meta"><Link to="/">Back home</Link></p>
    </>
  )
}
