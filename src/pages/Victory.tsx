import { useState } from 'react'
import { GOALS } from '../game/catalog'
import { formatSync, isWon } from '../game/formulas'
import { useGame } from '../state/GameProvider'

export default function Victory() {
  const { save, view, today, dispatch } = useGame()
  const [confirm, setConfirm] = useState(false)
  if (!isWon(view.sync)) {
    const remaining = GOALS.length - view.goalsCompleted
    return (
      <>
        <p className="brand">THE ANIMUS</p>
        <h1>The year is still open.</h1>
        <p>{remaining} main targets remain before full synchronization.</p>
        <p>Synchronization {formatSync(view.sync)}</p>
      </>
    )
  }
  const creative = GOALS.filter((goal) => goal.skillPathId === 'creator' && (view.goalCurrent[goal.id] ?? 0) >= goal.target)
  return (
    <section className="victory">
      <p className="brand">THE ANIMUS</p>
      <p className="sync-value">{formatSync(view.sync)}</p>
      <h1>FULL SYNCHRONIZATION</h1>
      <h1>SEQUENCE COMPLETE</h1>
      <h1>YEAR WON</h1>
      <div className="stat-grid section">
        <div className="stat"><b>{view.xp}</b><span>Total XP</span></div>
        <div className="stat"><b>{view.contractsCompleted}</b><span>Contracts</span></div>
        <div className="stat"><b>{view.bestStreak}</b><span>Best streak</span></div>
        <div className="stat"><b>{view.goalsCompleted}</b><span>Goals</span></div>
        <div className="stat"><b>{view.pathsDeveloped}</b><span>Paths</span></div>
        <div className="stat"><b>{Object.keys(save.achievementUnlocks).length}</b><span>Achievements</span></div>
        <div className="stat"><b>{creative.length}</b><span>Creative works</span></div>
        <div className="stat"><b>{view.goalCurrent['deploy-projects'] ?? 0}</b><span>Projects shipped</span></div>
        <div className="stat"><b>{view.goalCurrent.experiences ?? 0}</b><span>Experiences</span></div>
        <div className="stat"><b>{view.perfectDays}</b><span>Memories</span></div>
      </div>
      <div className="button-row">
        {confirm ? (
          <button className="btn solid" type="button" onClick={() => dispatch({ type: 'begin-next-year', at: new Date().toISOString(), date: today })}>
            Confirm year 02
          </button>
        ) : (
          <button className="btn solid" type="button" onClick={() => setConfirm(true)}>Begin Sequence 02</button>
        )}
      </div>
    </section>
  )
}
