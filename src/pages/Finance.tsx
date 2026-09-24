import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import { localDate } from '../game/dates'
import {
  CATEGORIES,
  GROUPS,
  STARTER_CENTS,
  allocate,
  babyStatus,
  basisTotal,
  categoryName,
  categorySpent,
  debtBalance,
  money,
  monthIncome,
  monthKey,
  monthSpent,
  orderedDebts,
  parseDollars,
  percentLabel,
  ratesFor,
} from '../game/finance'
import { percentColor } from '../game/formulas'
import { isActive, listGoals } from '../game/goals'
import { useGame } from '../state/GameProvider'

function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function tone(spent: number, budget: number): number {
  if (budget <= 0) return spent > 0 ? 0 : 100
  return Math.max(0, Math.min(100, ((budget - spent) / budget) * 100))
}

export default function Finance() {
  const { save, view, dispatch } = useGame()
  const finance = save.finance
  const [month, setMonth] = useState(monthKey(localDate()))
  const [income, setIncome] = useState('')
  const [expense, setExpense] = useState('')
  const [categoryId, setCategoryId] = useState('rent')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(localDate())
  const [editing, setEditing] = useState<string | null>(null)
  const [rates, setRates] = useState<Record<string, string> | null>(null)
  const [debtName, setDebtName] = useState('')
  const [debtBalanceInput, setDebtBalanceInput] = useState('')
  const [debtMin, setDebtMin] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [payDebtId, setPayDebtId] = useState('')
  const [fund, setFund] = useState('')
  const [essential, setEssential] = useState('')
  const [monthsTarget, setMonthsTarget] = useState(String(finance.emergency.targetMonths))
  const ratesNow = ratesFor(finance, month)
  const earned = monthIncome(finance, month)
  const spent = monthSpent(finance, month)
  const status = babyStatus(finance)
  const debts = orderedDebts(finance)
  const goals = listGoals(save).filter((goal) => isActive(save, goal.id) && (goal.category === 'Finance' || goal.category === 'Investing'))
  const now = () => new Date().toISOString()

  const addIncome = () => {
    const amountCents = parseDollars(income)
    if (!amountCents) return
    dispatch({ type: 'add-ledger', at: now(), entry: { id: crypto.randomUUID(), type: 'income', amountCents, date, note, categoryId: undefined } })
    setIncome('')
    setNote('')
  }
  const addExpense = () => {
    const amountCents = parseDollars(expense)
    if (!amountCents) return
    dispatch({ type: 'add-ledger', at: now(), entry: { id: crypto.randomUUID(), type: 'expense', amountCents, date, note, categoryId } })
    setExpense('')
    setNote('')
  }

  return (
    <>
      <p className="brand">FINANCE</p>
      <h1>Command</h1>
      <div className="row-between">
        <button className="btn ghost" type="button" onClick={() => setMonth(shiftMonth(month, -1))}>Previous</button>
        <p>{month}</p>
        <button className="btn ghost" type="button" onClick={() => setMonth(shiftMonth(month, 1))}>Next</button>
      </div>
      <div className="stat-grid section">
        <div className="stat"><b>{money(earned)}</b><span>Income</span></div>
        <div className="stat"><b>{money(spent)}</b><span>Spent</span></div>
        <div className="stat"><b>{money(earned - spent)}</b><span>Remaining</span></div>
        <div className="stat"><b>Step {status.current}</b><span>Baby Step</span></div>
      </div>

      <section className="section">
        <h2>Income</h2>
        <label>Amount<input value={income} onChange={(event) => setIncome(event.target.value)} placeholder="$0.00" /></label>
        <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label>Note<input value={note} onChange={(event) => setNote(event.target.value)} /></label>
        <button className="btn solid" type="button" onClick={addIncome}>Add income</button>
      </section>

      <section className="section">
        <h2>Expense</h2>
        <label>Amount<input value={expense} onChange={(event) => setExpense(event.target.value)} placeholder="$0.00" /></label>
        <label>Category
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <button className="btn solid" type="button" onClick={addExpense}>Add transaction</button>
      </section>

      {GROUPS.map((group) => {
        const rows = CATEGORIES.filter((category) => category.group === group)
        const budget = rows.reduce((sum, category) => sum + allocate(earned, ratesNow[category.id] ?? 0), 0)
        const used = rows.reduce((sum, category) => sum + categorySpent(finance, month, category.id), 0)
        return (
          <section key={group} className="section">
            <h2>{group}</h2>
            <p>{money(used)} / {money(budget)}</p>
            <ProgressBar value={budget === 0 ? 0 : Math.min(100, (used / budget) * 100)} />
            {rows.map((category) => {
              const planned = allocate(earned, ratesNow[category.id] ?? 0)
              const usedCategory = categorySpent(finance, month, category.id)
              const left = planned - usedCategory
              return (
                <article key={category.id} className="card">
                  <p className="kicker">{category.name}</p>
                  <p>{percentLabel(ratesNow[category.id] ?? 0)} · {money(planned)}</p>
                  <p style={{ color: percentColor(tone(usedCategory, planned)) }}>{money(usedCategory)} / {money(planned)}</p>
                  <ProgressBar value={planned === 0 ? (usedCategory > 0 ? 100 : 0) : Math.min(100, (usedCategory / planned) * 100)} />
                  <p>{money(left)} remaining</p>
                </article>
              )
            })}
          </section>
        )
      })}

      <section className="section">
        <h2>Baby Steps</h2>
        <BabyLine n={1} title="Starter Emergency Fund" done={status.step1} current={status.current === 1} value={Math.min(100, (finance.emergency.amountCents / STARTER_CENTS) * 100)} detail={`${money(finance.emergency.amountCents)} / ${money(STARTER_CENTS)}`} />
        <BabyLine n={2} title="Debt Snowball" done={status.step2} current={status.current === 2} value={debtProgress(finance)} detail={debts.length ? `${money(debts.reduce((sum, debt) => sum + debtBalance(debt, finance.debtPayments), 0))} remaining` : 'No debts listed'} />
        <BabyLine n={3} title="Fully Funded Emergency Fund" done={status.step3} current={status.current === 3} value={step3Progress(finance)} detail={step3Detail(finance)} />
        <h3 className="section">Debts</h3>
        {debts.map((debt, index) => (
          <article key={debt.id} className="card">
            <p className="kicker">{index === 0 ? 'Smallest balance' : `Next debt ${index + 1}`}</p>
            <h3>{debt.name}</h3>
            <p>Balance {money(debtBalance(debt, finance.debtPayments))} · Minimum {money(debt.minimumCents)}</p>
          </article>
        ))}
        <label>Debt name<input value={debtName} onChange={(event) => setDebtName(event.target.value)} /></label>
        <label>Balance<input value={debtBalanceInput} onChange={(event) => setDebtBalanceInput(event.target.value)} /></label>
        <label>Minimum<input value={debtMin} onChange={(event) => setDebtMin(event.target.value)} /></label>
        <button className="btn" type="button" onClick={() => {
          const balanceCents = parseDollars(debtBalanceInput)
          const minimumCents = parseDollars(debtMin) ?? 0
          if (!debtName.trim() || balanceCents === null) return
          dispatch({ type: 'add-debt', at: now(), date: localDate(), debt: { id: crypto.randomUUID(), name: debtName.trim(), balanceCents, minimumCents, order: finance.debts.length } })
          setDebtName('')
          setDebtBalanceInput('')
          setDebtMin('')
        }}>Add debt</button>
        <label>Payment debt
          <select value={payDebtId} onChange={(event) => setPayDebtId(event.target.value)}>
            <option value="">Select</option>
            {debts.map((debt) => <option key={debt.id} value={debt.id}>{debt.name}</option>)}
          </select>
        </label>
        <label>Payment amount<input value={payAmount} onChange={(event) => setPayAmount(event.target.value)} /></label>
        <button className="btn" type="button" onClick={() => {
          const amountCents = parseDollars(payAmount)
          if (!payDebtId || !amountCents) return
          dispatch({ type: 'pay-debt', debtId: payDebtId, amountCents, date: localDate(), at: now() })
          setPayAmount('')
        }}>Add debt payment</button>
        {finance.debts.length === 0 ? <button className="btn ghost" type="button" onClick={() => dispatch({ type: 'clear-debts', at: now(), date: localDate() })}>No debts to clear</button> : null}
        <h3 className="section">Emergency fund</h3>
        <p>3-month target {money(finance.emergency.essentialCents * 3)} · 6-month target {money(finance.emergency.essentialCents * 6)}</p>
        <label>Current fund<input value={fund} onChange={(event) => setFund(event.target.value)} placeholder={money(finance.emergency.amountCents)} /></label>
        <label>Monthly essential expenses<input value={essential} onChange={(event) => setEssential(event.target.value)} placeholder={money(finance.emergency.essentialCents)} /></label>
        <label>Target months
          <select value={monthsTarget} onChange={(event) => setMonthsTarget(event.target.value)}>
            {[3, 4, 5, 6].map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
        </label>
        <button className="btn" type="button" onClick={() => {
          const amountCents = parseDollars(fund)
          const essentialCents = parseDollars(essential)
          const targetMonths = Number(monthsTarget)
          if (amountCents === null || essentialCents === null || targetMonths < 3 || targetMonths > 6) return
          dispatch({ type: 'set-emergency', amountCents, essentialCents, targetMonths, at: now(), date: localDate() })
        }}>Update emergency fund</button>
      </section>

      <section className="section">
        <h2>Edit budget</h2>
        {rates ? (
          <>
            <p>Total {(CATEGORIES.reduce((sum, category) => sum + Number(rates[category.id] || 0), 0)).toFixed(2)}%</p>
            {CATEGORIES.map((category) => (
              <label key={category.id}>{category.name}
                <input value={rates[category.id]} onChange={(event) => setRates({ ...rates, [category.id]: event.target.value })} />
              </label>
            ))}
            <button className="btn solid" type="button" onClick={() => {
              const next: Record<string, number> = {}
              for (const category of CATEGORIES) {
                const value = Number(rates[category.id])
                if (!Number.isFinite(value) || value < 0) return
                next[category.id] = Math.round(value * 100)
              }
              if (basisTotal(next) !== 10000) return
              dispatch({ type: 'save-budget', month, rates: next, at: now(), date: `${month}-01` })
              setRates(null)
            }}>Save budget</button>
          </>
        ) : (
          <button className="btn" type="button" onClick={() => setRates(Object.fromEntries(CATEGORIES.map((category) => [category.id, ((ratesNow[category.id] ?? 0) / 100).toFixed(2)])))}>Edit budget</button>
        )}
      </section>

      <section className="section">
        <h2>Transactions</h2>
        {finance.entries.filter((entry) => monthKey(entry.date) === month).map((entry) => (
          <article key={entry.id} className="card">
            {editing === entry.id ? (
              <EditEntry entry={entry} onClose={() => setEditing(null)} />
            ) : (
              <>
                <p className="kicker">{entry.type} · {entry.date}</p>
                <h3>{money(entry.amountCents)} {entry.categoryId ? `· ${categoryName(entry.categoryId)}` : ''}</h3>
                <p>{entry.note || 'No note'}</p>
                <div className="button-row">
                  <button className="btn ghost" type="button" onClick={() => setEditing(entry.id)}>Edit</button>
                  <button className="btn ghost" type="button" onClick={() => dispatch({ type: 'delete-ledger', id: entry.id, at: now(), date: entry.date })}>Delete</button>
                </div>
              </>
            )}
          </article>
        ))}
      </section>

      <section className="section">
        <h2>Campaign</h2>
        <p>Income {money(finance.entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amountCents, 0))}</p>
        <p>Expenses {money(finance.entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amountCents, 0))}</p>
        <p>Debt paid {money(finance.debtPayments.reduce((sum, payment) => sum + payment.amountCents, 0))}</p>
        <p>Emergency fund {money(finance.emergency.amountCents)}</p>
      </section>

      <section className="section">
        <h2>Financial quests</h2>
        {goals.map((goal) => (
          <Link key={goal.id} className="quest-link" to={`/quests/${goal.id}`}>
            <strong>{goal.title}</strong>
            <p>{view.goalCurrent[goal.id] ?? 0} / {goal.target}</p>
          </Link>
        ))}
      </section>
    </>
  )
}

