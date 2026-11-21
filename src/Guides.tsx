import type { ReactNode } from 'react'
import { PlayingCard } from '@/components/PlayingCard'
import { SYSTEMS, signed, valueTone, type SystemId } from '@/game'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Terms({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="terms">
      {items.map(([term, text]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  )
}

function Example({ cards, label }: { cards: [rank: number, suit: number][]; label: string }) {
  return (
    <figure className="example">
      <div className="rule-cards">
        {cards.map(([rank, suit]) => (
          <PlayingCard key={`${rank}-${suit}`} card={{ rank, suit }} animate={false} />
        ))}
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  )
}

/* ---------------------------------- rules --------------------------------- */

export function Rules() {
  return (
    <>
      <p className="guide-lead">
        Beat the dealer by finishing closer to 21 without going over. You only play against the dealer: the other players at the table never change your result.
      </p>

      <Section title="Card values">
        <ul>
          <li>Two to ten are worth their number.</li>
          <li>Jacks, queens and kings are worth 10.</li>
          <li>An ace is worth 11, or 1 when 11 would take you over 21.</li>
        </ul>
        <div className="examples">
          <Example cards={[[1, 0], [13, 1]]} label="Blackjack: 21 in two cards" />
          <Example cards={[[1, 3], [6, 2]]} label="Soft 17: the ace can still drop to 1" />
          <Example cards={[[10, 2], [7, 1]]} label="Hard 17: no ace to fall back on" />
        </div>
      </Section>

      <Section title="How a round goes">
        <ol>
          <li>Everyone bets before the deal.</li>
          <li>Each player and the dealer get two cards. The dealer's first card, the up card, is face up. The second, the hole card, stays face down.</li>
          <li>
            With an ace showing, the dealer offers insurance. With an ace or a ten showing, the dealer checks the hole card. A dealer blackjack ends the round: every hand loses except a player blackjack, which is a push.
          </li>
          <li>Players act one at a time, starting on the dealer's left.</li>
          <li>The dealer turns the hole card over and draws by fixed rules.</li>
          <li>Winning bets are paid, losing bets collected.</li>
        </ol>
      </Section>

      <Section title="Your options">
        <Terms
          items={[
            ['Hit', 'Take another card. Keep hitting until you stand or bust. Signal: tap the table.'],
            ['Stand', 'Keep your total and end your turn. Signal: wave a flat hand over your cards.'],
            ['Double down', 'Double your bet and take exactly one more card. Usually only on your first two cards. Signal: put the extra chips next to your bet.'],
            ['Split', 'Two cards of the same value become two hands, each with its own bet. Split aces usually get one card each. Signal: put the extra chips down and show two fingers.'],
            ['Surrender', 'Give up on your first two cards and get half your bet back. Late surrender comes after the dealer has checked for blackjack. Not every casino offers it, and you say it out loud.'],
            ['Insurance', 'With an ace showing, a side bet of up to half your bet that pays 2 to 1 if the dealer has blackjack. Without a count it loses money; with Hi-Lo, take it at a true count of +3 or more.'],
          ]}
        />
      </Section>

      <Section title="The dealer's rules">
        <p>The dealer makes no choices: they draw on 16 or less and stand on 17 or more. The felt says what happens on a soft 17.</p>
        <ul>
          <li>
            <strong>S17</strong>, dealer stands on all 17s. Better for you.
          </li>
          <li>
            <strong>H17</strong>, dealer hits soft 17. Costs you about 0.2%.
          </li>
        </ul>
      </Section>

      <Section title="Payouts">
        <Terms
          items={[
            ['Win', 'Paid 1 to 1.'],
            ['Blackjack', 'An ace and a ten-value card as your first two cards, paid 3 to 2. After a split it only counts as 21.'],
            ['Push', 'Same total as the dealer: your bet comes back.'],
            ['Bust', 'Over 21 loses at once, even if the dealer busts afterwards. That is the house edge: you act first.'],
            ['Insurance', 'Paid 2 to 1.'],
          ]}
        />
      </Section>

      <Section title="Read the table before you sit">
        <ul>
          <li>Blackjack must pay 3 to 2. Tables paying 6 to 5 add about 1.4% to the house edge: walk past them.</li>
          <li>Dealer stands on soft 17, double after split and surrender all help you.</li>
          <li>Fewer decks are better, and for counting, so is a deep cut card: look for three quarters of the shoe dealt or more.</li>
          <li>A continuous shuffling machine puts the cards back after every round. Counting is useless there.</li>
        </ul>
      </Section>
    </>
  )
}

/* --------------------------------- charts --------------------------------- */

const UP = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A']
const MOVES: Record<string, string> = {
  H: 'Hit',
  S: 'Stand',
  D: 'Double, otherwise hit',
  Ds: 'Double, otherwise stand',
  P: 'Split',
  R: 'Surrender, otherwise hit',
}

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

// Hi-Lo index plays for shoe games: your hand, the dealer's up card, the play, and when.
type Index = [hand: string, up: string, play: string, when: string]
const I18: Index[] = [
  ['Insurance', 'A', 'Take it', '+3 or more'],
  ['16', '10', 'Stand', '0 or more'],
  ['15', '10', 'Stand', '+4 or more'],
  ['10,10', '5', 'Split', '+5 or more'],
  ['10,10', '6', 'Split', '+4 or more'],
  ['10', '10', 'Double', '+4 or more'],
  ['12', '3', 'Stand', '+2 or more'],
  ['12', '2', 'Stand', '+3 or more'],
  ['11', 'A', 'Double', '+1 or more'],
  ['9', '2', 'Double', '+1 or more'],
  ['10', 'A', 'Double', '+4 or more'],
  ['9', '7', 'Double', '+3 or more'],
  ['16', '9', 'Stand', '+5 or more'],
  ['13', '2', 'Hit', 'below −1'],
  ['12', '4', 'Hit', 'below 0'],
  ['12', '5', 'Hit', 'below −2'],
  ['12', '6', 'Hit', 'below −1'],
  ['13', '3', 'Hit', 'below −2'],
]
const PLAY_CODE: Record<string, string> = { Hit: 'H', Stand: 'S', Double: 'D', Split: 'P', Surrender: 'R', 'Take it': 'Ds' }
const FAB4: Index[] = [
  ['14', '10', 'Surrender', '+3 or more'],
  ['15', '10', 'Surrender', '0 or more'],
  ['15', '9', 'Surrender', '+2 or more'],
  ['15', 'A', 'Surrender', '+1 or more'],
]

function StrategyTable({ rows }: { rows: Row[] }) {
  return (
    <div className="chart-wrap">
      <table className="chart">
        <thead>
          <tr>
            <td />
            <th colSpan={10} scope="colgroup">
              Dealer's up card
            </th>
          </tr>
          <tr>
            <th scope="col">You</th>
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
              {moves.split(' ').map((m, i) => (
                <td key={i} className={`move-${m}`} aria-label={MOVES[m]}>
                  {m}
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
  return (
    <div className="chart-wrap">
      <table className="chart chart-list">
        <thead>
          <tr>
            <th scope="col">You</th>
            <th scope="col">Dealer</th>
            <th scope="col">Play</th>
            <th scope="col">True count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([hand, up, play, when]) => (
            <tr key={hand + up}>
              <th scope="row">{hand}</th>
              <td>{up}</td>
              <td className={`move-${PLAY_CODE[play]}`}>{play}</td>
              <td>{when}</td>
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
  return (
    <div className="chart-wrap">
      <table className="chart chart-list">
        <thead>
          <tr>
            <th scope="col">Card</th>
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
              <th scope="row">{r === 1 ? 'A' : r === 10 ? '10 to K' : r}</th>
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
            <th scope="row">Full deck</th>
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
  return (
    <>
      <p className="guide-lead">
        Basic strategy for 4 to 8 decks, dealer stands on soft 17, double after split allowed, late surrender. Learn it before you count: counting only pays when every hand is played right.
      </p>

      <Section title="Moves">
        <ul className="legend">
          {Object.entries(MOVES).map(([code, name]) => (
            <li key={code}>
              <span className={`move move-${code}`}>{code}</span> {name}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Hard totals">
        <StrategyTable rows={HARD} />
      </Section>

      <Section title="Soft totals">
        <p>Hands with an ace still counted as 11.</p>
        <StrategyTable rows={SOFT} />
      </Section>

      <Section title="Pairs">
        <StrategyTable rows={PAIRS} />
      </Section>

      <Section title="The Illustrious 18">
        <p>The eighteen Hi-Lo plays where the true count overrules the chart, most valuable first. When the count is in range, make the play; otherwise follow the chart.</p>
        <IndexTable rows={I18} />
      </Section>

      <Section title="The Fab 4 surrenders">
        <p>Where late surrender is offered, check these before the Illustrious 18.</p>
        <IndexTable rows={FAB4} />
      </Section>

      <Section title="Count values">
        <p>What each card is worth in the three counts you can train here, and what a full deck adds up to.</p>
        <CountTable />
      </Section>
    </>
  )
}

/* ---------------------------------- bible --------------------------------- */

const RAMP = [
  ['+1 or less', 1],
  ['+2', 2],
  ['+3', 4],
  ['+4', 6],
  ['+5 or more', 8],
] as const

export function Bible() {
  return (
    <>
      <p className="guide-lead">
        What a counter needs between the first deck and the first real shoe. Blackjack is still gambling: only ever bet money you can afford to lose.
      </p>

      <Section title="Why counting works">
        <p>A dealt card is gone until the shuffle. When the cards left are rich in tens and aces, the game swings your way:</p>
        <ul>
          <li>Blackjacks come more often, and you are paid 3 to 2 for yours while the dealer's only take 1 to 1.</li>
          <li>Doubles on 10 and 11 catch a ten more often.</li>
          <li>The dealer must draw to 12 through 16, and busts more.</li>
          <li>Insurance turns into a good bet once more than a third of the cards left are tens.</li>
        </ul>
        <p>Small cards left do the opposite. A count tracks the balance between the two, one card at a time.</p>
      </Section>

      <Section title="The edge in numbers">
        <ul>
          <li>Perfect basic strategy on a good table leaves the house about 0.5%.</li>
          <li>Each point of Hi-Lo true count moves roughly 0.5% to your side.</li>
          <li>So the edge turns yours around a true count of +1, and at +5 you are about 2% ahead.</li>
          <li>Most of a shoe is played at a count near zero or below. The profit comes from the few rounds where you bet big.</li>
        </ul>
      </Section>

      <Section title="From running count to true count">
        <p>
          The running count says how many extra high or low cards are left. The true count says how concentrated they are: divide the running count by the decks still in the shoe, which is the decks in play minus the decks in the discard tray.
        </p>
        <Terms
          items={[
            ['Running count +6, 3 decks left', 'True count +2.'],
            ['Running count +6, 1.5 decks left', 'True count +4: the same six cards matter twice as much.'],
            ['Running count −4, 4 decks left', 'True count −1.'],
          ]}
        />
        <p>Judge the tray to the nearest half deck and round down. In this trainer, anything within one of the exact value counts as right.</p>
      </Section>

      <Section title="Betting your edge">
        <p>Bet the minimum while the count is low and raise only when the true count says the edge is yours. A common ramp for shoe games, in betting units:</p>
        <div className="chart-wrap">
          <table className="chart chart-list">
            <thead>
              <tr>
                <th scope="col">True count</th>
                <th scope="col">Bet</th>
              </tr>
            </thead>
            <tbody>
              {RAMP.map(([tc, units]) => (
                <tr key={tc}>
                  <th scope="row">{tc}</th>
                  <td className="bg-chips">
                    {units} {units === 1 ? 'unit' : 'units'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Back-counting, or wonging, goes one step further: count a shoe standing behind the table, sit down when the true count climbs, leave when it drops. Many casinos now forbid joining in the middle of a shoe.
        </p>
      </Section>

      <Section title="Bankroll and swings">
        <p>
          A 1% edge is real, but it is small next to the swings: a single hand varies by more than a whole bet. Losing sessions, even losing weeks, are normal when you play perfectly.
        </p>
        <ul>
          <li>Keep a separate bankroll and never top it up with money you need.</li>
          <li>Counters usually plan on several hundred to a thousand units. With less, an ordinary bad run can wipe you out.</li>
          <li>Size your unit to your bankroll, not to the table minimum. If the minimum is too big a share, find a cheaper table.</li>
        </ul>
      </Section>

      <Section title="Which count?">
        <Terms
          items={[
            ['Hi-Lo', 'Balanced and level one: every card is +1, 0 or −1. The most studied count, and the one the index plays on the Charts page are built for. Start here.'],
            [
              'KO',
              'Hi-Lo with sevens at +1, so a deck adds up to +4 instead of 0, which spares you the true count: you bet on the running count alone. The KO book starts the count at 4 − 4 × decks (−20 for six decks) and gives a key count to bet on; this trainer starts at 0 so you practise the tally itself.',
            ],
            ['Omega II', 'Balanced and level two: fours to sixes are +2, tens −2, aces 0. It plays hands more accurately than Hi-Lo, but it is harder to keep at speed and needs a side count of aces to bet as well.'],
          ]}
        />
      </Section>

      <Section title="How to practise">
        <ol>
          <li>Learn basic strategy until every cell of the charts is automatic.</li>
          <li>Count down a single deck one card at a time, ending on 0 (+4 for KO), in under 30 seconds.</li>
          <li>Count cards in pairs. In Hi-Lo a high card and a low card cancel, so you only add what is left.</li>
          <li>Clear the antes here from one deck to eight, then turn the speed to Fast.</li>
          <li>Learn the index plays a few at a time, starting with insurance and 16 against a 10.</li>
          <li>Practise with noise around you. A casino is loud, and nobody waits for you to finish counting.</li>
        </ol>
      </Section>

      <Section title="Staying welcome">
        <ul>
          <li>Counting in your head is legal in most places, but a casino is private property: it can limit your bets, shuffle early or ask you to leave.</li>
          <li>Using a device to count is a crime in many places, Nevada included.</li>
          <li>Move your bets smoothly, chat, and never stare at the cards. A bet that jumps from one unit to eight right after a run of small cards is the first thing the pit looks for.</li>
        </ul>
      </Section>
    </>
  )
}
