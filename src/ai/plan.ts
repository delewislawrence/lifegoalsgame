const SEQUENCES = ['awakening', 'apprentice', 'assassin', 'master'] as const
const CONTRACTS = ['body', 'mind', 'inner_temple'] as const

export interface SequencePlan {
  milestone: string
  focus: string
}

export interface GoalPlan {
  sequences: Record<(typeof SEQUENCES)[number], SequencePlan>
  initial_contracts: Record<(typeof CONTRACTS)[number], string[]>
}

export function parseGoalPlan(raw: string): GoalPlan | null {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  let data: unknown
  try {
    data = JSON.parse(raw.slice(start, end + 1))
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null
  const record = data as { sequences?: unknown; initial_contracts?: unknown }
  if (!record.sequences || typeof record.sequences !== 'object' || !record.initial_contracts || typeof record.initial_contracts !== 'object') {
    return null
  }
  const sequences = {} as GoalPlan['sequences']
  for (const id of SEQUENCES) {
    const item = (record.sequences as Record<string, unknown>)[id]
    if (!item || typeof item !== 'object') return null
    const milestone = (item as { milestone?: unknown }).milestone
    const focus = (item as { focus?: unknown }).focus
    if (typeof milestone !== 'string' || !milestone.trim() || typeof focus !== 'string' || !focus.trim()) return null
    sequences[id] = { milestone: milestone.trim(), focus: focus.trim() }
  }
  const initial_contracts = {} as GoalPlan['initial_contracts']
  for (const id of CONTRACTS) {
    const steps = (record.initial_contracts as Record<string, unknown>)[id]
    if (!Array.isArray(steps) || steps.length !== 7) return null
    if (steps.some((step) => typeof step !== 'string' || !step.trim())) return null
    initial_contracts[id] = steps.map((step) => step.trim())
  }
  return { sequences, initial_contracts }
}

export function systemPrompt(themeName: string): string {
  return [
    `You plan a year-long personal campaign. The active theme is ${themeName}. Match that tone in the wording.`,
    'Reply with JSON only. No markdown, no commentary.',
    'Use exactly these keys:',
    '{"sequences":{"awakening":{"milestone":"string","focus":"string"},"apprentice":{"milestone":"string","focus":"string"},"assassin":{"milestone":"string","focus":"string"},"master":{"milestone":"string","focus":"string"}},"initial_contracts":{"body":["seven strings"],"mind":["seven strings"],"inner_temple":["seven strings"]}}',
    'Each contract array must contain exactly seven short steps.',
  ].join('\n')
}
