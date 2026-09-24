import { Link, useParams } from 'react-router-dom'
import { CONTRACTS, GOAL_BY_ID, isChecklist, sequenceById, skillById } from '../game/catalog'
import { useGame } from '../state/GameProvider'
import ProgressBar from '../components/ProgressBar'

export default function QuestDetail() {
  const { goalId = '' } = useParams()
  const goal = GOAL_BY_ID[goalId]
  const { save, view, today, dispatch } = useGame()
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
  const checklist = isChecklist(goal)
  const sequence = sequenceById(goal.sequenceId)
  const linked = CONTRACTS.find((contract) => contract.linkedGoalId === goal.id)
  const doneIds = new Set(save.events.filter((event) => event.goalId === goal.id && event.subtaskId).map((event) => event.subtaskId))
  const log = (amount: number) => dispatch({ type: 'log-goal', goalId: goal.id, amount, date: today, at: new Date().toISOString() })
  return (
    <>
      <Link className="meta" to="/quests">Quest log</Link>
      <p className="kicker">{goal.category}</p>
      <h1>{goal.title}</h1>
      <p>{goal.description}</p>
      <p className="progress-copy">
        {goal.target === 1 ? (done ? 'Complete' : 'Incomplete') : `${current} / ${goal.target} ${goal.unit}`}
      </p>
      <ProgressBar value={(current / goal.target) * 100} />
      <p className="meta">{goal.xpReward} XP · {skillById(goal.skillPathId).name} · Sequence {sequence.index}</p>
      <p className="meta">{done ? 'Complete' : current > 0 ? 'In progress' : 'Not started'}</p>
      {linked ? <p>Today's {linked.defaultTitle} contract also logs one {goal.unit.replace(/s$/, '')}.</p> : null}
      <h2 className="section">Steps</h2>
      <div className={goal.subtasks.length > 12 ? 'steps compact' : 'steps'}>
        {goal.subtasks.map((step) => {
          const complete = checklist ? doneIds.has(step.id) : current >= (step.at ?? goal.target)
          return (
            <button
              key={step.id}
              type="button"
              className={complete ? 'step done' : 'step'}
              onClick={() => {
                if (checklist) {
                  dispatch({ type: 'toggle-subtask', goalId: goal.id, subtaskId: step.id, date: today, at: new Date().toISOString() })
                  return
                }
                if (step.at && step.at > current) log(step.at - current)
              }}
            >
              <span>{step.title}</span>
              <span>{complete ? 'Done' : checklist ? 'Mark' : 'Reach'}</span>
            </button>
          )
        })}
      </div>
      {checklist ? null : (
        <div className="button-row">
          <button className="btn solid" type="button" disabled={done} onClick={() => log(1)}>+1</button>
          {goal.target >= 20 ? <button className="btn" type="button" disabled={done} onClick={() => log(10)}>+10</button> : null}
          <button className="btn ghost" type="button" disabled={current <= 0} onClick={() => dispatch({ type: 'undo-last-log', goalId: goal.id })}>Undo</button>
        </div>
      )}
    </>
  )
}
