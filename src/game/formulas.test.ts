import { GOALS } from './catalog'
import { gradeDay } from './journal'
import { nextAgenda } from './schedule'
import { addDays } from './dates'
import { isActive, listGoals } from './goals'
import { monthOf, weekOf } from './periods'
import { paceSplit, periodSync } from './reviews'
import { derive } from './derive'
import { formatSyncDelta, levelFromXp, percentColor, syncFromRatios, xpForProgress } from './formulas'
import { allocate, basisTotal, categorySpent, debtBalance, defaultTemplate, emptyFinance, monthIncome, addEntry, babyStatus } from './finance'
import { commit, createSave } from './reducer'

const day = '2026-01-01'

function at(date: string) {
  return `${date}T15:00:00.000Z`
}

describe('levels and sync', () => {
  it('maps XP to the named levels', () => {
    expect(levelFromXp(0).title).toBe('Initiate')
    expect(levelFromXp(299).level).toBe(1)
    expect(levelFromXp(300).title).toBe('Recruit')
    expect(levelFromXp(900).title).toBe('Apprentice')
    expect(levelFromXp(22000).title).toBe('Full Synchronization')
    expect(levelFromXp(22000).nextXp).toBeNull()
  })

  it('averages every main target equally', () => {
    expect(syncFromRatios([1, 0.5, 0])).toBe(50)
  })

  it('moves percentage color from red through yellow to green', () => {
    expect(percentColor(0)).toBe('rgb(220, 32, 32)')
    expect(percentColor(33)).toBe('rgb(232, 122, 18)')
    expect(percentColor(66)).toBe('rgb(236, 208, 42)')
    expect(percentColor(100)).toBe('rgb(36, 176, 72)')
    expect(percentColor(-20)).toBe(percentColor(0))
    expect(percentColor(140)).toBe(percentColor(100))
  })

  it('hides tiny sync deltas and shows the rest', () => {
    expect(formatSyncDelta(0.04)).toBeNull()
    expect(formatSyncDelta(0.4)).toBe('SYNC +0.4%')
    expect(formatSyncDelta(12)).toBe('SYNC +12%')
  })

  it('pays the XP remainder on the last step', () => {
    const goal = GOALS.find((item) => item.id === 'martial-arts')!
    const before = xpForProgress(goal.xpReward, goal.target, 199)
    const after = xpForProgress(goal.xpReward, goal.target, 200)
    expect(after).toBe(goal.xpReward)
    expect(after - before).toBe(goal.xpReward - before)
    expect(before).toBeLessThan(goal.xpReward)
  })
})

