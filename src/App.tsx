import { Fragment, useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { PlayingCard, Suit } from '@/components/PlayingCard'
import { Swirl } from '@/components/Swirl'
import { ANTE_COLORS, LEVELS, SPEEDS, SYSTEMS, signed, valueGroups, valueTone, type SystemId } from '@/game'
import { Bible, Charts, Rules } from '@/Guides'
import { LANGS, LangContext, STRINGS, browserLang, type Lang } from '@/i18n'
import { Play } from '@/Play'
import { unlockAudio } from '@/sound'

type Progress = { stars: number[]; best: number[] }
type Settings = { system: SystemId; speed: number; sound: boolean; lang: Lang }
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
      speed: SPEEDS.includes(s.speed) ? s.speed : 1,
      sound: s.sound !== false,
      lang: Object.hasOwn(STRINGS, s.lang) ? s.lang : browserLang(),
    }
  } catch {
    return { system: 'hilo', speed: 1, sound: true, lang: browserLang() }
  }
}

// Guide pages live at #rules, #charts and #bible so the phone's back button returns to the menu.
const GUIDES = {
  rules: { color: '#4bc292', Page: Rules },
  charts: { color: '#009dff', Page: Charts },
  bible: { color: '#fda200', Page: Bible },
}
type GuideId = keyof typeof GUIDES
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
  const hash = useSyncExternalStore(onHashChange, () => location.hash.slice(1))
  const t = STRINGS[settings.lang]
  // The staging build (npm run staging) opens every ante so testers can see them all.
  const unlocked = (i: number) => import.meta.env.MODE === 'staging' || i === 0 || progress.stars[i - 1] > 0

  useEffect(() => {
    scrollTo(0, 0)
  }, [hash, level])
  useEffect(() => {
    document.documentElement.lang = settings.lang
  }, [settings.lang])

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

  const wrap = (screen: ReactNode) => <LangContext value={t}>{screen}</LangContext>

  if (level !== null)
    return wrap(
      <>
        <Swirl colors={[ANTE_COLORS[level], '#1e2a2c', '#4f6367']} />
        <Play
          key={run}
          level={level}
          {...settings}
          onSpeed={(speed) => update({ speed })}
          onWin={(stars, score) => saveWin(level, stars, score)}
          onExit={() => setLevel(null)}
          onRetry={() => start(level)}
          onNext={level < LEVELS.length - 1 ? () => start(level + 1) : undefined}
        />
      </>,
    )

  if (Object.hasOwn(GUIDES, hash)) {
    const guide = GUIDES[hash as GuideId]
    return wrap(
      <>
        <Swirl colors={[guide.color, '#1e2a2c', '#4f6367']} />
        <div className="guide" style={{ '--accent': guide.color } as CSSProperties}>
          <header className="guide-head">
            <h1>{t.guides[hash as GuideId].title}</h1>
            <a className="btn bg-mult" href="#">
              {t.menu}
            </a>
          </header>
          <guide.Page />
          <a className="btn bg-mult justify-self-start" href="#">
            {t.backToMenu}
          </a>
        </div>
      </>,
    )
  }

  const system = SYSTEMS[settings.system]
  return wrap(
    <>
      <Swirl colors={['#fe5f55', '#1e2a2c', '#009dff']} />
      <div className="menu">
        <div className="menu-lang">
          <Choice label={t.language} options={LANGS} value={settings.lang} onChange={(lang) => update({ lang })} />
        </div>
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
          <p className="text-3xl leading-tight">{t.tagline}</p>

          <nav className="menu-nav" aria-label={t.guidesNav}>
            {(Object.keys(GUIDES) as GuideId[]).map((id) => (
              <a key={id} className="btn" href={`#${id}`} style={{ background: GUIDES[id].color }} aria-label={t.guides[id].title}>
                {t.guides[id].label}
              </a>
            ))}
          </nav>

          <section className="panel rules" aria-labelledby="rules-title">
            <div className="rules-head">
              <h2 id="rules-title" className="text-4xl leading-none">
                {t.countTitle(system.name)}
              </h2>
              <Choice label={t.count} options={SYSTEM_IDS.map((id) => [id, SYSTEMS[id].name])} value={settings.system} onChange={(id) => update({ system: id })} />
            </div>
            <div className="rules-rows">
              {valueGroups(settings.system).map(({ value, ranks }) => (
                <RuleRow key={value} ranks={ranks} value={signed(value)} tone={valueTone(value)} />
              ))}
            </div>
            <p className="text-2xl leading-snug">
              {t.systemNotes[settings.system]} {t.threeWrong}
            </p>
          </section>
        </header>

        <section className="panel antes" aria-labelledby="antes-title">
          <h2 id="antes-title" className="text-4xl leading-none">
            {t.antesTitle}
          </h2>
          <div className="settings">
            <Choice label={t.speed} options={SPEEDS.map((x) => [x, `×${t.num(x)}`])} value={settings.speed} onChange={(speed) => update({ speed })} />
            <button className={settings.sound ? 'btn bg-green' : 'btn bg-panel-2'} aria-pressed={settings.sound} onClick={() => update({ sound: !settings.sound })}>
              {t.sound(settings.sound)}
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
                  <h3 className="text-4xl leading-none">{t.ante(i + 1)}</h3>
                  <p className="text-xl text-white/75">
                    {t.deckCount(decks)}, {t.pace(t.num(dealMs / settings.speed / 1000, 2))}
                  </p>
                  {progress.best[i] > 0 && <p className="text-xl text-gold">{t.best(t.num(progress.best[i]))}</p>}
                </div>
                <div className="ante-stars" aria-label={t.starsOf(progress.stars[i])}>
                  {[0, 1, 2].map((s) => (
                    <Suit key={s} suit={3} className={s < progress.stars[i] ? 'star' : 'star star-off'} />
                  ))}
                </div>
                {unlocked(i) ? (
                  <button className="btn bg-chips" onClick={() => start(i)} aria-label={t.playAnte(i + 1)}>
                    {t.play}
                  </button>
                ) : (
                  <p className="ante-lock">{t.clearFirst(i)}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>,
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
