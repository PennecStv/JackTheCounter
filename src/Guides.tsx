import type { ReactNode } from 'react'
import { PlayingCard } from '@/components/PlayingCard'
import { SYSTEMS, signed, valueTone, type SystemId } from '@/game'
import { COPY } from '@/guideCopy'
import { useT } from '@/i18n'

const useCopy = () => COPY[useT().lang]

type BlockText = { title: string; p?: string; list?: string[]; steps?: string[]; terms?: string[][]; end?: string }

function Block({ title, p, list, steps, terms, end, children }: BlockText & { children?: ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {p && <p>{p}</p>}
      {list && (
        <ul>
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {steps && (
        <ol>
          {steps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )}
      {terms && (
        <dl className="terms">
          {terms.map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
      {end && <p>{end}</p>}
    </section>
  )
}

/* ---------------------------------- rules --------------------------------- */

const EXAMPLES = [
  [[1, 0], [13, 1]],
  [[1, 3], [6, 2]],
  [[10, 2], [7, 1]],
]

export function Rules() {
  const c = useCopy().rules
  return (
    <>
      <p className="guide-lead">{c.lead}</p>
      <Block {...c.values}>
        <div className="examples">
          {EXAMPLES.map((cards, i) => (
            <figure key={i} className="example">
              <div className="rule-cards">
                {cards.map(([rank, suit]) => (
                  <PlayingCard key={`${rank}-${suit}`} card={{ rank, suit }} animate={false} />
                ))}
              </div>
              <figcaption>{c.examples[i]}</figcaption>
            </figure>
          ))}
        </div>
      </Block>
      <Block {...c.round} />
      <Block {...c.options} />
      <Block {...c.dealer} />
      <Block {...c.payouts} />
      <Block {...c.table} />
    </>
  )
}

/* --------------------------------- charts --------------------------------- */

const UP = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']
const MOVES = ['H', 'S', 'D', 'Ds', 'P', 'R'] as const
type Move = (typeof MOVES)[number]

// Your hand, then one move per dealer up card from 2 to ace.
// 4 to 8 decks, dealer stands on soft 17, double after split, late surrender.
type Row = [hand: string, moves: string]
const HARD: Row[] = [
  ['17+', 'S S S S S S S S S S'],
  ['16', 'S S S S S H H R R R'],
  ['15', 'S S S S S H H H R H'],
  ['14', 'S S S S S H H H H H'],
  ['13', 'S S S S S H H H H H'],
  ['12', 'H H S S S H H H H H'],
  ['11', 'D D D D D D D D D H'],
  ['10', 'D D D D D D D D H H'],
  ['9', 'H D D D D H H H H H'],
  ['5–8', 'H H H H H H H H H H'],
]
const SOFT: Row[] = [
  ['A,9', 'S S S S S S S S S S'],
  ['A,8', 'S S S S S S S S S S'],
  ['A,7', 'S Ds Ds Ds Ds S S H H H'],
  ['A,6', 'H D D D D H H H H H'],
  ['A,5', 'H H D D D H H H H H'],
  ['A,4', 'H H D D D H H H H H'],
  ['A,3', 'H H H D D H H H H H'],
  ['A,2', 'H H H D D H H H H H'],
]
const PAIRS: Row[] = [
  ['A,A', 'P P P P P P P P P P'],
  ['10,10', 'S S S S S S S S S S'],
  ['9,9', 'P P P P P S P P S S'],
  ['8,8', 'P P P P P P P P P P'],
  ['7,7', 'P P P P P P H H H H'],
  ['6,6', 'P P P P P H H H H H'],
  ['5,5', 'D D D D D D D D H H'],
  ['4,4', 'H H H P P H H H H H'],
  ['3,3', 'P P P P P P H H H H'],
  ['2,2', 'P P P P P P H H H H'],
]

// Hi-Lo index plays for shoe games. A hit play applies below the index, the others at or above it.
type Index = [hand: string, up: string, play: 'H' | 'S' | 'D' | 'P' | 'R' | 'I', index: number]
const I18: Index[] = [
  ['insurance', 'A', 'I', 3],
  ['16', '10', 'S', 0],
  ['15', '10', 'S', 4],
  ['10,10', '5', 'P', 5],
  ['10,10', '6', 'P', 4],
  ['10', '10', 'D', 4],
  ['12', '3', 'S', 2],
  ['12', '2', 'S', 3],
  ['11', 'A', 'D', 1],
  ['9', '2', 'D', 1],
  ['10', 'A', 'D', 4],
  ['9', '7', 'D', 3],
  ['16', '9', 'S', 5],
  ['13', '2', 'H', -1],
  ['12', '4', 'H', 0],
  ['12', '5', 'H', -2],
  ['12', '6', 'H', -1],
  ['13', '3', 'H', -2],
]
const FAB4: Index[] = [
  ['14', '10', 'R', 3],
  ['15', '10', 'R', 0],
  ['15', '9', 'R', 2],
  ['15', 'A', 'R', 1],
]

function StrategyTable({ rows }: { rows: Row[] }) {
  const c = useCopy()
  return (
    <div className="chart-wrap">
      <table className="chart">
        <thead>
          <tr>
            <td />
            <th colSpan={10} scope="colgroup">
              {c.head.upCard}
            </th>
          </tr>
          <tr>
            <th scope="col">{c.head.you}</th>
            {UP.map((u) => (
              <th key={u} scope="col">
                {u}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([hand, moves]) => (
            <tr key={hand}>
              <th scope="row">{hand}</th>
              {(moves.split(' ') as Move[]).map((m, i) => (
                <td key={i} className={`move-${m}`} aria-label={c.charts.moveNames[m][1]}>
                  {c.charts.moveNames[m][0]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function IndexTable({ rows }: { rows: Index[] }) {
  const c = useCopy()
  return (
    <div className="chart-wrap">
      <table className="chart chart-list">
        <thead>
          <tr>
            <th scope="col">{c.head.you}</th>
            <th scope="col">{c.head.dealer}</th>
            <th scope="col">{c.head.play}</th>
            <th scope="col">{c.head.trueCount}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([hand, up, play, index]) => (
            <tr key={hand + up}>
              <th scope="row">{hand === 'insurance' ? c.head.insurance : hand}</th>
              <td>{up}</td>
              <td className={`move-${play === 'I' ? 'Ds' : play}`}>{c.charts.plays[play]}</td>
              <td>{play === 'H' ? c.below(signed(index)) : c.atLeast(signed(index))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const COUNT_RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
const SYSTEM_IDS = Object.keys(SYSTEMS) as SystemId[]

function CountTable() {
  const c = useCopy()
  return (
    <div className="chart-wrap">
      <table className="chart chart-list">
        <thead>
          <tr>
            <th scope="col">{c.head.card}</th>
            {SYSTEM_IDS.map((id) => (
              <th key={id} scope="col">
                {SYSTEMS[id].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COUNT_RANKS.map((r) => (
            <tr key={r}>
              <th scope="row">{r === 1 ? 'A' : r === 10 ? c.head.tens : r}</th>
              {SYSTEM_IDS.map((id) => {
                const v = SYSTEMS[id].values[r - 1]
                return (
                  <td key={id} className={valueTone(v)}>
                    {signed(v)}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr>
            <th scope="row">{c.head.fullDeck}</th>
            {SYSTEM_IDS.map((id) => (
              <td key={id}>{SYSTEMS[id].balanced ? '0' : '+4'}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function Charts() {
  const c = useCopy().charts
  return (
    <>
      <p className="guide-lead">{c.lead}</p>
      <Block title={c.moves}>
        <ul className="legend">
          {MOVES.map((m) => (
            <li key={m}>
              <span className={`move move-${m}`}>{c.moveNames[m][0]}</span> {c.moveNames[m][1]}
            </li>
          ))}
        </ul>
      </Block>
      <Block title={c.hard}>
        <StrategyTable rows={HARD} />
      </Block>
      <Block {...c.soft}>
        <StrategyTable rows={SOFT} />
      </Block>
      <Block title={c.pairs}>
        <StrategyTable rows={PAIRS} />
      </Block>
      <Block {...c.i18}>
        <IndexTable rows={I18} />
      </Block>
      <Block {...c.fab4}>
        <IndexTable rows={FAB4} />
      </Block>
      <Block {...c.values}>
        <CountTable />
      </Block>
    </>
  )
}

/* ---------------------------------- bible --------------------------------- */

// True count, then the bet in units.
const RAMP = [
  [1, 1],
  [2, 2],
  [3, 4],
  [4, 6],
  [5, 8],
]

export function Bible() {
  const copy = useCopy()
  const c = copy.bible
  return (
    <>
      <p className="guide-lead">{c.lead}</p>
      <Block {...c.why} />
      <Block {...c.edge} />
      <Block {...c.trueCount} />
      <Block {...c.betting}>
        <div className="chart-wrap">
          <table className="chart chart-list">
            <thead>
              <tr>
                <th scope="col">{copy.head.trueCount}</th>
                <th scope="col">{copy.head.bet}</th>
              </tr>
            </thead>
            <tbody>
              {RAMP.map(([tc, units], i) => (
                <tr key={tc}>
                  <th scope="row">{i === 0 ? copy.orLess(signed(tc)) : i === RAMP.length - 1 ? copy.atLeast(signed(tc)) : signed(tc)}</th>
                  <td className="bg-chips">{copy.units(units)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>
      <Block {...c.bankroll} />
      <Block {...c.which} />
      <Block {...c.practise} />
      <Block {...c.welcome} />
    </>
  )
}
