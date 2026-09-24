import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CONTRACTS, SEQUENCES } from '../game/catalog'
import { addDays, formatLongDate } from '../game/dates'
import { formatSync, percentColor } from '../game/formulas'
import { isActive, listGoals } from '../game/goals'
import { GRADE_SCORES, gradeName } from '../game/journal'
import { CATEGORIES, allocate, babyStatus, categorySpent, money, monthKey, ratesFor, spanTotals } from '../game/finance'
import { daysElapsedIn, domainProgress, paceSplit, periodSync } from '../game/reviews'
import { dueReview, findReview, monthOf, quarterOf, reviewKey, weekOf, type DueReview } from '../game/periods'
import { useGame } from '../state/GameProvider'
import ProgressBar from '../components/ProgressBar'
import type { ReviewRecord } from '../game/types'

const WHY = ['Too ambitious', 'Poor planning', 'Lack of time', 'Avoidance', 'Unexpected event', 'Low energy', 'Wrong priority']

const WEEKLY_FIELDS = [
  ['why', 'Why?'],
  ['patterns', 'What patterns appeared?'],
  ['attention', 'What deserves more attention?'],
  ['stop', 'What should I stop doing?'],
  ['priorities', "Next week's priorities"],
  ['spending', 'What did my spending tell me this week?'],
] as const

const MONTHLY_FIELDS = [
  ['forward', 'What moved forward?'],
  ['stalled', 'What stalled?'],
  ['learned', 'What did I learn?'],
  ['change', 'What needs to change next month?'],
  ['focus', 'What is my ONE major focus for next month?'],
  ['financeWell', 'What went well financially?'],
  ['overspend', 'Where did I overspend?'],
  ['surprised', 'What surprised me?'],
  ['financeChange', 'What should change next month?'],
  ['financePriority', 'What is my financial priority next month?'],
] as const

const QUARTER_FIELDS = [
  ['working', 'What is working?'],
  ['notWorking', "What isn't working?"],
  ['changed', 'What has changed?'],
  ['harder', 'What should I pursue harder?'],
  ['reduce', 'What should I reduce?'],
  ['drop', 'What no longer matters?'],
  ['opportunity', 'What new opportunity appeared?'],
  ['nextFocus', 'What is the focus of the next sequence?'],
] as const

function rangeEvents(saveEvents: { type: string; date: string; contractId?: string; goalId?: string; amount?: number }[], start: string, end: string) {
  return saveEvents.filter((event) => event.date >= start && event.date <= end)
}

export default function Review() {
  const { save, view, today } = useGame()
  const reviews = save.reviews ?? []
  const due = dueReview(save.startedAt, today, reviews, view.campaignDay)
  const [pick, setPick] = useState<DueReview | null>(null)
  const [pastId, setPastId] = useState<string | null>(null)
  const selected = pick ?? due
  const past = reviews.find((review) => review.id === pastId)

  return (
    <>
      <p className="brand">REVIEW</p>
      <h1>Course correction</h1>
      {past ? <PastReview review={past} onBack={() => setPastId(null)} /> : null}
      {!past && selected ? <ReviewForm key={reviewKey(selected.kind, selected.period)} due={selected} /> : null}
      {!past && !selected ? <p>No review is waiting. A week, month, or sequence appears here when it ends.</p> : null}
      {!past ? (
        <div className="chip-row section">
          <button type="button" className="btn chip" onClick={() => openCurrent('weekly')}>This week</button>
          <button type="button" className="btn chip" onClick={() => openCurrent('monthly')}>This month</button>
          <button type="button" className="btn chip" onClick={() => openCurrent('quarterly')}>This sequence</button>
        </div>
      ) : null}
      <section className="section">
        <h2>History</h2>
        <p className="meta"><Link to="/days">Daily reflections</Link></p>
        {reviews.length === 0 ? <p>No weekly, monthly, quarterly, or yearly reviews yet.</p> : null}
        {[...reviews].reverse().map((review) => (
          <button key={review.id} type="button" className="card" onClick={() => { setPastId(review.id); setPick(null) }}>
            <p className="kicker">{review.kind}</p>
            <h3>{historyLabel(review)}</h3>
            {review.grade !== undefined ? <p>{review.grade} — {gradeName(review.grade)}</p> : null}
          </button>
        ))}
      </section>
    </>
  )

  function openCurrent(kind: DueReview['kind']) {
    if (view.campaignDay < 1) return
    if (kind === 'weekly') {
      const week = weekOf(save.startedAt, view.campaignDay)
      setPick({ kind, period: { weekStart: week.start, weekEnd: week.end }, label: `Week ${week.week}` })
    } else if (kind === 'monthly') {
      const month = monthOf(save.startedAt, view.campaignDay)
      setPick({ kind, period: { month: month.month, year: 1 }, label: `Month ${month.month}` })
    } else {
      const quarter = quarterOf(save.startedAt, view.campaignDay)
      setPick({ kind, period: { sequenceId: quarter.sequenceId }, label: `Sequence ${quarter.index}` })
    }
    setPastId(null)
  }
}

