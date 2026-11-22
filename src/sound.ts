// Sound effects. Cards use a recorded sample (src/assets/card.mp3); the jingles are soft
// synthesised tones, so there is nothing else to load.
import cardUrl from '@/assets/card.mp3'

let ctx: AudioContext | undefined
let card: AudioBuffer | undefined

// Browsers only start audio from a tap or click, so every Play button calls this first.
export function unlockAudio() {
  if (!ctx) {
    const c = (ctx = new AudioContext())
    fetch(cardUrl)
      .then((r) => r.arrayBuffer())
      .then((data) => c.decodeAudioData(data))
      .then((buffer) => {
        card = buffer
      })
      .catch(() => {}) // without the sample the cards are dealt silently; nothing else depends on it
  }
  void ctx.resume()
}

// The sample is quiet (peaks near 11%), hence gains above 1.
function playCard(c: AudioContext, at: number, rate: number, vol: number) {
  if (!card) return
  const src = c.createBufferSource()
  src.buffer = card
  src.playbackRate.value = rate
  const gain = c.createGain()
  gain.gain.value = vol
  src.connect(gain).connect(c.destination)
  src.start(c.currentTime + at)
}

// [frequency in Hz, start, duration, slide to]
type Note = [freq: number, at: number, dur: number, slideTo?: number]
const JINGLES: Record<'right' | 'wrong' | 'won' | 'lost', { wave: OscillatorType; vol: number; notes: Note[] }> = {
  right: { wave: 'triangle', vol: 0.25, notes: [[784, 0, 0.09], [1047, 0.07, 0.09], [1319, 0.14, 0.25]] },
  wrong: { wave: 'square', vol: 0.05, notes: [[196, 0, 0.12], [147, 0.12, 0.32, 110]] },
  won: { wave: 'triangle', vol: 0.25, notes: [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.1], [1047, 0.27, 0.12], [1319, 0.38, 0.55]] },
  lost: { wave: 'triangle', vol: 0.25, notes: [[392, 0, 0.16], [349, 0.15, 0.16], [330, 0.3, 0.16], [262, 0.45, 0.65, 196]] },
}

export type Sfx = 'deal' | 'sweep' | keyof typeof JINGLES

export function sfx(name: Sfx) {
  const c = ctx
  if (c?.state !== 'running') return
  // a slightly different pitch on every card so a long shoe does not sound like a loop
  if (name === 'deal') return playCard(c, 0, 0.9 + Math.random() * 0.2, 3)
  // cards gathered into the tray: three quick, rising slides
  if (name === 'sweep') return [0, 0.06, 0.12].forEach((at, i) => playCard(c, at, 1.25 + i * 0.12, 2))

  const { wave, vol, notes } = JINGLES[name]
  for (const [freq, at, dur, slideTo] of notes) {
    const t = c.currentTime + at
    const osc = c.createOscillator()
    const env = c.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(freq, t)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(vol, t + 0.005)
    env.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(env).connect(c.destination)
    osc.start(t)
    osc.stop(t + dur)
  }
}
