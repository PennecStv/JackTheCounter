import { Fragment, useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { PlayingCard, Suit } from '@/components/PlayingCard'
import { Swirl } from '@/components/Swirl'
import { ANTE_COLORS, LEVELS, SPEEDS, SYSTEMS, signed, valueGroups, valueTone, type SystemId } from '@/game'
import { Bible, Charts, Rules } from '@/Guides'
import { Play } from '@/Play'
import { unlockAudio } from '@/sound'

type Progress = { stars: number[]; best: number[] }
type Settings = { system: SystemId; speed: number; sound: boolean }
const KEY = 'jack-the-counter'
const SYSTEM_IDS = Object.keys(SYSTEMS) as SystemId[]

// Each count system has its own ladder of antes.
function load(system: SystemId): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(`${KEY}/progress/${system}`) ?? '')
    if (Array.isArray(p.stars) && Array.isArray(p.best)) return p
  } catch {
    // first visit or an unreadable save: start fresh
  }
  return { stars: LEVELS.map(() => 0), best: LEVELS.map(() => 0) }
}

function loadSettings(): Settings {
  try {
    const s = JSON.parse(localStorage.getItem(`${KEY}/settings`) ?? '')
    return {
      system: Object.hasOwn(SYSTEMS, s.system) ? s.system : 'hilo',
      speed: SPEEDS.some((x) => x.factor === s.speed) ? s.speed : 1,
      sound: s.sound !== false,
    }
  } catch {
    return { system: 'hilo', speed: 1, sound: true }
  }
}

const NOTES: Record<SystemId, string> = {
  hilo: 'Add each card’s value as it hits the table: that total is the running count. From ante 2, divide it by the decks left in the shoe to get the true count.',
  ko: 'Hi-Lo with sevens at +1, so a full deck adds up to +4. That imbalance replaces the true count: every check asks for the running count only, starting from 0.',
  omega: 'A level-two count: fours to sixes are worth +2, tens −2 and aces 0. From ante 2, divide the running count by the decks left to get the true count.',
}

// Guide pages live at #rules, #charts and #bible so the phone's back button returns to the menu.
const GUIDES: Record<string, { label: string; title: string; color: string; Page: () => ReactNode }> = {
  '#rules': { label: 'Rules', title: 'Blackjack rules', color: '#4bc292', Page: Rules },
  '#charts': { label: 'Charts', title: 'Strategy charts', color: '#009dff', Page: Charts },
  '#bible': { label: 'Bible', title: 'The counter’s bible', color: '#fda200', Page: Bible },
}
const onHashChange = (cb: () => void) => {
  addEventListener('hashchange', cb)
  return () => removeEventListener('hashchange', cb)
}

const TITLE = 'Jack the Counter'

