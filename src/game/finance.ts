import type { Debt, FinanceState, LedgerEntry } from './types'

export const GROUPS = ['Actual Expenses', 'Personal', 'Financial Future'] as const

export const CATEGORIES: { id: string; name: string; group: (typeof GROUPS)[number]; bp: number }[] = [
  { id: 'rent', name: 'Rent', group: 'Actual Expenses', bp: 2827 },
  { id: 'gas', name: 'Gas', group: 'Actual Expenses', bp: 707 },
  { id: 'groceries', name: 'Groceries', group: 'Actual Expenses', bp: 530 },
  { id: 'health-insurance', name: 'Health Insurance', group: 'Actual Expenses', bp: 265 },
  { id: 'utilities', name: 'Utilities', group: 'Actual Expenses', bp: 212 },
  { id: 'car-maintenance', name: 'Car Maintenance', group: 'Actual Expenses', bp: 141 },
  { id: 'eating-out', name: 'Eating Out', group: 'Actual Expenses', bp: 88 },
  { id: 'internet-phone', name: 'Internet + Phone', group: 'Actual Expenses', bp: 80 },
  { id: 'water', name: 'Water', group: 'Actual Expenses', bp: 58 },
  { id: 'personal-care', name: 'Personal Care', group: 'Actual Expenses', bp: 53 },
  { id: 'household', name: 'Household Supplies', group: 'Actual Expenses', bp: 35 },
  { id: 'car-insurance', name: 'Car Insurance', group: 'Actual Expenses', bp: 4 },
  { id: 'creative', name: 'Creative Projects', group: 'Personal', bp: 1000 },
  { id: 'education', name: 'Education / Skills', group: 'Personal', bp: 800 },
  { id: 'clothing', name: 'Clothing / Personal', group: 'Personal', bp: 500 },
  { id: 'travel', name: 'Travel / Experiences', group: 'Personal', bp: 300 },
  { id: 'lifestyle', name: 'Lifestyle / Fun', group: 'Personal', bp: 200 },
  { id: 'flex', name: 'Misc. / Flex', group: 'Personal', bp: 200 },
  { id: 'emergency-fund', name: 'Emergency Fund', group: 'Financial Future', bp: 800 },
  { id: 'debt-snowball', name: 'Debt Snowball', group: 'Financial Future', bp: 800 },
  { id: 'investing', name: 'Investing', group: 'Financial Future', bp: 300 },
  { id: 'sinking', name: 'Sinking Funds', group: 'Financial Future', bp: 100 },
]

export const STARTER_CENTS = 100_000

export function defaultTemplate(): Record<string, number> {
  return Object.fromEntries(CATEGORIES.map((category) => [category.id, category.bp]))
}

export function emptyFinance(): FinanceState {
  return {
    entries: [],
    template: defaultTemplate(),
    months: {},
    debts: [],
    debtPayments: [],
    emergency: { amountCents: 0, essentialCents: 0, targetMonths: 3 },
    baby: { step1: false, step2: false, step3: false, step2Clear: false },
  }
}

export function basisTotal(template: Record<string, number>): number {
  return CATEGORIES.reduce((sum, category) => sum + (template[category.id] ?? 0), 0)
}

export function allocate(incomeCents: number, basisPoints: number): number {
  return Math.round((incomeCents * basisPoints) / 10000)
}

export function money(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(Math.round(cents))
  return `${sign}$${Math.floor(abs / 100).toLocaleString('en-US')}.${String(abs % 100).padStart(2, '0')}`
}

export function percentLabel(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(2)}%`
}

export function monthKey(date: string): string {
  return date.slice(0, 7)
}

export function withMonthSnapshot(finance: FinanceState, key: string): FinanceState {
  if (finance.months[key]) return finance
  return { ...finance, months: { ...finance.months, [key]: { ...finance.template } } }
}

export function ratesFor(finance: FinanceState, key: string): Record<string, number> {
  return finance.months[key] ?? finance.template
}

export function monthIncome(finance: FinanceState, key: string): number {
  return finance.entries.filter((entry) => entry.type === 'income' && monthKey(entry.date) === key).reduce((sum, entry) => sum + entry.amountCents, 0)
}

export function categorySpent(finance: FinanceState, key: string, categoryId: string): number {
  return finance.entries
    .filter((entry) => entry.type === 'expense' && entry.categoryId === categoryId && monthKey(entry.date) === key)
    .reduce((sum, entry) => sum + entry.amountCents, 0)
}

export function monthSpent(finance: FinanceState, key: string): number {
  return finance.entries.filter((entry) => entry.type === 'expense' && monthKey(entry.date) === key).reduce((sum, entry) => sum + entry.amountCents, 0)
}

export function categoryName(id: string): string {
  return CATEGORIES.find((category) => category.id === id)?.name ?? id
}

export function debtBalance(debt: Debt, payments: FinanceState['debtPayments']): number {
  const paid = payments.filter((payment) => payment.debtId === debt.id).reduce((sum, payment) => sum + payment.amountCents, 0)
  return Math.max(0, debt.balanceCents - paid)
}

export function orderedDebts(finance: FinanceState): Debt[] {
  return [...finance.debts].sort((a, b) => debtBalance(a, finance.debtPayments) - debtBalance(b, finance.debtPayments) || a.order - b.order)
}

export function babyStatus(finance: FinanceState): { step1: boolean; step2: boolean; step3: boolean; current: 1 | 2 | 3 } {
  const step1 = finance.baby.step1 || finance.emergency.amountCents >= STARTER_CENTS
  const balances = finance.debts.map((debt) => debtBalance(debt, finance.debtPayments))
  const step2 = finance.baby.step2 || finance.baby.step2Clear || (finance.debts.length > 0 && balances.every((balance) => balance === 0))
  const target = finance.emergency.essentialCents * finance.emergency.targetMonths
  const step3 = finance.baby.step3 || (target > 0 && finance.emergency.amountCents >= target)
  const current = !step1 ? 1 : !step2 ? 2 : 3
  return { step1, step2, step3, current }
}

export function spanTotals(finance: FinanceState, start: string, end: string) {
  const entries = finance.entries.filter((entry) => entry.date >= start && entry.date <= end)
  const income = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amountCents, 0)
  const expenses = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amountCents, 0)
  const spent = (id: string) => entries.filter((entry) => entry.type === 'expense' && entry.categoryId === id).reduce((sum, entry) => sum + entry.amountCents, 0)
  const future = spent('emergency-fund') + spent('debt-snowball') + spent('investing') + spent('sinking')
  const debtPaid = finance.debtPayments.filter((payment) => payment.date >= start && payment.date <= end).reduce((sum, payment) => sum + payment.amountCents, 0)
  return { income, expenses, remaining: income - expenses, saved: future, debtPaid, invested: spent('investing'), emergency: spent('emergency-fund') }
}

export function parseDollars(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null
  const [whole, fraction = ''] = cleaned.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

export function stampBaby(finance: FinanceState): FinanceState {
  const status = babyStatus(finance)
  return { ...finance, baby: { ...finance.baby, step1: status.step1, step2: status.step2, step3: status.step3 } }
}

export function addEntry(finance: FinanceState, entry: LedgerEntry): FinanceState {
  const key = monthKey(entry.date)
  return stampBaby(withMonthSnapshot({ ...finance, entries: [...finance.entries, entry] }, key))
}