function historyLabel(review: ReviewRecord): string {
  if (review.kind === 'weekly') return `${review.period.weekStart} — ${review.period.weekEnd}`
  if (review.kind === 'monthly') return `Month ${review.period.month}`
  if (review.kind === 'quarterly') return SEQUENCES.find((sequence) => sequence.id === review.period.sequenceId)?.name ?? 'Sequence'
  return `Year ${review.period.campaign ?? 1}`
}

function ReviewForm({ due }: { due: DueReview }) {
  const { save, view, today, journal, dispatch } = useGame()
  const existing = findReview(save.reviews ?? [], due.kind, due.period)
  const span = spanFor(save.startedAt, due)
  const [answers, setAnswers] = useState<Record<string, string>>(existing?.answers ?? {})
  const [grade, setGrade] = useState(existing?.grade ?? 70)
  const [note, setNote] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Create')
  const goals = listGoals(save).filter((goal) => isActive(save, goal.id))
  const domains = domainProgress(save, view.goalCurrent)
  const pace = paceSplit(save, view.goalCurrent, view.campaignDay)
  const inSpan = useMemo(() => rangeEvents(save.events, span.start, span.end), [save.events, span.start, span.end])
  const doneContracts = inSpan.filter((event) => event.type === 'contract')
  const moved = [...new Set(inSpan.filter((event) => event.type === 'goal-progress' && (event.amount ?? 0) > 0).map((event) => event.goalId))]
  const days = journal.entries.filter((entry) => entry.date >= span.start && entry.date <= span.end)
  const openQuests = days.flatMap((entry) => entry.snapshot?.questsOpen ?? [])
  const elapsed = daysElapsedIn(today, span.start, span.end)
  const sync = periodSync(days, span.start, span.end, doneContracts.length, elapsed)
  const missed = missedContracts(save.events, span.start, span.end, today)

  const saveReview = () => {
    const review: ReviewRecord = {
      id: existing?.id ?? crypto.randomUUID(),
      kind: due.kind,
      period: due.period,
      grade: due.kind === 'quarterly' ? undefined : grade,
      answers,
      snapshot: { sync: view.sync, xp: view.xp, streak: view.streak },
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'save-review', review })
  }

  return (
    <section className="section">
      <p className="kicker">{due.kind === 'weekly' ? 'Correct' : due.kind === 'monthly' ? 'Recalibrate' : 'Reorient'}</p>
      <h2>{due.label}</h2>
      <p className="meta">{formatLongDate(span.start)} — {formatLongDate(span.end)}</p>
      <FinanceBrief start={span.start} end={span.end} kind={due.kind} />
      {due.kind !== 'monthly' ? (
        <>
          <h3 className="section">Completed</h3>
          <p>{doneContracts.length} contracts. Quests that moved: {moved.length ? moved.map((id) => listGoals(save).find((goal) => goal.id === id)?.title ?? id).join(', ') : 'none'}.</p>
          <h3 className="section">Missed</h3>
          <p>{missed.length ? missed.join(', ') : 'No missed contracts in the days that have passed.'}</p>
          <p>Unfinished steps: {openQuests.length ? openQuests.join(', ') : 'none recorded'}.</p>
        </>
      ) : null}
      {due.kind !== 'weekly' ? (
        <div className="section">
          {domains.map((domain) => (
            <div key={domain.id} className="domain-row">
              <span>{domain.label}</span>
              <ProgressBar value={domain.value} />
              <span style={{ color: percentColor(domain.value) }}>{formatSync(domain.value)}</span>
            </div>
          ))}
        </div>
      ) : null}
      {due.kind === 'monthly' ? (
        <>
          <p>Behind: {pace.behind.map((goal) => goal.title).join(', ') || 'none'}.</p>
          <p>Ahead: {pace.ahead.map((goal) => goal.title).join(', ') || 'none'}.</p>
          <FocusGoals title="Body" ids={['training-days', 'sleep-nights', 'recovery-sessions', 'martial-arts']} />
          <FocusGoals title="Mind" ids={['begin-coding', 'coding-course', 'finance-books', 'deep-work-days']} />
          <FocusGoals title="Create" ids={['beat-tape', 'novel', 'photo-portfolio', 'dj-mixes']} />
        </>
      ) : null}
      {due.kind === 'quarterly' ? (
        <div className="section">
          <p>Sequence {view.sequence.index} — {view.sequence.name} · Day {view.campaignDay} · <span style={{ color: percentColor(view.sync) }}>{formatSync(view.sync)}</span></p>
          {goals.map((goal) => (
            <article key={goal.id} className="card">
              <strong>{goal.title}</strong>
              <p>{goal.category}</p>
              <div className="button-row">
                <button className="btn ghost" type="button" onClick={() => dispatch({ type: 'set-goal-status', goalId: goal.id, state: 'active', at: new Date().toISOString(), date: today })}>Continue</button>
                <button className="btn ghost" type="button" onClick={() => dispatch({ type: 'set-goal-status', goalId: goal.id, state: 'active', note, at: new Date().toISOString(), date: today })}>Modify</button>
                <button className="btn ghost" type="button" onClick={() => dispatch({ type: 'set-goal-status', goalId: goal.id, state: 'paused', note, at: new Date().toISOString(), date: today })}>Pause</button>
                <button className="btn ghost" type="button" onClick={() => dispatch({ type: 'set-goal-status', goalId: goal.id, state: 'removed', note, at: new Date().toISOString(), date: today })}>Remove</button>
              </div>
            </article>
          ))}
          <label>Note for modify, pause, or remove
            <input value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <label>Add a goal
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
          </label>
          <label>Category
            <input value={category} onChange={(event) => setCategory(event.target.value)} />
          </label>
          <button
            className="btn"
            type="button"
            onClick={() => {
              if (!title.trim()) return
              dispatch({ type: 'add-custom-goal', goal: { id: crypto.randomUUID(), title: title.trim(), category: category.trim() || 'Create', createdAt: new Date().toISOString() }, at: new Date().toISOString(), date: today })
              setTitle('')
            }}
          >Add</button>
        </div>
      ) : null}
      <p className="meta section">Synchronization {formatSync(sync)}</p>
      {(due.kind === 'weekly' ? WEEKLY_FIELDS : due.kind === 'monthly' ? MONTHLY_FIELDS : QUARTER_FIELDS).map(([key, label]) => (
        <label key={key}>{label}
          {key === 'why' ? (
            <div className="chip-row">
              {WHY.map((reason) => (
                <button key={reason} className="btn chip" type="button" onClick={() => setAnswers((current) => ({ ...current, why: current.why ? `${current.why} ${reason}` : reason }))}>{reason}</button>
              ))}
            </div>
          ) : null}
          <textarea value={answers[key] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value }))} />
        </label>
      ))}
      {due.kind !== 'quarterly' ? (
        <div className="chip-row section">
          {GRADE_SCORES.map((score) => (
            <button key={score} type="button" className={grade === score ? 'btn chip active' : 'btn chip'} onClick={() => setGrade(score)}>{score}</button>
          ))}
        </div>
      ) : null}
      <button className="btn solid section" type="button" onClick={saveReview}>{existing ? 'Update review' : 'Save review'}</button>
    </section>
  )
}

