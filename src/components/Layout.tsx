import { NavLink, Outlet } from 'react-router-dom'
import { formatSync, percentColor } from '../game/formulas'
import HermeticField from './HermeticField'
import { useGame } from '../state/GameProvider'

const LINKS = [
  ['/', 'Home'],
  ['/quests', 'Quests'],
  ['/skills', 'Skills'],
  ['/days', 'Days'],
  ['/finance', 'Finance'],
  ['/review', 'Review'],
  ['/progress', 'Progress'],
  ['/profile', 'Profile'],
] as const

export default function Layout() {
  const { view, toasts, storageError } = useGame()
  return (
    <>
      <HermeticField />
      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.kind}`}>{toast.text}</div>
        ))}
      </div>
      <main className="app">
        {storageError ? <p className="warning">{storageError}</p> : null}
        <p className="stats">
          <span>{view.streak} day streak</span>
          <span>{view.level.title}</span>
          <span>{view.xp.toLocaleString('en-US')} XP</span>
          <span style={{ color: percentColor(view.sync) }}>{formatSync(view.sync)}</span>
          <span>Day {Math.max(0, view.campaignDay)}</span>
          <span>Sequence {view.sequence.index}</span>
        </p>
        <Outlet />
      </main>
      <nav className="nav">
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
