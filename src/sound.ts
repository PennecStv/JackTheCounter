// Chiptune sound effects synthesised with Web Audio: no audio files to load or license.
let ctx: AudioContext | undefined

// Browsers only start audio from a tap or click, so every Play button calls this first.
export function unlockAudio() {
  ctx ??= new AudioContext()
  void ctx.resume()
}

type Note = [freq: number, at: number, dur: number, slideTo?: number]
const SOUNDS = {
  deal: { wave: 'triangle', gain: 0.08, notes: [[900, 0, 0.05, 300]] },
  sweep: { wave: 'triangle', gain: 0.05, notes: [[300, 0, 0.18, 1200]] },
  right: { wave: 'square', gain: 0.035, notes: [[660, 0, 0.08], [990, 0.08, 0.16]] },
  wrong: { wave: 'sawtooth', gain: 0.04, notes: [[220, 0, 0.12], [150, 0.12, 0.25]] },
  won: { wave: 'square', gain: 0.035, notes: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.4]] },
  lost: { wave: 'square', gain: 0.035, notes: [[392, 0, 0.15], [330, 0.15, 0.15], [262, 0.3, 0.45]] },
} satisfies Record<string, { wave: OscillatorType; gain: number; notes: Note[] }>

export type Sfx = keyof typeof SOUNDS

export function sfx(name: Sfx) {
  if (ctx?.state !== 'running') return
  const { wave, gain, notes } = SOUNDS[name]
  for (const [freq, at, dur, slideTo] of notes as Note[]) {
    const t = ctx.currentTime + at
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(freq, t)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
    amp.gain.setValueAtTime(gain, t)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(amp).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur)
  }
}