function FocusGoals({ title, ids }: { title: string; ids: string[] }) {
  const { save, view } = useGame()
  const goals = listGoals(save).filter((goal) => ids.includes(goal.id))
  return (
    <div className="section">
      <h3>{title}</h3>
      {goals.map((goal) => {
        const pct = ((view.goalCurrent[goal.id] ?? 0) / goal.target) * 100
        return <p key={goal.id}>{goal.title} · <span style={{ color: percentColor(pct) }}>{formatSync(pct)}</span></p>
      })}
    </div>
  )
}

function PastReview({ review, onBack }: { review: ReviewRecord; onBack: () => void }) {
  return (
    <section className="section">
      <button className="btn ghost" type="button" onClick={onBack}>Back</button>
      <h2>{historyLabel(review)}</h2>
      {review.grade !== undefined ? <p className="seal">{review.grade} — {gradeName(review.grade)}</p> : null}
      {Object.entries(review.answers).map(([key, value]) => value ? <p key={key}><b>{key}</b> — {value}</p> : null)}
    </section>
  )
}

function spanFor(startedAt: string, due: DueReview): { start: string; end: string } {
  if (due.kind === 'weekly' && due.period.weekStart && due.period.weekEnd) return { start: due.period.weekStart, end: due.period.weekEnd }
  if (due.kind === 'monthly' && due.period.month) {
    const span = monthOf(startedAt, (due.period.month - 1) * 30 + 1)
    return { start: span.start, end: span.end }
  }
  const sequence = SEQUENCES.find((item) => item.id === due.period.sequenceId) ?? SEQUENCES[0]
  const startDay = sequence.startDay + 1
  const quarter = quarterOf(startedAt, startDay)
  return { start: quarter.start, end: quarter.end }
}

