import { Link, useParams } from 'react-router-dom'
import { GOALS, skillById } from '../game/catalog'
import { formatSync, percentColor } from '../game/formulas'
import type { SkillPathId } from '../game/types'
import { useGame } from '../state/GameProvider'
import ProgressBar from '../components/ProgressBar'

const IDS = new Set(['combat', 'stealth', 'eagle', 'economic', 'creator', 'brotherhood', 'intimacy', 'inner-temple', 'artisan', 'hidden-bureau', 'explorer', 'play', 'character'])

export default function SkillDetail() {
  const { pathId = '' } = useParams()
  const { view } = useGame()
  if (!IDS.has(pathId)) {
    return (
      <>
        <h1>This path is not in the codex.</h1>
        <Link className="btn" to="/skills">Back to skills</Link>
      </>
    )
  }
  const id = pathId as SkillPathId
  const path = skillById(id)
  const goals = id === 'character' ? [] : GOALS.filter((goal) => goal.skillPathId === id)
  const progress = view.skillProgress[id] ?? 0
  return (
    <>
      <Link className="meta" to="/skills">Skill tree</Link>
      <p className="kicker">{progress >= 99.999 ? 'Mastered' : progress > 0 ? 'Unlocked' : 'Locked'}</p>
      <h1>{path.name}</h1>
      <p>{path.description}</p>
      {id === 'character' ? <p>Character has no private quests. It is the average of the other twelve paths.</p> : null}
      <p className="progress-copy" style={{ color: percentColor(progress) }}>{formatSync(progress)}</p>
      <ProgressBar value={progress} />
      {goals.map((goal) => {
        const current = view.goalCurrent[goal.id] ?? 0
        return (
          <Link key={goal.id} className="quest-link" to={`/quests/${goal.id}`}>
            <strong>{goal.title}</strong>
            <p>{goal.target === 1 ? (current >= goal.target ? 'Complete' : 'Incomplete') : `${current} / ${goal.target} ${goal.unit}`}</p>
            <ProgressBar value={(current / goal.target) * 100} />
          </Link>
        )
      })}
    </>
  )
}
