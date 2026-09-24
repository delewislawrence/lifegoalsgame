import { Link, useParams } from 'react-router-dom'
import { CONTRACTS, GOAL_BY_ID, sequenceById, skillById } from '../game/catalog'
import { useGame } from '../state/GameProvider'
import ProgressBar from '../components/ProgressBar'

export default function QuestDetail() {
  const { goalId = '' } = useParams()
  const goal = GOAL_BY_ID[goalId]
  const { view, today, dispatch } = useGame()
  if (!goal) {
    return (
      <>
        <h1>This quest is not in the codex.</h1>
        <Link className="btn" to="/quests">Back to quests</Link>
      </>
    )
  }
  const current = view.goalCurrent[goal.id] ?? 0
  const done = current >= goal.target
  const sequence = sequenceById(goal.sequenceId)
  const linked = CONTRACTS.find((contract) => contract.linkedGoalId === goal.id)
  const log = (amount: number) => dispatch({ type: 'log-goal', goalId: goal.id, amount, date: today, at: new Date().toISOString() })
  return (
    <>
      <Link className="meta" to="/quests">Quest log</Link>
      <p className="kicker">{goal.category}</p>
      <h1>{goal.title}</h1>
      <p>{goal.description}</p>
      <p className="progress-copy">
        {goal.type === 'checkbox' ? (done ? 'Complete' : 'Incomplete') : `${current} / ${goal.target} ${goal.unit}`}
      </p>
      <ProgressBar value={(current / goal.target) * 100} />
      <p className="meta">{goal.xpReward} XP · {skillById(goal.skillPathId).name} · Sequence {sequence.index}</p>
      <p className="meta">{done ? 'Complete' : current > 0 ? 'In progress' : 'Not started'}</p>
      {linked ? <p>Today's {linked.defaultTitle} contract also logs one {goal.unit.replace(/s$/, '')}.</p> : null}
      <div className="button-row">
        {goal.type === 'checkbox' ? (
          <button className="btn solid" type="button" disabled={done} onClick={() => log(1)}>Complete</button>
        ) : (
          <>
            <button className="btn solid" type="button" disabled={done} onClick={() => log(1)}>+1</button>
            {goal.target >= 20 ? <button className="btn" type="button" disabled={done} onClick={() => log(10)}>+10</button> : null}
          </>
        )}
        <button className="btn ghost" type="button" disabled={current <= 0} onClick={() => log(goal.type === 'checkbox' ? -1 : -1)}>Undo</button>
      </div>
    </>
  )
}
