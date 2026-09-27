import { SEQUENCES } from '../game/catalog'
import { LEVELS } from '../game/formulas'
import { levelTitle, sequenceName } from './names'

describe('theme names', () => {
  it('keeps the Animus ladder and sequences', () => {
    for (const level of LEVELS) expect(levelTitle('animus', level.level)).toBe(level.title)
    for (const sequence of SEQUENCES) expect(sequenceName('animus', sequence.id)).toBe(sequence.name)
  })

  it('uses a different ladder on the other themes', () => {
    for (const theme of ['cyber', 'zen', 'ash', 'ember'] as const) {
      expect(levelTitle(theme, 1)).not.toBe('Initiate')
      expect(sequenceName(theme, 'awakening')).not.toBe('The Awakening')
    }
  })
})
