import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react'
import { Confetti } from '@/components/ui/confetti'
import { NumberTicker } from '@/components/ui/number-ticker'
import { PlayingCard, Suit } from '@/components/PlayingCard'
import {
  ANTE_COLORS, DEALER, LEVELS, LIVES, RANKS, SPEEDS, SYSTEMS, countValue, planLevel, points, settle, signed, trueCount, trueCountOk, valueGroups, valueTone,
  type Deal, type SystemId,
} from '@/game'
import { useT } from '@/i18n'
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
type Action = { type: 'tick' } | { type: 'skip' } | { type: 'answer'; value: number } | { type: 'next' } | { type: 'pause'; paused: boolean }
type Result = { text: string; tone: 'blackjack' | 'win' | 'push' | 'lose' }

type Props = {
  level: number
  system: SystemId
  speed: number
  sound: boolean
  onSpeed: (speed: number) => void
  onWin: (stars: number, score: number) => void
  onExit: () => void
  onRetry: () => void
  onNext?: () => void
}

const SWEEP_MS = 450
const RESULT_MS = 800 // shortest pause on a finished round, long enough to see who won

export function Play({ level, system, speed, sound, onSpeed, onWin, onExit, onRetry, onNext }: Props) {
  const t = useT()
  const { decks } = LEVELS[level]
  const dealMs = LEVELS[level].dealMs / speed
  const askTrue = LEVELS[level].trueCount && SYSTEMS[system].balanced
  const [plan] = useState(() => planLevel(decks))
  const [recap, setRecap] = useState(false)
  // Declared before useReducer: React runs the reducer while rendering that line, and it counts with this.
  const value = (d: Deal) => countValue(system, d.card)
  const [s, dispatch] = useReducer(reduce, {
    round: 0, shown: 0, swept: false, phase: 'deal', kind: 'rc', feedback: null, lives: LIVES, score: 0, streak: 0, paused: false,
  })

  // Cards dealt and running count so far, from the rounds already swept plus the current table.
  function countAt(round: number, shown: number) {
    const deals = plan.rounds.slice(0, round).flat().concat(plan.rounds[round]?.slice(0, shown) ?? [])
    return { dealt: deals.length, rc: deals.reduce((sum, d) => sum + value(d), 0) }
  }
  const { dealt, rc } = countAt(s.round, s.shown)

  function reduce(s: State, a: Action): State {
    if (a.type === 'pause') return { ...s, paused: a.paused }
    if (a.type === 'tick') {
      if (s.shown < plan.rounds[s.round].length) return { ...s, shown: s.shown + 1 }
      if (!s.swept) return { ...s, swept: true }
      return { ...s, round: s.round + 1, shown: 0, swept: false, phase: plan.checks.has(s.round) ? 'ask' : 'deal', kind: 'rc' }
    }
    // Skip: show the rest of the round at once (every card still counts), or clear a finished round now.
    if (a.type === 'skip') return s.shown < plan.rounds[s.round].length ? { ...s, shown: plan.rounds[s.round].length } : { ...s, swept: true }
    if (a.type === 'answer') {
      const { dealt, rc } = countAt(s.round, s.shown)
      const left = plan.shoeSize - dealt
      const tc = trueCount(rc, left)
      const ok = s.kind === 'rc' ? a.value === rc : trueCountOk(a.value, rc, left)
      const gained = ok ? points(decks, s.kind, s.streak) : 0
      const text =
        s.kind === 'rc'
          ? t.rcIs(signed(rc), ok)
          : t.tcIs(signed(rc), t.num(left / 52, 2), t.num(tc, 1), signed(Math.ceil(tc - 1)), signed(Math.floor(tc + 1)))
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
      s.swept ? SWEEP_MS : roundDone ? Math.max(dealMs * 1.8, RESULT_MS) : s.shown === 0 ? Math.min(500, dealMs) : dealMs,
    )
    return () => clearTimeout(id)
  }, [s.phase, s.paused, s.round, s.shown, s.swept, dealMs, plan, sound])

  useEffect(() => {
    if (sound && s.feedback) sfx(s.feedback.ok ? 'right' : 'wrong')
  }, [s.feedback, sound])

  useEffect(() => {
    const onHide = () => document.hidden && dispatch({ type: 'pause', paused: true })
    const onKey = (e: KeyboardEvent) => {
      if (recap) return // the recap dialog handles its own keys
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
  }, [s.phase, s.paused, recap])

  // runs once when the run ends; lives and score are final by then
  useEffect(() => {
    if (s.phase === 'won') onWin(s.lives, s.score)
    if (sound && (s.phase === 'won' || s.phase === 'lost')) sfx(s.phase)
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [s.phase])

  // The recap would give the answer away while a question is waiting.
  const canRecap = s.round > 0 && !(s.phase === 'ask' && !s.feedback)
  const openRecap = () => {
    if (s.phase === 'deal') dispatch({ type: 'pause', paused: true })
    setRecap(true)
  }

  const table = s.phase === 'deal' ? plan.rounds[s.round].slice(0, s.shown) : []
  const hand = (spot: number) => table.filter((d) => d.spot === spot)
  const roundDone = s.phase === 'deal' && !s.swept && s.shown >= plan.rounds[s.round].length
  const skip = () => {
    if (sound) sfx(roundDone ? 'sweep' : 'deal')
    dispatch({ type: 'skip' })
  }

  // Who won the round, shown once its last card is down.
  const settled = roundDone ? settle(plan.rounds[s.round]) : null
  const result = (spot: number): Result | undefined => {
    if (!settled) return undefined
    if (spot === DEALER) {
      if (settled.dealer === 'win') return { text: t.dealerWins, tone: 'win' }
      return settled.dealer === 'bust' ? { text: t.outcomes.bust, tone: 'lose' } : undefined
    }
    const o = settled.hands[spot]
    return { text: t.outcomes[o], tone: o === 'bust' ? 'lose' : o }
  }
  const discarded = s.swept ? dealt : dealt - table.length
  const mult = Math.min(1 + s.streak, 8)
  const speedAt = SPEEDS.indexOf(speed)

  return (
    <div className="play" style={{ '--ante': ANTE_COLORS[level] } as CSSProperties}>
      <aside className="panel hud">
        <div className="hud-title">
          <h1 className="text-5xl leading-none">{t.ante(level + 1)}</h1>
          <p className="text-2xl text-white/75">
            {SYSTEMS[system].name}, {t.deckCount(decks)}, {t.roundOf(s.phase === 'deal' ? s.round + 1 : s.round, plan.rounds.length)}
          </p>
        </div>
        <div className="hud-speed" role="group" aria-label={t.speed}>
          <button className="btn bg-panel-2" aria-label={t.slower} disabled={speedAt <= 0} onClick={() => onSpeed(SPEEDS[speedAt - 1])}>
            −
          </button>
          <span className="hud-speed-value">×{t.num(speed)}</span>
          <button className="btn bg-panel-2" aria-label={t.faster} disabled={speedAt === SPEEDS.length - 1} onClick={() => onSpeed(SPEEDS[speedAt + 1])}>
            +
          </button>
        </div>
        <div className="hud-score" aria-label={t.scoreLabel(s.score, mult)}>
          <span className="box bg-chips">
            <NumberTicker value={s.score} startValue={0} className="text-white" />
          </span>
          <span className="text-4xl">×</span>
          <span key={s.streak} className="box bg-mult pop">
            {mult}
          </span>
        </div>
        <div className="hud-lives" aria-label={t.livesLeft(s.lives, LIVES)}>
          {Array.from({ length: LIVES }, (_, i) => (
            <Suit key={i} suit={1} className={i < s.lives ? 'life' : 'life life-lost'} />
          ))}
        </div>
        <dl className="hud-rules" aria-label={t.values(SYSTEMS[system].name)}>
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
              {s.paused ? t.resume : t.pause}
            </button>
          )}
          <button className="btn bg-chips" disabled={!canRecap} onClick={openRecap}>
            {t.recap}
          </button>
          <button className="btn bg-mult" onClick={onExit}>
            {t.quit}
          </button>
        </div>
      </aside>

      <main className="tabletop">
        <div className="tray" role="img" aria-label={t.tray(t.num(Math.round((discarded / 52) * 2) / 2))}>
          <div className="tray-fill" style={{ height: `${(discarded / plan.shoeSize) * 100}%` }} />
          {Array.from({ length: decks - 1 }, (_, i) => (
            <div key={i} className="tray-mark" style={{ bottom: `${((i + 1) / decks) * 100}%` }} />
          ))}
          <span className="tray-label">{t.discards}</span>
        </div>

        {s.phase === 'deal' && (
          <div className={s.swept ? 'felt swept' : 'felt'}>
            <Spot label={t.dealer} deals={hand(DEALER)} result={result(DEALER)} />
            <div className="players">
              <Spot label={t.hand(1)} deals={hand(0)} result={result(0)} />
              <Spot label={t.hand(2)} deals={hand(1)} result={result(1)} />
            </div>
            <button className="btn bg-green skip" disabled={s.swept || s.paused} onClick={skip}>
              {t.skip}
            </button>
            {s.paused && (
              <div className="paused">
                <p className="text-6xl">{t.paused}</p>
                <button className="btn bg-chips" autoFocus onClick={() => dispatch({ type: 'pause', paused: false })}>
                  {t.resume}
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
                title={s.kind === 'rc' ? t.askRc : t.askTc}
                hint={s.kind === 'rc' ? t.hintRc : t.hintTc(signed(rc))}
                onSubmit={(value) => dispatch({ type: 'answer', value })}
              />
            )}
          </div>
        )}

        {(s.phase === 'won' || s.phase === 'lost') && (
          <div className="panel ask">
            {s.phase === 'won' && <Confetti className="confetti" globalOptions={{ resize: true, useWorker: false, disableForReducedMotion: true }} options={{ particleCount: 140, spread: 90, colors: ['#009dff', '#fe5f55', '#f3b958', '#4bc292'] }} />}
            <h2>{s.phase === 'won' ? t.won : t.lost}</h2>
            <p className="text-2xl text-white/80">{s.phase === 'won' ? t.wonText(s.lives, LIVES, t.num(s.score)) : t.lostText(countAt(s.round, 0).dealt)}</p>
            {s.phase === 'won' && (
              <div className="flex gap-2 text-gold" aria-label={t.starsWon(s.lives)}>
                {Array.from({ length: LIVES }, (_, i) => (
                  <Suit key={i} suit={3} className={i < s.lives ? 'star' : 'star star-off'} />
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {s.phase === 'won' && onNext && (
                <button className="btn bg-green" autoFocus onClick={onNext}>
                  {t.nextAnte}
                </button>
              )}
              <button className="btn bg-chips" autoFocus={!(s.phase === 'won' && onNext)} onClick={onRetry}>
                {s.phase === 'won' ? t.playAgain : t.tryAgain}
              </button>
              <button className="btn bg-panel-2" onClick={onExit}>
                {t.allAntes}
              </button>
            </div>
          </div>
        )}
      </main>

      {recap && <Recap rounds={plan.rounds.slice(0, s.round)} value={value} onClose={() => setRecap(false)} />}
    </div>
  )
}

function Spot({ label, deals, result }: { label: string; deals: Deal[]; result?: Result }) {
  return (
    <div className={result ? `spot spot-${result.tone}` : 'spot'}>
      {result && <span className={`outcome outcome-${result.tone}`}>{result.text}</span>}
      <div className="hand">
        {deals.map((d, i) => (
          <PlayingCard key={i} card={d.card} tilt={((d.card.rank * 7 + d.card.suit * 3 + i) % 7) - 3} />
        ))}
      </div>
      <span className="spot-label">{label}</span>
    </div>
  )
}

// Every round swept so far, latest first, with each card's value and the count after the round.
function Recap({ rounds, value, onClose }: { rounds: Deal[][]; value: (d: Deal) => number; onClose: () => void }) {
  const t = useT()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal()
  }, [])

  const items = rounds
    .reduce<{ i: number; deals: Deal[]; net: number; running: number }[]>((acc, deals, i) => {
      const net = deals.reduce((sum, d) => sum + value(d), 0)
      return [...acc, { i, deals, net, running: (acc.at(-1)?.running ?? 0) + net }]
    }, [])
    .reverse()

  return (
    <dialog ref={dialog} className="panel recap" onClose={onClose} aria-labelledby="recap-title">
      <div className="recap-head">
        <h2 id="recap-title">{t.recapTitle}</h2>
        <button className="btn bg-mult" autoFocus onClick={() => dialog.current?.close()}>
          {t.close}
        </button>
      </div>
      <ol className="recap-list">
        {items.map(({ i, deals, net, running }) => (
          <li key={i} className="recap-round">
            <div className="recap-round-head">
              <h3>{t.roundN(i + 1)}</h3>
              <p>{t.roundCount(signed(net), signed(running))}</p>
            </div>
            <div className="recap-hands">
              {[DEALER, 0, 1].map((spot) => (
                <div key={spot} className="recap-hand">
                  <span className="recap-spot">{spot === DEALER ? t.dealer : t.hand(spot + 1)}</span>
                  <div className="recap-cards">
                    {deals
                      .filter((d) => d.spot === spot)
                      .map((d, j) => (
                        <div key={j} className="recap-card">
                          <PlayingCard card={d.card} animate={false} />
                          <span className={`recap-value ${valueTone(value(d))}`}>{signed(value(d))}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </dialog>
  )
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', 'del']

function AnswerPad({ title, hint, onSubmit }: { title: string; hint: string; onSubmit: (n: number) => void }) {
  const t = useT()
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
      // A focused button in the panel (Check) handles Enter itself; one left focused in the HUD must not.
      else if (e.key === 'Enter' && value !== null && !(e.target instanceof HTMLElement && e.target.closest('.ask button'))) {
        e.preventDefault() // stops the focused HUD button, and the autofocused "Keep dealing" button, from also firing
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
          <button key={k} className="btn key bg-panel-2" onMouseDown={(e) => e.preventDefault()} onClick={() => press(k)} aria-label={k === 'del' ? t.deleteKey : k === '-' ? t.minusKey : k}>
            {k === 'del' ? '⌫' : k === '-' ? '±' : k}
          </button>
        ))}
      </div>
      <button className="btn bg-chips w-full" disabled={value === null} onClick={() => value !== null && onSubmit(value)}>
        {t.check} {value === null ? '' : signed(value)}
      </button>
    </>
  )
}

function Feedback({ ok, gained, text, onNext }: { ok: boolean; gained: number; text: string; onNext: () => void }) {
  const t = useT()
  return (
    <>
      <h2 className={ok ? 'text-green' : 'text-mult'}>{ok ? t.correct(gained) : t.wrong}</h2>
      <p className="text-3xl">{text}</p>
      <button className="btn bg-chips w-full" autoFocus onClick={onNext}>
        {t.keepDealing}
      </button>
    </>
  )
}
