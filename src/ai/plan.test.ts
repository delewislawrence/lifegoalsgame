import { parseGoalPlan } from './plan'

const plan = {
  sequences: {
    awakening: { milestone: 'Wake', focus: 'Body' },
    apprentice: { milestone: 'Learn', focus: 'Mind' },
    assassin: { milestone: 'Cut', focus: 'Focus' },
    master: { milestone: 'Keep', focus: 'Craft' },
  },
  initial_contracts: {
    body: ['1', '2', '3', '4', '5', '6', '7'],
    mind: ['1', '2', '3', '4', '5', '6', '7'],
    inner_temple: ['1', '2', '3', '4', '5', '6', '7'],
  },
}

describe('goal plan', () => {
  it('accepts the required shape', () => {
    expect(parseGoalPlan(JSON.stringify(plan))?.sequences.master.milestone).toBe('Keep')
  })

  it('rejects a contract that is short a step', () => {
    const broken = structuredClone(plan)
    broken.initial_contracts.body = ['1', '2', '3', '4', '5', '6']
    expect(parseGoalPlan(JSON.stringify(broken))).toBeNull()
  })

  it('rejects prose around an incomplete object', () => {
    expect(parseGoalPlan('Here is a plan: {"sequences":{}}')).toBeNull()
  })
})
