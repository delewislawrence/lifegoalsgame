import { SEQUENCES } from './catalog'
import { addDays, daysBetween } from './dates'
import type { ReviewKind, ReviewPeriod, ReviewRecord, SequenceId } from './types'

export interface Span {
  startDay: number
  endDay: number
  start: string
  end: string
}

export function campaignDate(startedAt: string, campaignDay: number): string {
  return addDays(startedAt, Math.max(0, campaignDay - 1))
}

export function weekOf(startedAt: string, campaignDay: number): Span & { week: number } {
  const week = Math.max(1, Math.ceil(Math.max(1, campaignDay) / 7))
  const startDay = (week - 1) * 7 + 1
  const endDay = startDay + 6
  return { week, startDay, endDay, start: campaignDate(startedAt, startDay), end: campaignDate(startedAt, endDay) }
}

export function monthOf(startedAt: string, campaignDay: number): Span & { month: number } {
  const day = Math.min(365, Math.max(1, campaignDay))
  const month = Math.min(12, Math.ceil(day / 30))
  const startDay = (month - 1) * 30 + 1
  const endDay = month === 12 ? 365 : month * 30
  return { month, startDay, endDay, start: campaignDate(startedAt, startDay), end: campaignDate(startedAt, endDay) }
}

export function quarterOf(startedAt: string, campaignDay: number): Span & { sequenceId: SequenceId; index: string; name: string } {
  const dayIndex = Math.max(0, Math.min(364, campaignDay - 1))
  let sequence = SEQUENCES[0]
  for (const item of SEQUENCES) {
    if (dayIndex >= item.startDay) sequence = item
  }
  const next = SEQUENCES[SEQUENCES.findIndex((item) => item.id === sequence.id) + 1]
  const startDay = sequence.startDay + 1
  const endDay = next ? next.startDay : 365
  return {
    sequenceId: sequence.id,
    index: sequence.index,
    name: sequence.name,
    startDay,
    endDay,
    start: campaignDate(startedAt, startDay),
    end: campaignDate(startedAt, endDay),
  }
}

export function reviewKey(kind: ReviewKind, period: ReviewPeriod): string {
  if (kind === 'weekly') return `weekly:${period.weekStart}`
  if (kind === 'monthly') return `monthly:${period.month}`
  if (kind === 'quarterly') return `quarterly:${period.sequenceId}`
  return `yearly:${period.campaign ?? 1}`
}

export function findReview(reviews: ReviewRecord[], kind: ReviewKind, period: ReviewPeriod): ReviewRecord | undefined {
  const key = reviewKey(kind, period)
  return reviews.find((review) => reviewKey(review.kind, review.period) === key)
}

export interface DueReview {
  kind: Exclude<ReviewKind, 'yearly'>
  period: ReviewPeriod
  label: string
}

export function dueReview(startedAt: string, today: string, reviews: ReviewRecord[], campaignDay: number): DueReview | null {
  if (campaignDay < 1) return null
  const todayIndex = daysBetween(startedAt, today)
  const candidates: DueReview[] = []
  for (let day = 7; day <= Math.min(365, campaignDay); day += 7) {
    const week = weekOf(startedAt, day)
    if (todayIndex < daysBetween(startedAt, week.end)) continue
    const period = { weekStart: week.start, weekEnd: week.end }
    if (!findReview(reviews, 'weekly', period)) {
      candidates.push({ kind: 'weekly', period, label: `Week ${week.week} is ready to correct` })
    }
  }
  for (let month = 1; month <= 12; month += 1) {
    const span = monthOf(startedAt, (month - 1) * 30 + 1)
    if (campaignDay < span.endDay) continue
    const period = { month, year: 1 }
    if (!findReview(reviews, 'monthly', period)) {
      candidates.push({ kind: 'monthly', period, label: `Month ${month} is ready to recalibrate` })
    }
  }
  for (const sequence of SEQUENCES) {
    const endDay = sequence.id === 'master' ? 365 : SEQUENCES[SEQUENCES.findIndex((item) => item.id === sequence.id) + 1].startDay
    if (campaignDay < endDay) continue
    const period = { sequenceId: sequence.id }
    if (!findReview(reviews, 'quarterly', period)) {
      candidates.push({ kind: 'quarterly', period, label: `Sequence ${sequence.index} is ready to reorient` })
    }
  }
  return candidates[0] ?? null
}
