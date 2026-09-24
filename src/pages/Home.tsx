import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONTRACTS, GOAL_BY_ID } from '../game/catalog'
import { formatLongDate } from '../game/dates'
import { dueReview } from '../game/periods'
import { formatSync, percentColor } from '../game/formulas'
import { stepDone } from '../game/schedule'
import ProgressBar from '../components/ProgressBar'
import { useGame } from '../state/GameProvider'

export default function Home() {
  const { save, view, today, journal, dispatch, submitDay } = useGame()
  const todayEntry = journal.entries.find((entry) => entry.date === today)
  const due = dueReview(save.startedAt, today, save.reviews ?? [], view.campaignDay)
  const [reflection, setReflection] = useState(todayEntry?.reflection ?? '')
  return (
    <>
      <p className="brand">THE ANIMUS</p>
      <p className="sync-label">Synchronization</p>
      <p className="sync-value" style={{ color: percentColor(view.sync) }}>{formatSync(view.sync)}</p>
      <ProgressBar value={view.sync} />
      <p className="sequence-line">Sequence {view.sequence.index} — {view.sequence.name}</p>
      <p className="level-line">LEVEL {view.level.level} — {view.level.title.toUpperCase()}</p>
      <p className="meta">
        {view.level.nextXp
          ? `${Math.max(0, view.level.nextXp - view.xp)} XP to ${view.level.nextTitle}`
          : 'Level complete'}
      </p>
      <p className="streak">{view.streak} DAY SYNCHRONIZATION STREAK</p>
      <p className="meta">
        {formatLongDate(today)} · {view.campaignDay < 1 ? `Day 1 begins ${formatLongDate(save.startedAt)}` : `Day ${view.campaignDay}`}
      </p>
      {due ? <p className="section"><Link className="btn" to="/review">{due.label}</Link></p> : null}

      <section className="section">
        <div className="row-between">
          <h2>Today's Contracts</h2>
        </div>
        <p className="meta">Today's Synchronization · {view.todayCount} / 3 Contracts Complete</p>
        {CONTRACTS.map((contract) => {
          const text = save.contracts[contract.id]
          const done = view.todayDone[contract.id]
          return (
            <article key={contract.id} className={done ? 'card is-done' : 'card'}>
              <p className="kicker">{text?.title ?? contract.defaultTitle}</p>
              <h3>{text?.description ?? contract.defaultDescription}</h3>
              <p className="reward">+{contract.xp} XP</p>
              {done ? (
                <div className="button-row">
                  <button className="btn ghost" type="button" onClick={() => dispatch({ type: 'uncomplete-contract', contractId: contract.id, date: today, today })}>
                    Undo
                  </button>
                </div>
              ) : (
                <div className="button-row">
                  <button className="btn solid" type="button" onClick={() => dispatch({ type: 'complete-contract', contractId: contract.id, date: today, at: new Date().toISOString() })}>
                    Complete
                  </button>
                </div>
              )}
            </article>
          )
        })}
        {view.memorySynchronized ? <p className="seal">MEMORY SYNCHRONIZED</p> : null}
        {view.sync >= 99.999 ? <p className="section"><Link className="btn solid" to="/victory">Year won — enter the archive</Link></p> : null}
      </section>

      <section className="section day-board">
        <div>
          <h2>On schedule</h2>
          <p className="meta">The next 7 steps. Finish these with today's contracts.</p>
          {journal.agenda.length === 0 ? <p>Nothing unfinished. The year is caught up.</p> : null}
          {journal.agenda.map((item) => {
            const goal = GOAL_BY_ID[item.goalId]
            const step = goal?.subtasks.find((candidate) => candidate.id === item.subtaskId)
            if (!goal || !step) return null
            const done = stepDone(save.events, item.goalId, item.subtaskId, view.goalCurrent[item.goalId] ?? 0)
            return (
              <Link key={`${item.goalId}-${item.subtaskId}`} className={done ? 'quest-link is-done' : 'quest-link'} to={`/quests/${item.goalId}`}>
                <p className="kicker">{done ? 'Done' : 'Next'} · {goal.title}</p>
                <strong>{step.title}</strong>
              </Link>
            )
          })}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submitDay(reflection)
          }}
        >
          <h2>Reflection</h2>
          <p className="meta">Write the day, then submit. The grade counts 3 contracts and these 7 steps.</p>
          <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="What happened today?" />
          <div className="button-row">
            <button className="btn solid" type="submit">{todayEntry ? 'Update day' : 'Submit day'}</button>
          </div>
          {todayEntry ? (
            <>
              <p className="seal"><span style={{ color: percentColor(todayEntry.score) }}>{todayEntry.score}</span> — {todayEntry.grade} · {todayEntry.tasksCompleted}/{todayEntry.tasksExpected}</p>
              <p className="meta">Tomorrow keeps the same Body, Mind, and Inner Temple contracts. The next 7 steps refresh when the date changes.</p>
            </>
          ) : null}
          <p className="meta"><Link to="/days">All days</Link></p>
        </form>
      </section>
    </>
  )
}
