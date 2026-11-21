import { useEffect, useReducer, useState, type CSSProperties } from 'react'
import { Confetti } from '@/components/ui/confetti'
import { NumberTicker } from '@/components/ui/number-ticker'
import { PlayingCard, Suit } from '@/components/PlayingCard'
import { ANTE_COLORS, DEALER, LEVELS, LIVES, RANKS, SYSTEMS, countValue, planLevel, points, signed, trueCount, trueCountOk, valueGroups, valueTone, type SystemId } from '@/game'
import { sfx } from '@/sound'

type Kind = 'rc' | 'tc'
type State = {
  round: number
  shown: number // cards of the current round already on the table
  swept: boolean // the round's cards are flying to the discard tray
  phase: 'deal' | 'ask' | 'won' | 'lost'
  kind: Kind
  feedback: { ok: boolean; gained: number; text: string } | null
  lives: number
  score: number
  streak: number
  paused: boolean
}
type Action = { type: 'tick' } | { type: 'answer'; value: number } | { type: 'next' } | { type: 'pause'; paused: boolean }

type Props = { level: number; system: SystemId; speed: number; sound: boolean; onWin: (stars: number, score: number) => void; onExit: () => void; onRetry: () => void; onNext?: () => void }

const SWEEP_MS = 450

export function Play({ level, system, speed, sound, onWin, onExit, onRetry, onNext }: Props) {
  const { decks } = LEVELS[level]
  const dealMs = LEVELS[level].dealMs * speed
  const askTrue = LEVELS[level].trueCount && SYSTEMS[system].balanced
  const [plan] = useState(() => planLevel(decks))
  const [s, dispatch] = useReducer(reduce, {
    round: 0, shown: 0, swept: false, phase: 'deal', kind: 'rc', feedback: null, lives: LIVES, score: 0, streak: 0, paused: false,
  })

  // Cards dealt and running count so far, from the rounds already swept plus the current table.
  function countAt(round: number, shown: number) {
    const deals = plan.rounds.slice(0, round).flat().concat(plan.rounds[round]?.slice(0, shown) ?? [])
    return { dealt: deals.length, rc: deals.reduce((sum, d) => sum + countValue(system, d.card), 0) }
  }
  const { dealt, rc } = countAt(s.round, s.shown)

  function reduce(s: State, a: Action): State {
    if (a.type === 'pause') return { ...s, paused: a.paused }
    if (a.type === 'tick') {
      if (s.shown < plan.rounds[s.round].length) return { ...s, shown: s.shown + 1 }
      if (!s.swept) return { ...s, swept: true }
      return { ...s, round: s.round + 1, shown: 0, swept: false, phase: plan.checks.has(s.round) ? 'ask' : 'deal', kind: 'rc' }
    }
    if (a.type === 'answer') {
      const { dealt, rc } = countAt(s.round, s.shown)
      const left = plan.shoeSize - dealt
      const tc = trueCount(rc, left)
      const ok = s.kind === 'rc' ? a.value === rc : trueCountOk(a.value, rc, left)
      const gained = ok ? points(decks, s.kind, s.streak) : 0
      const text =
        s.kind === 'rc'
          ? `The running count is ${signed(rc)}.${ok ? '' : ' Pick up from there.'}`
          : `${signed(rc)} ÷ ${(left / 52).toFixed(2)} decks left = ${tc.toFixed(1)}. Anything from ${Math.ceil(tc - 1)} to ${Math.floor(tc + 1)} counts.`
      return { ...s, score: s.score + gained, streak: ok ? s.streak + 1 : 0, lives: ok ? s.lives : s.lives - 1, feedback: { ok, gained, text } }
    }
    // next
    if (s.lives === 0) return { ...s, phase: 'lost', feedback: null }
    if (s.kind === 'rc' && askTrue) return { ...s, kind: 'tc', feedback: null }
    return { ...s, phase: s.round >= plan.rounds.length ? 'won' : 'deal', feedback: null }
  }

  // The dealing clock: one card per tick, a longer beat before the table is swept.
  useEffect(() => {
    if (s.phase !== 'deal' || s.paused) return
    const roundDone = s.shown >= plan.rounds[s.round].length
    const id = setTimeout(
      () => {
        if (sound && !s.swept) sfx(roundDone ? 'sweep' : 'deal')
        dispatch({ type: 'tick' })
      },
      s.swept ? SWEEP_MS : roundDone ? dealMs * 1.8 : s.shown === 0 ? 500 : dealMs,
    )
    return () => clearTimeout(id)
  }, [s.phase, s.paused, s.round, s.shown, s.swept, dealMs, plan, sound])

  useEffect(() => {
    if (sound && s.feedback) sfx(s.feedback.ok ? 'right' : 'wrong')
  }, [s.feedback, sound])

  useEffect(() => {
    const onHide = () => document.hidden && dispatch({ type: 'pause', paused: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.target instanceof HTMLButtonElement) return // the button's own click handles it
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        dispatch({ type: 'pause', paused: !s.paused })
      }
    }
    document.addEventListener('visibilitychange', onHide)
    if (s.phase === 'deal') addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      removeEventListener('keydown', onKey)
    }
  }, [s.phase, s.paused])

  // runs once when the run is won; lives and score are final by then
  useEffect(() => {
    if (s.phase === 'won') onWin(s.lives, s.score)
    if (sound && (s.phase === 'won' || s.phase === 'lost')) sfx(s.phase)
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [s.phase])

  const table = s.phase === 'deal' ? plan.rounds[s.round].slice(0, s.shown) : []
  const hand = (spot: number) => table.filter((d) => d.spot === spot)
  const discarded = s.swept ? dealt : dealt - table.length
  const color = ANTE_COLORS[level]

  return (
    <div className="play" style={{ '--ante': color } as CSSProperties}>
      <aside className="panel hud">
        <div className="hud-title">
          <h1 className="text-5xl leading-none">Ante {level + 1}</h1>
          <p className="text-2xl text-white/75">
            {SYSTEMS[system].name}, {decks} {decks === 1 ? 'deck' : 'decks'}, round {s.phase === 'deal' ? s.round + 1 : s.round} of {plan.rounds.length}
          </p>
        </div>
        <div className="hud-score" aria-label={`Score ${s.score}, streak multiplier ${Math.min(1 + s.streak, 8)}`}>
          <span className="box bg-chips">
            <NumberTicker value={s.score} startValue={0} className="text-white" />
          </span>
          <span className="text-4xl">×</span>
          <span key={s.streak} className="box bg-mult pop">{Math.min(1 + s.streak, 8)}</span>
        </div>
        <div className="hud-lives" aria-label={`${s.lives} of ${LIVES} lives left`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <Suit key={i} suit={1} className={i < s.lives ? 'life' : 'life life-lost'} />
          ))}
        </div>
        <dl className="hud-rules" aria-label={`${SYSTEMS[system].name} values`}>
          {valueGroups(system).map(({ value, ranks }) => (
            <div key={value}>
              <dt>{ranks.map((r) => RANKS[r - 1]).join(' ')}</dt>
              <dd className={`box ${valueTone(value)}`}>{signed(value)}</dd>
            </div>
          ))}
        </dl>
        <div className="hud-actions">
          {s.phase === 'deal' && (
            <button className="btn bg-orange" onClick={() => dispatch({ type: 'pause', paused: !s.paused })}>
              {s.paused ? 'Resume' : 'Pause'}
            </button>
          )}
          <button className="btn bg-mult" onClick={onExit}>
            Quit
          </button>
        </div>
      </aside>

      <main className="tabletop">
        <div className="tray" role="img" aria-label={`Discard tray, about ${Math.round((discarded / 52) * 2) / 2} decks`}>
          <div className="tray-fill" style={{ height: `${(discarded / plan.shoeSize) * 100}%` }} />
          {Array.from({ length: decks - 1 }, (_, i) => (
            <div key={i} className="tray-mark" style={{ bottom: `${((i + 1) / decks) * 100}%` }} />
          ))}
          <span className="tray-label">Discards</span>
        </div>

        {s.phase === 'deal' && (
          <div className={s.swept ? 'felt swept' : 'felt'}>
            <Spot label="Dealer" deals={hand(DEALER)} />
            <div className="players">
              <Spot label="Hand 1" deals={hand(0)} />
              <Spot label="Hand 2" deals={hand(1)} />
            </div>
            {s.paused && (
              <div className="paused">
                <p className="text-6xl">Paused</p>
                <button className="btn bg-chips" autoFocus onClick={() => dispatch({ type: 'pause', paused: false })}>
                  Resume
                </button>
              </div>
            )}
          </div>
        )}

        {s.phase === 'ask' && (
          <div className={s.feedback && !s.feedback.ok ? 'panel ask shake' : 'panel ask'} aria-live="polite">
            {s.feedback ? (
              <Feedback {...s.feedback} onNext={() => dispatch({ type: 'next' })} />
            ) : (
              <AnswerPad
                key={`${s.round}-${s.kind}`}
                title={s.kind === 'rc' ? 'Running count?' : 'True count?'}
                hint={s.kind === 'rc' ? 'Every card since the shuffle, added up.' : `Running count is ${signed(rc)}. Divide it by the decks left in the shoe.`}
                onSubmit={(value) => dispatch({ type: 'answer', value })}
              />
            )}
          </div>
        )}

        {(s.phase === 'won' || s.phase === 'lost') && (
          <div className="panel ask">
            {s.phase === 'won' && <Confetti className="confetti" globalOptions={{ resize: true, useWorker: false, disableForReducedMotion: true }} options={{ particleCount: 140, spread: 90, colors: ['#009dff', '#fe5f55', '#f3b958', '#4bc292'] }} />}
            <h2>{s.phase === 'won' ? 'Ante cleared' : 'Busted'}</h2>
            <p className="text-2xl text-white/80">
              {s.phase === 'won'
                ? `${s.lives} of ${LIVES} lives left, ${s.score.toLocaleString('en-US')} points.`
                : `The count got away from you after ${countAt(s.round, 0).dealt} cards. Shuffle up and try again.`}
            </p>
            {s.phase === 'won' && (
              <div className="flex gap-2 text-gold" aria-label={`${s.lives} stars`}>
                {Array.from({ length: LIVES }, (_, i) => (
                  <Suit key={i} suit={3} className={i < s.lives ? 'star' : 'star star-off'} />
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {s.phase === 'won' && onNext && (
                <button className="btn bg-green" autoFocus onClick={onNext}>
                  Next ante
                </button>
              )}
              <button className="btn bg-chips" autoFocus={!(s.phase === 'won' && onNext)} onClick={onRetry}>
                {s.phase === 'won' ? 'Play again' : 'Try again'}
              </button>
              <button className="btn bg-panel-2" onClick={onExit}>
                All antes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Spot({ label, deals }: { label: string; deals: { card: { rank: number; suit: number } }[] }) {
  return (
    <div className="spot">
      <div className="hand">
        {deals.map((d, i) => (
          <PlayingCard key={i} card={d.card} tilt={((d.card.rank * 7 + d.card.suit * 3 + i) % 7) - 3} />
        ))}
      </div>
      <span className="spot-label">{label}</span>
    </div>
  )
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', 'del']

function AnswerPad({ title, hint, onSubmit }: { title: string; hint: string; onSubmit: (n: number) => void }) {
  const [entry, setEntry] = useState('')
  const value = entry === '' || entry === '-' ? null : Number(entry)

  const press = (k: string) =>
    setEntry((e) => {
      if (k === 'del') return e.slice(0, -1)
      if (k === '-') return e.startsWith('-') ? e.slice(1) : '-' + e
      const digits = e.replace('-', '')
      if (digits.length >= 3) return e
      return (e.startsWith('-') ? '-' : '') + (digits === '0' ? k : digits + k)
    })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === '-' || e.key === '+') press('-')
      else if (e.key === 'Backspace') press('del')
      else if (e.key === 'Enter' && value !== null && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault() // otherwise the same keypress also clicks the autofocused "Keep dealing" button
        onSubmit(value)
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [value, onSubmit])

  return (
    <>
      <h2>{title}</h2>
      <p className="text-2xl text-white/80">{hint}</p>
      <output className="entry" aria-live="polite">
        {entry === '' ? '?' : entry}
      </output>
      <div className="keypad">
        {KEYS.map((k) => (
          <button key={k} className="btn key bg-panel-2" onMouseDown={(e) => e.preventDefault()} onClick={() => press(k)} aria-label={k === 'del' ? 'Delete' : k === '-' ? 'Toggle minus' : k}>
            {k === 'del' ? '⌫' : k === '-' ? '±' : k}
          </button>
        ))}
      </div>
      <button className="btn bg-chips w-full" disabled={value === null} onClick={() => value !== null && onSubmit(value)}>
        Check {value === null ? '' : signed(value)}
      </button>
    </>
  )
}

function Feedback({ ok, gained, text, onNext }: { ok: boolean; gained: number; text: string; onNext: () => void }) {
  return (
    <>
      <h2 className={ok ? 'text-green' : 'text-mult'}>{ok ? `Correct, +${gained}` : 'Wrong, one life lost'}</h2>
      <p className="text-3xl">{text}</p>
      <button className="btn bg-chips w-full" autoFocus onClick={onNext}>
        Keep dealing
      </button>
    </>
  )
}