export default function App() {
  const [settings, setSettings] = useState(loadSettings)
  const [progress, setProgress] = useState(() => load(settings.system))
  const [level, setLevel] = useState<number | null>(null)
  const [run, setRun] = useState(0)
  const hash = useSyncExternalStore(onHashChange, () => location.hash)
  const unlocked = (i: number) => i === 0 || progress.stars[i - 1] > 0

  useEffect(() => {
    scrollTo(0, 0)
  }, [hash, level])

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch }
    localStorage.setItem(`${KEY}/settings`, JSON.stringify(next))
    setSettings(next)
    if (patch.system) setProgress(load(patch.system))
  }

  function saveWin(i: number, stars: number, score: number) {
    setProgress((p) => {
      const next = {
        stars: p.stars.map((s, j) => (j === i ? Math.max(s, stars) : s)),
        best: p.best.map((b, j) => (j === i ? Math.max(b, score) : b)),
      }
      localStorage.setItem(`${KEY}/progress/${settings.system}`, JSON.stringify(next))
      return next
    })
  }

  const start = (i: number) => {
    if (settings.sound) unlockAudio()
    setLevel(i)
    setRun((r) => r + 1)
  }

  if (level !== null)
    return (
      <>
        <Swirl colors={[ANTE_COLORS[level], '#1e2a2c', '#4f6367']} />
        <Play
          key={run}
          level={level}
          {...settings}
          onWin={(stars, score) => saveWin(level, stars, score)}
          onExit={() => setLevel(null)}
          onRetry={() => start(level)}
          onNext={level < LEVELS.length - 1 ? () => start(level + 1) : undefined}
        />
      </>
    )

  const guide = GUIDES[hash]
  if (guide)
    return (
      <>
        <Swirl colors={[guide.color, '#1e2a2c', '#4f6367']} />
        <div className="guide" style={{ '--accent': guide.color } as CSSProperties}>
          <header className="guide-head">
            <h1>{guide.title}</h1>
            <a className="btn bg-mult" href="#">
              Menu
            </a>
          </header>
          <guide.Page />
          <a className="btn bg-mult justify-self-start" href="#">
            Back to menu
          </a>
        </div>
      </>
    )

  const system = SYSTEMS[settings.system]
  return (
    <>
      <Swirl colors={['#fe5f55', '#1e2a2c', '#009dff']} />
      <div className="menu">
        <header className="menu-intro">
          <h1 className="wordmark" aria-label={TITLE}>
            {TITLE.split(' ').map((word, w) => (
              <Fragment key={w}>
                <span className="whitespace-nowrap" aria-hidden>
                  {[...word].map((ch, i) => (
                    <span key={i} style={{ '--i': w * 5 + i } as CSSProperties}>
                      {ch}
                    </span>
                  ))}
                </span>{' '}
              </Fragment>
            ))}
          </h1>
          <p className="text-3xl leading-tight">Learn to count cards at blackjack, one shoe at a time.</p>

          <nav className="menu-nav" aria-label="Guides">
            {Object.entries(GUIDES).map(([href, g]) => (
              <a key={href} className="btn" href={href} style={{ background: g.color }} aria-label={g.title}>
                {g.label}
              </a>
            ))}
          </nav>

          <section className="panel rules" aria-labelledby="rules-title">
            <div className="rules-head">
              <h2 id="rules-title" className="text-4xl leading-none">
                The {system.name} count
              </h2>
              <Choice label="Count" options={SYSTEM_IDS.map((id) => [id, SYSTEMS[id].name])} value={settings.system} onChange={(id) => update({ system: id })} />
            </div>
            <div className="rules-rows">
              {valueGroups(settings.system).map(({ value, ranks }) => (
                <RuleRow key={value} ranks={ranks} value={signed(value)} tone={valueTone(value)} />
              ))}
            </div>
            <p className="text-2xl leading-snug">{NOTES[settings.system]} Three wrong answers end the run.</p>
          </section>
        </header>

        <section className="panel antes" aria-labelledby="antes-title">
          <h2 id="antes-title" className="text-4xl leading-none">
            Eight antes, one more deck each
          </h2>
          <div className="settings">
            <Choice label="Speed" options={SPEEDS.map((s) => [s.factor, s.label])} value={settings.speed} onChange={(speed) => update({ speed })} />
            <button className={settings.sound ? 'btn bg-green' : 'btn bg-panel-2'} aria-pressed={settings.sound} onClick={() => update({ sound: !settings.sound })}>
              Sound {settings.sound ? 'on' : 'off'}
            </button>
          </div>
          <ol className="ante-list">
            {LEVELS.map(({ decks, dealMs }, i) => (
              <li key={i} className="ante" style={{ '--ante': ANTE_COLORS[i] } as CSSProperties} data-locked={!unlocked(i) || undefined}>
                <div className="ante-stack" aria-hidden>
                  {Array.from({ length: decks }, (_, d) => (
                    <span key={d} className="card-back" style={{ '--d': d } as CSSProperties} />
                  ))}
                </div>
                <div className="ante-info">
                  <h3 className="text-4xl leading-none">Ante {i + 1}</h3>
                  <p className="text-xl text-white/75">
                    {decks} {decks === 1 ? 'deck' : 'decks'}, one card every {((dealMs * settings.speed) / 1000).toFixed(2)}s
                  </p>
                  {progress.best[i] > 0 && <p className="text-xl text-gold">Best {progress.best[i].toLocaleString('en-US')}</p>}
                </div>
                <div className="ante-stars" aria-label={`${progress.stars[i]} of 3 stars`}>
                  {[0, 1, 2].map((s) => (
                    <Suit key={s} suit={3} className={s < progress.stars[i] ? 'star' : 'star star-off'} />
                  ))}
                </div>
                {unlocked(i) ? (
                  <button className="btn bg-chips" onClick={() => start(i)} aria-label={`Play ante ${i + 1}`}>
                    Play
                  </button>
                ) : (
                  <p className="ante-lock">Clear ante {i} first</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}

function Choice<T>({ label, options, value, onChange }: { label: string; options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="choice" role="group" aria-label={label}>
      <span className="choice-label" aria-hidden>
        {label}
      </span>
      {options.map(([v, text]) => (
        <button key={text} className={v === value ? 'btn bg-chips' : 'btn bg-panel-2'} aria-pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  )
}

function RuleRow({ ranks, value, tone }: { ranks: number[]; value: string; tone: string }) {
  return (
    <div className="rule-row">
      <div className="rule-cards">
        {ranks.map((rank, i) => (
          <PlayingCard key={rank} card={{ rank, suit: i % 4 }} animate={false} />
        ))}
      </div>
      <span className={`box ${tone}`}>{value}</span>
    </div>
  )
}
