let ctx: AudioContext | null = null

function context(): AudioContext | null {
  const Ctx = window.AudioContext
  if (!Ctx) return null
  if (!ctx) ctx = new Ctx()
  return ctx
}

function tone(frequency: number, start: number, duration: number, audio: AudioContext) {
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.04, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start(start)
  oscillator.stop(start + duration)
}

export function playFeedback(kind: 'tick' | 'memory' | 'achieve', enabled: boolean) {
  if (!enabled) return
  const audio = context()
  if (!audio) return
  const now = audio.currentTime
  if (kind === 'tick') tone(520, now, 0.12, audio)
  if (kind === 'memory') {
    tone(440, now, 0.12, audio)
    tone(660, now + 0.08, 0.16, audio)
  }
  if (kind === 'achieve') tone(784, now, 0.18, audio)
}
