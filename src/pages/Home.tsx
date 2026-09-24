import { CONTRACTS } from '../game/catalog'
import { formatSync } from '../game/formulas'
import { formatLongDate } from '../game/dates'
import { useGame } from '../state/GameProvider'
import ProgressBar from '../components/ProgressBar'
import { Link } from 'react-router-dom'

export default function Home() {
  const { save, view, today, dispatch } = useGame()
  return (
    <>
      <p className="brand">THE ANIMUS</p>
      <p className="sync-label">Synchronization</p>
      <p className="sync-value">{formatSync(view.sync)}</p>
      <ProgressBar value={view.sync} />
      <p className="sequence-line">Sequence {view.sequence.index} — {view.sequence.name}</p>
      <p className="level-line">LEVEL {view.level.level} — {view.level.title.toUpperCase()}</p>
      <p className="meta">
        {view.level.nextXp
          ? `${Math.max(0, view.level.nextXp - view.xp)} XP to ${view.level.nextTitle}`
          : 'Level complete'}
      </p>
      <p className="streak">{view.streak} DAY SYNCHRONIZATION STREAK</p>
      <p className="meta">{formatLongDate(today)} · Day {view.campaignDay}</p>

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
    </>
  )
}
