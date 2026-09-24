import { NavLink, Outlet } from 'react-router-dom'
import { useGame } from '../state/GameProvider'

const LINKS = [
  ['/', 'Home'],
  ['/quests', 'Quests'],
  ['/skills', 'Skills'],
  ['/progress', 'Progress'],
  ['/profile', 'Profile'],
] as const

export default function Layout() {
  const { toasts, storageError } = useGame()
  return (
    <>
      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.kind}`}>{toast.text}</div>
        ))}
      </div>
      <main className="app">
        {storageError ? <p className="warning">{storageError}</p> : null}
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