describe('campaign actions', () => {
  it('undoes a same-day contract and its linked progress', () => {
    const start = createSave(new Date('2026-01-01T12:00:00'))
    start.startedAt = day
    const done = commit(start, { type: 'complete-contract', contractId: 'body', date: day, at: at(day) }, day, at(day))
    const view = derive(done, day)
    expect(view.xp).toBeGreaterThan(20)
    expect(view.goalCurrent['training-days']).toBe(1)
    expect(view.todayCount).toBe(1)
    const undone = commit(done, { type: 'uncomplete-contract', contractId: 'body', date: day, today: day }, day, at(day))
    const after = derive(undone, day)
    expect(after.xp).toBe(0)
    expect(after.goalCurrent['training-days']).toBe(0)
    expect(after.todayCount).toBe(0)
  })

  it('awards the daily bonus once and removes it if the day breaks', () => {
    let save = createSave()
    save.startedAt = day
    for (const contractId of ['body', 'mind', 'inner-temple'] as const) {
      save = commit(save, { type: 'complete-contract', contractId, date: day, at: at(day) }, day, at(day))
    }
    const view = derive(save, day)
    expect(view.memorySynchronized).toBe(true)
    expect(save.events.filter((event) => event.type === 'daily-bonus')).toHaveLength(1)
    const undone = commit(save, { type: 'uncomplete-contract', contractId: 'mind', date: day, today: day }, day, at(day))
    expect(undone.events.some((event) => event.type === 'daily-bonus')).toBe(false)
    expect(derive(undone, day).memorySynchronized).toBe(false)
  })

  it('keeps a streak through an open day and clears it after a miss', () => {
    let save = createSave()
    save.startedAt = day
    const fill = (date: string) => {
      for (const contractId of ['body', 'mind', 'inner-temple'] as const) {
        save = commit(save, { type: 'complete-contract', contractId, date, at: at(date) }, date, at(date))
      }
    }
    fill(day)
    fill(addDays(day, 1))
    expect(derive(save, addDays(day, 1)).streak).toBe(2)
    expect(derive(save, addDays(day, 2)).streak).toBe(2)
    expect(derive(save, addDays(day, 3)).streak).toBe(0)
    expect(derive(save, addDays(day, 3)).xp).toBeGreaterThan(0)
  })

  it('checks income tiers one step at a time', () => {
    const start = createSave()
    start.startedAt = day
    const goal = GOALS.find((item) => item.id === 'income-tiers')!
    expect(goal.subtasks.map((step) => step.title)).toEqual([
      'Tier 1 — Record your current monthly income',
      'Tier 2 — Increase one existing income source',
      'Tier 3 — Open a second income stream',
      'Tier 4 — Cover your written monthly number',
    ])
    const marked = commit(start, { type: 'toggle-subtask', goalId: 'income-tiers', subtaskId: goal.subtasks[0].id, date: day, at: at(day) }, day, at(day))
    expect(derive(marked, day).goalCurrent['income-tiers']).toBe(1)
    expect(derive(marked, day).xp).toBeGreaterThan(0)
    const cleared = commit(marked, { type: 'toggle-subtask', goalId: 'income-tiers', subtaskId: goal.subtasks[0].id, date: day, at: at(day) }, day, at(day))
    expect(derive(cleared, day).goalCurrent['income-tiers']).toBe(0)
    expect(derive(cleared, day).xp).toBe(0)
  })

  it('pays bonus XP for an ad hoc task and removes it on undo', () => {
    const start = createSave()
    const done = commit(start, { type: 'toggle-adhoc', taskId: 'task-1', title: 'Call the bank', date: day, at: at(day), done: true }, day, at(day))
    expect(derive(done, day).xp).toBe(15)
    const undone = commit(done, { type: 'toggle-adhoc', taskId: 'task-1', title: 'Call the bank', date: day, at: at(day), done: false }, day, at(day))
    expect(derive(undone, day).xp).toBe(0)
  })

  it('grades a day from 0 to 100 in tens', () => {
    expect(gradeDay(10, 10)).toEqual({ score: 100, grade: 'Perfect' })
    expect(gradeDay(9, 10)).toEqual({ score: 90, grade: 'Excellent' })
    expect(gradeDay(8, 10)).toEqual({ score: 80, grade: 'Good' })
    expect(gradeDay(0, 10)).toEqual({ score: 0, grade: 'Missed' })
  })

  it('lists the next unfinished steps in campaign order', () => {
    const agenda = nextAgenda([], {}, 7)
    expect(agenda).toHaveLength(7)
    expect(agenda[0].goalId).toBe('establish-pos')
  })

  it('gives every quest at least one step', () => {
    for (const goal of GOALS) expect(goal.subtasks.length).toBeGreaterThan(0)
  })

  it('refuses to undo a previous day', () => {
    let save = createSave()
    save.startedAt = day
    save = commit(save, { type: 'complete-contract', contractId: 'body', date: day, at: at(day) }, day, at(day))
    const next = commit(save, { type: 'uncomplete-contract', contractId: 'body', date: day, today: addDays(day, 1) }, addDays(day, 1), at(day))
    expect(next).toBe(save)
  })

  it('maps campaign weeks and keeps the last five days in month 12', () => {
    expect(weekOf('2026-09-24', 1)).toMatchObject({ week: 1, start: '2026-09-24', end: '2026-09-30' })
    expect(weekOf('2026-09-24', 8).week).toBe(2)
    expect(monthOf('2026-09-24', 365)).toMatchObject({ month: 12, endDay: 365 })
  })

  it('uses daily grades for period sync and contracts when none were submitted', () => {
    expect(periodSync([{ id: 'a', date: '2026-09-24', reflection: '', tasksCompleted: 10, tasksExpected: 10, score: 80, grade: 'Good', createdAt: '' }, { id: 'b', date: '2026-09-25', reflection: '', tasksCompleted: 5, tasksExpected: 10, score: 40, grade: 'Behind', createdAt: '' }], '2026-09-24', '2026-09-30', 0, 7)).toBe(60)
    expect(periodSync([], '2026-09-24', '2026-09-30', 3, 7)).toBeCloseTo((3 / 21) * 100)
  })

  it('drops a paused goal from the agenda and sync average without taking back xp', () => {
    let save = createSave()
    save.startedAt = day
    const goal = GOALS.find((item) => item.id === 'establish-pos')!
    save = commit(save, { type: 'toggle-subtask', goalId: goal.id, subtaskId: goal.subtasks[0].id, date: day, at: at(day) }, day, at(day))
    const before = derive(save, day)
    expect(before.xp).toBeGreaterThan(0)
    const paused = commit(save, { type: 'set-goal-status', goalId: goal.id, state: 'paused', at: at(day), date: day }, day, at(day))
    const after = derive(paused, day)
    expect(after.xp).toBe(before.xp)
    expect(after.sync).not.toBe(before.sync)
    expect(isActive(paused, goal.id)).toBe(false)
    const agenda = nextAgenda(paused.events, after.goalCurrent, 7, listGoals(paused).filter((item) => isActive(paused, item.id)))
    expect(agenda.some((item) => item.goalId === goal.id)).toBe(false)
    expect(paceSplit(paused, after.goalCurrent, 1).behind.some((item) => item.id === goal.id)).toBe(false)
  })

  it('allocates cents from basis points and keeps the default budget at 100%', () => {
    expect(basisTotal(defaultTemplate())).toBe(10000)
    expect(allocate(300000, 2827)).toBe(84810)
    expect(allocate(300000, 1000)).toBe(30000)
  })

  it('keeps an August budget snapshot when September rates change', () => {
    let finance = addEntry(emptyFinance(), { id: 'aug', type: 'income', amountCents: 100000, date: '2026-08-02', note: '' })
    finance = addEntry(finance, { id: 'sep', type: 'income', amountCents: 200000, date: '2026-09-02', note: '' })
    const august = { ...finance.months['2026-08'] }
    finance = { ...finance, template: { ...finance.template, rent: 2000 }, months: { ...finance.months, '2026-09': { ...finance.template, rent: 2000 } } }
    expect(finance.months['2026-08']).toEqual(august)
    expect(monthIncome(finance, '2026-08')).toBe(100000)
    expect(monthIncome(finance, '2026-09')).toBe(200000)
  })

  it('reduces only the spent category and the debt balance', () => {
    let save = createSave()
    save = commit(save, { type: 'add-ledger', at: at(day), entry: { id: 'in', type: 'income', amountCents: 300000, date: day, note: '' } }, day, at(day))
    save = commit(save, { type: 'add-ledger', at: at(day), entry: { id: 'rent', type: 'expense', amountCents: 70000, date: day, note: '', categoryId: 'rent' } }, day, at(day))
    expect(categorySpent(save.finance, '2026-01', 'rent')).toBe(70000)
    expect(categorySpent(save.finance, '2026-01', 'gas')).toBe(0)
    save = commit(save, { type: 'add-debt', at: at(day), date: day, debt: { id: 'card', name: 'Card', balanceCents: 250000, minimumCents: 7500, order: 0 } }, day, at(day))
    save = commit(save, { type: 'pay-debt', debtId: 'card', amountCents: 5000, date: day, at: at(day) }, day, at(day))
    expect(debtBalance(save.finance.debts[0], save.finance.debtPayments)).toBe(245000)
    save = commit(save, { type: 'set-emergency', amountCents: 100000, essentialCents: 200000, targetMonths: 3, at: at(day), date: day }, day, at(day))
    expect(babyStatus(save.finance).step1).toBe(true)
    expect(save.events.some((event) => event.type === 'baby-step' && event.xp === 100)).toBe(true)
  })
})