function debtProgress(finance: ReturnType<typeof useGame>['save']['finance']): number {
  const original = finance.debts.reduce((sum, debt) => sum + debt.balanceCents, 0)
  if (original <= 0) return finance.baby.step2Clear ? 100 : 0
  const left = finance.debts.reduce((sum, debt) => sum + debtBalance(debt, finance.debtPayments), 0)
  return Math.max(0, Math.min(100, ((original - left) / original) * 100))
}

function step3Progress(finance: ReturnType<typeof useGame>['save']['finance']): number {
  const target = finance.emergency.essentialCents * finance.emergency.targetMonths
  if (target <= 0) return 0
  return Math.max(0, Math.min(100, (finance.emergency.amountCents / target) * 100))
}

function step3Detail(finance: ReturnType<typeof useGame>['save']['finance']): string {
  const target = finance.emergency.essentialCents * finance.emergency.targetMonths
  return `${money(finance.emergency.amountCents)} / ${money(target)}`
}

function BabyLine({ n, title, done, current, value, detail }: { n: number; title: string; done: boolean; current: boolean; value: number; detail: string }) {
  return (
    <article className={current ? 'card is-done' : 'card'}>
      <p className="kicker">{done ? 'Complete' : current ? 'In progress' : 'Upcoming'}</p>
      <h3>{n}. {title}</h3>
      <p>{detail}</p>
      <ProgressBar value={value} />
    </article>
  )
}

function EditEntry({ entry, onClose }: { entry: { id: string; type: 'income' | 'expense'; amountCents: number; date: string; note: string; categoryId?: string }; onClose: () => void }) {
  const { dispatch } = useGame()
  const [amount, setAmount] = useState((entry.amountCents / 100).toFixed(2))
  const [date, setDate] = useState(entry.date)
  const [note, setNote] = useState(entry.note)
  const [categoryId, setCategoryId] = useState(entry.categoryId ?? 'rent')
  return (
    <>
      <label>Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
      <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label>Note<input value={note} onChange={(event) => setNote(event.target.value)} /></label>
      {entry.type === 'expense' ? (
        <label>Category
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
      ) : null}
      <button className="btn solid" type="button" onClick={() => {
        const amountCents = parseDollars(amount)
        if (!amountCents) return
        dispatch({
          type: 'replace-ledger',
          id: entry.id,
          at: new Date().toISOString(),
          entry: { id: crypto.randomUUID(), type: entry.type, amountCents, date, note, categoryId: entry.type === 'expense' ? categoryId : undefined },
        })
        onClose()
      }}>Save edit</button>
    </>
  )
}
