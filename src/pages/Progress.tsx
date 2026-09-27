import { ACHIEVEMENTS } from '../game/achievements'
import { formatSync, percentColor } from '../game/formulas'
import { achievementDescription, levelTitle, useThemeId } from '../settings/names'
import { useGame } from '../state/GameProvider'
import ProgressBar from '../components/ProgressBar'

export default function ProgressPage() {
  const { save, view } = useGame()
  const theme = useThemeId()
  const levelPct = view.level.nextXp ? (view.level.intoLevel / view.level.span) * 100 : 100
  return (
    <>
      <p className="brand">PROGRESS</p>
      <h1>LEVEL {view.level.level} — {levelTitle(theme, view.level.level).toUpperCase()}</h1>
      <p>{view.xp} XP{view.level.nextXp ? ` · ${view.level.nextXp - view.xp} to ${levelTitle(theme, view.level.level + 1)}` : ''}</p>
      <ProgressBar value={levelPct} />
      <p className="meta">Synchronization <span style={{ color: percentColor(view.sync) }}>{formatSync(view.sync)}</span></p>
      <div className="stat-grid section">
        <div className="stat"><b>{view.contractsCompleted}</b><span>Contracts</span></div>
        <div className="stat"><b>{view.perfectDays}</b><span>Perfect days</span></div>
        <div className="stat"><b>{view.bestStreak}</b><span>Best streak</span></div>
        <div className="stat"><b>{view.goalsCompleted}</b><span>Goals complete</span></div>
        <div className="stat"><b>{view.pathsDeveloped}</b><span>Paths active</span></div>
        <div className="stat"><b>{Object.keys(save.achievementUnlocks).length}</b><span>Achievements</span></div>
      </div>
      <section className="section">
        <h2>Achievements</h2>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = save.achievementUnlocks[achievement.id]
          return (
            <article key={achievement.id} className={unlocked ? 'achieve' : 'achieve locked'}>
              <small>{unlocked ? 'Unlocked' : 'Locked'}</small>
              <h3>{achievement.title}</h3>
              <p>{achievementDescription(theme, achievement.id, achievement.description)}</p>
            </article>
          )
        })}
      </section>
    </>
  )
}
