import { useState } from 'react'
import { ACHIEVEMENTS } from '../game/achievements'
import { SEQUENCES } from '../game/catalog'
import { formatSync, isWon, percentColor } from '../game/formulas'
import { listGoals } from '../game/goals'
import { addDays } from '../game/dates'
import { babyStatus, money, spanTotals } from '../game/finance'
import { domainProgress, extremeDomains } from '../game/reviews'
import { findReview } from '../game/periods'
import { useGame } from '../state/GameProvider'

export default function Victory() {
  const { save, view, today, journal, dispatch } = useGame()
  const [confirm, setConfirm] = useState(false)
  const [memories, setMemories] = useState('')
  const [became, setBecame] = useState('')
  const yearOpen = view.campaignDay >= 365 || isWon(view.sync)
  if (!yearOpen) {
    const remaining = listGoals(save).length - view.goalsCompleted
    return (
      <>
        <p className="brand">THE ANIMUS</p>
        <h1>The year is still open.</h1>
        <p>{remaining} main targets remain before full synchronization.</p>
        <p>Synchronization <span style={{ color: percentColor(view.sync) }}>{formatSync(view.sync)}</span></p>
      </>
    )
  }
  const goals = listGoals(save)
  const done = (goal: { id: string; target: number; category: string; headline?: boolean; title: string }) => (view.goalCurrent[goal.id] ?? 0) >= goal.target
  const creative = goals.filter((goal) => goal.category === 'Create' && done(goal))
  const places = goals.filter((goal) => goal.category === 'Adventure' && done(goal))
  const relationships = goals.filter((goal) => (goal.category === 'Relationships' || goal.category === 'Intimacy') && done(goal))
  const failures = goals.filter((goal) => goal.headline && !done(goal))
  const domains = domainProgress(save, view.goalCurrent)
  const extremes = extremeDomains(domains)
  const sequenceScores = SEQUENCES.map((sequence) => {
    const rows = goals.filter((goal) => goal.sequenceId === sequence.id)
    const value = rows.length === 0 ? 0 : rows.filter(done).length / rows.length
    return { name: sequence.name, value }
  })
  const hardest = Math.min(...sequenceScores.map((row) => row.value))
  const hardNames = sequenceScores.filter((row) => row.value === hardest).map((row) => row.name)
  const dailyAvg = journal.entries.length ? journal.entries.reduce((sum, entry) => sum + entry.score, 0) / journal.entries.length : 0
  const weekly = (save.reviews ?? []).filter((review) => review.kind === 'weekly' && review.grade !== undefined)
  const monthly = (save.reviews ?? []).filter((review) => review.kind === 'monthly' && review.grade !== undefined)
  const mean = (rows: { grade?: number }[]) => (rows.length ? rows.reduce((sum, review) => sum + (review.grade ?? 0), 0) / rows.length : 0)
  const lessons = (save.reviews ?? []).flatMap((review) => Object.values(review.answers)).filter(Boolean).slice(0, 8)
  const existing = findReview(save.reviews ?? [], 'yearly', { campaign: save.campaign })
  const skills = goals.filter((goal) => (view.goalCurrent[goal.id] ?? 0) > 0).map((goal) => goal.skillPathId)
  const skillNames = [...new Set(skills)]
  return (
    <section className="victory">
      <p className="brand">THE ANIMUS</p>
      <h1>MEMORY SEQUENCE COMPLETE</h1>
      <h1>100 SUNSETS — YEAR {String(save.campaign).padStart(2, '0')}</h1>
      <p className="sync-value" style={{ color: percentColor(view.sync) }}>{formatSync(view.sync)}</p>
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
        <div className="stat"><b>{journal.entries.length}/365</b><span>Days recorded</span></div>
        <div className="stat"><b>{Math.round(dailyAvg)}</b><span>Daily grade</span></div>
        <div className="stat"><b>{weekly.length ? Math.round(mean(weekly)) : '—'}</b><span>Weekly grade</span></div>
        <div className="stat"><b>{monthly.length ? Math.round(mean(monthly)) : '—'}</b><span>Monthly grade</span></div>
      </div>
      <section className="section">
        <h2>Your year</h2>
        <p>Accomplishments: {goals.filter(done).map((goal) => goal.title).join(', ') || 'none yet'}.</p>
        <p>Still open: {failures.map((goal) => goal.title).join(', ') || 'no headline goal left open'}.</p>
        <p>Lessons: {lessons.join(' · ') || 'no review lessons recorded'}.</p>
        <p>Most difficult sequence: {hardNames.join(', ')}.</p>
        <p>Most consistent: {extremes.high.join(', ')}. Most neglected: {extremes.low.join(', ')}.</p>
        <p>Created: {creative.map((goal) => goal.title).join(', ') || 'none'}.</p>
        <p>Places: {places.map((goal) => goal.title).join(', ') || 'none'}.</p>
        <p>Skills moved: {skillNames.length} paths.</p>
        <p>Relationships: {relationships.map((goal) => goal.title).join(', ') || 'none'}.</p>
        <p>Achievements: {ACHIEVEMENTS.filter((item) => save.achievementUnlocks[item.id]).map((item) => item.title).join(', ') || 'none'}.</p>
        <p>Level {view.level.level} — {view.level.title}. Longest streak {view.bestStreak}.</p>
        <FinanceYear />
        <label>Best memories
          <textarea value={memories || existing?.answers.memories || ''} onChange={(event) => setMemories(event.target.value)} />
        </label>
        <label>What did this year turn you into?
          <textarea value={became || existing?.answers.became || ''} onChange={(event) => setBecame(event.target.value)} />
        </label>
        <button className="btn solid" type="button" onClick={() => dispatch({ type: 'save-review', review: { id: existing?.id ?? crypto.randomUUID(), kind: 'yearly', period: { campaign: save.campaign }, answers: { memories: memories || existing?.answers.memories || '', became: became || existing?.answers.became || '' }, snapshot: { sync: view.sync, xp: view.xp, streak: view.streak }, updatedAt: new Date().toISOString() } })}>Save the memory</button>
      </section>
      {isWon(view.sync) ? (
        <div className="button-row">
          {confirm ? (
            <button className="btn solid" type="button" onClick={() => dispatch({ type: 'begin-next-year', at: new Date().toISOString(), date: today })}>
              Confirm year 02
            </button>
          ) : (
            <button className="btn solid" type="button" onClick={() => setConfirm(true)}>Begin Sequence 02</button>
          )}
        </div>
      ) : null}
    </section>
  )
}

function FinanceYear() {
  const { save } = useGame()
  const end = addDays(save.startedAt, 364)
  const totals = spanTotals(save.finance, save.startedAt, end)
  const status = babyStatus(save.finance)
  const cleared = save.finance.debts.filter((debt) => debt.balanceCents > 0 && save.finance.debtPayments.filter((payment) => payment.debtId === debt.id).reduce((sum, payment) => sum + payment.amountCents, 0) >= debt.balanceCents)
  return (
    <>
      <h2>Financial year</h2>
      <p>Income {money(totals.income)} · Expenses {money(totals.expenses)} · Saved {money(totals.saved)}</p>
      <p>Debt paid {money(totals.debtPaid)} · Invested {money(totals.invested)} · Emergency fund {money(save.finance.emergency.amountCents)}</p>
      <p>Baby Step {status.current}. Steps complete: {[status.step1, status.step2, status.step3].filter(Boolean).length}. Debts cleared: {cleared.length}.</p>
    </>
  )
}
