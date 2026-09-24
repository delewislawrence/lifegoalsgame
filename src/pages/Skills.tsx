import { Link } from 'react-router-dom'
import { GOALS, SKILL_PATHS } from '../game/catalog'
import { formatSync } from '../game/formulas'
import { useGame } from '../state/GameProvider'
import ProgressBar from '../components/ProgressBar'

function stateLabel(value: number): string {
  if (value >= 99.999) return 'Mastered'
  if (value > 0) return 'Unlocked'
  return 'Locked'
}

export default function Skills() {
  const { view } = useGame()
  return (
    <>
      <p className="brand">SKILL TREE</p>
      <h1>Paths</h1>
      <p>Thirteen paths. Progress comes from the quests inside them.</p>
      {SKILL_PATHS.map((path) => {
        const progress = view.skillProgress[path.id] ?? 0
        const headline = GOALS.find((goal) => goal.skillPathId === path.id && goal.headline)
        const current = headline ? view.goalCurrent[headline.id] ?? 0 : 0
        return (
          <Link key={path.id} className="path-card" to={`/skills/${path.id}`}>
            <p className="kicker">{stateLabel(progress)}</p>
            <strong>{path.name}</strong>
            <p>{path.description}</p>
            {headline ? (
              <p className="progress-copy">
                {headline.type === 'checkbox'
                  ? (current >= headline.target ? 'Complete' : 'Not yet')
                  : `${current} / ${headline.target} ${headline.unit}`}
                {' · '}{headline.title}
              </p>
            ) : <p className="progress-copy">Average of every path</p>}
            <ProgressBar value={progress} />
            <p>{formatSync(progress)}</p>
          </Link>
        )
      })}
    </>
  )
}
