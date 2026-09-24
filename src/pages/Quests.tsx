import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GOALS, SEQUENCES, skillById } from '../game/catalog'
import { formatSync } from '../game/formulas'
import type { SequenceId } from '../game/types'
import { useGame } from '../state/GameProvider'
import ProgressBar from '../components/ProgressBar'

export default function Quests() {
  const { view } = useGame()
  const [filter, setFilter] = useState<SequenceId | 'all'>('all')
  const goals = GOALS.filter((goal) => filter === 'all' || goal.sequenceId === filter)
  return (
    <>
      <p className="brand">QUEST LOG</p>
      <h1>Memory Sequences</h1>
      {SEQUENCES.map((sequence) => (
        <button
          key={sequence.id}
          type="button"
          className={filter === sequence.id ? 'card chip active' : 'card'}
          onClick={() => setFilter((current) => (current === sequence.id ? 'all' : sequence.id))}
        >
          <p className="kicker">
            Sequence {sequence.index}
            {view.sequence.id === sequence.id ? ' · Current' : ''}
          </p>
          <h3>{sequence.name}</h3>
          <p>{sequence.purpose}</p>
          <p className="progress-copy">{formatSync(view.sequenceProgress[sequence.id])}</p>
          <ProgressBar value={view.sequenceProgress[sequence.id]} />
        </button>
      ))}
      <section className="section">
        <h2>Main Targets</h2>
        <div className="chip-row">
          <button type="button" className={filter === 'all' ? 'btn chip active' : 'btn chip'} onClick={() => setFilter('all')}>All</button>
          {SEQUENCES.map((sequence) => (
            <button key={sequence.id} type="button" className={filter === sequence.id ? 'btn chip active' : 'btn chip'} onClick={() => setFilter(sequence.id)}>
              {sequence.index}
            </button>
          ))}
        </div>
        {goals.map((goal) => {
          const current = view.goalCurrent[goal.id] ?? 0
          const pct = (current / goal.target) * 100
          return (
            <Link key={goal.id} className="quest-link" to={`/quests/${goal.id}`}>
              <p className="kicker">{goal.category} · {skillById(goal.skillPathId).name}</p>
              <strong>{goal.title}</strong>
              <p>{goal.type === 'checkbox' ? (current >= goal.target ? 'Complete' : 'Incomplete') : `${current} / ${goal.target} ${goal.unit}`}</p>
              <p>{goal.xpReward} XP · {current >= goal.target ? 'Complete' : current > 0 ? 'In progress' : 'Not started'}</p>
              <ProgressBar value={pct} />
            </Link>
          )
        })}
      </section>
    </>
  )
}