function FinanceBrief({ start, end, kind }: { start: string; end: string; kind: 'weekly' | 'monthly' | 'quarterly' }) {
  const { save } = useGame()
  const finance = save.finance
  const totals = spanTotals(finance, start, end)
  const status = babyStatus(finance)
  const largest = [...CATEGORIES].sort((a, b) => categorySpentSpan(finance, start, end, b.id) - categorySpentSpan(finance, start, end, a.id)).slice(0, 3)
  const over = CATEGORIES.filter((category) => {
    const key = monthKey(end)
    const planned = allocate(finance.entries.filter((entry) => entry.type === 'income' && monthKey(entry.date) === key).reduce((sum, entry) => sum + entry.amountCents, 0), ratesFor(finance, key)[category.id] ?? 0)
    return categorySpent(finance, key, category.id) > planned && planned > 0
  })
  return (
    <section className="section">
      <h3>Finance</h3>
      <p>Income {money(totals.income)} · Expenses {money(totals.expenses)} · Remaining {money(totals.remaining)}</p>
      <p>Saved {money(totals.saved)} · Debt payments {money(totals.debtPaid)} · Invested {money(totals.invested)}</p>
      <p>Emergency fund {money(finance.emergency.amountCents)} · Baby Step {status.current}</p>
      {kind === 'weekly' ? <p>Largest categories: {largest.map((category) => category.name).join(', ') || 'none'}. Over budget: {over.map((category) => category.name).join(', ') || 'none'}.</p> : null}
      {kind !== 'weekly' ? CATEGORIES.map((category) => <p key={category.id}>{category.name} {money(categorySpentSpan(finance, start, end, category.id))}</p>) : null}
    </section>
  )
}

function categorySpentSpan(finance: { entries: { type: string; categoryId?: string; date: string; amountCents: number }[] }, start: string, end: string, categoryId: string): number {
  return finance.entries.filter((entry) => entry.type === 'expense' && entry.categoryId === categoryId && entry.date >= start && entry.date <= end).reduce((sum, entry) => sum + entry.amountCents, 0)
}

function missedContracts(events: { type: string; date: string; contractId?: string }[], start: string, end: string, today: string): string[] {
  const last = today < end ? today : end
  if (last < start) return []
  const missed: string[] = []
  let date = start
  while (date <= last && missed.length < 12) {
    for (const contract of CONTRACTS) {
      const done = events.some((event) => event.type === 'contract' && event.date === date && event.contractId === contract.id)
      if (!done) missed.push(`${date} ${contract.defaultTitle}`)
    }
    date = addDays(date, 1)
  }
  return missed
}
