// Pure game logic: shoe, counting systems, blackjack rounds, scoring. No React here.

export type Card = { rank: number; suit: number } // rank 1 (ace) to 13 (king), suit 0-3
export type Deal = { card: Card; spot: number } // spot 0-1 = player hands, 2 = dealer

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
export const DEALER = 2
export const PENETRATION = 0.75 // the cut card sits 3/4 of the way into the shoe
export const LIVES = 3

export const LEVELS = Array.from({ length: 8 }, (_, i) => ({
  decks: i + 1,
  dealMs: 1000 - i * 60, // 1000ms per card at ante 1, 580ms at ante 8
  trueCount: i > 0, // a single deck is counted without the true-count conversion
}))

// One colour per ante, light green at ante 1 up to the deep red of the last one.
export const ANTE_COLORS = ['#4bc292', '#56a887', '#009dff', '#646eb7', '#8867a5', '#fda200', '#fe5f55', '#b44430']

// Deal speed multipliers: at ×3, ante 8 deals a card every 0.19s.
export const SPEEDS = [0.75, 1, 1.5, 2, 3]

// Value of each rank, ace first as in RANKS. A balanced count adds up to 0 over a deck and is
// converted to a true count; KO adds up to +4 a deck and is played on the running count alone.
export const SYSTEMS = {
  hilo: { name: 'Hi-Lo', values: [-1, 1, 1, 1, 1, 1, 0, 0, 0, -1, -1, -1, -1], balanced: true },
  ko: { name: 'KO', values: [-1, 1, 1, 1, 1, 1, 1, 0, 0, -1, -1, -1, -1], balanced: false },
  omega: { name: 'Omega II', values: [0, 1, 1, 2, 2, 2, 1, 0, -1, -2, -2, -2, -2], balanced: true },
}
export type SystemId = keyof typeof SYSTEMS
export const countValue = (system: SystemId, c: Card) => SYSTEMS[system].values[c.rank - 1]
// Where the running count starts. KO starts at 4 − 4 × decks, as in the KO book, so a full shoe
// ends on +4 (the pivot) and its key counts apply; balanced counts start at 0.
export const startCount = (system: SystemId, decks: number) => (SYSTEMS[system].balanced ? 0 : 4 - 4 * decks)

// Ranks grouped by value, highest value first, ranks in chart order (2 to K, then the ace).
const CHART_ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1]
export function valueGroups(system: SystemId) {
  const value = (rank: number) => SYSTEMS[system].values[rank - 1]
  const values = [...new Set(CHART_ORDER.map(value))].sort((a, b) => b - a)
  return values.map((v) => ({ value: v, ranks: CHART_ORDER.filter((r) => value(r) === v) }))
}
export const valueTone = (v: number) => (v > 0 ? 'bg-chips' : v < 0 ? 'bg-mult' : 'bg-panel-2')

export function makeShoe(decks: number, rand = Math.random): Card[] {
  const shoe: Card[] = []
  for (let d = 0; d < decks; d++) for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) shoe.push({ rank, suit })
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[shoe[i], shoe[j]] = [shoe[j], shoe[i]]
  }
  return shoe
}

export function handTotal(hand: Card[]) {
  const hard = hand.reduce((sum, c) => sum + Math.min(c.rank, 10), 0)
  return hand.some((c) => c.rank === 1) && hard + 10 <= 21 ? hard + 10 : hard
}

// One round dealt in casino order: two players and the dealer get two cards each, then players
// hit below 13 and the dealer hits below 17 (only if a player is still standing).
export function playRound(shoe: Card[], start: number) {
  const deals: Deal[] = []
  const hands: Card[][] = [[], [], []]
  let pos = start
  const hit = (spot: number) => {
    if (pos >= shoe.length) return false
    hands[spot].push(shoe[pos])
    deals.push({ card: shoe[pos++], spot })
    return true
  }
  for (let n = 0; n < 2; n++) for (let spot = 0; spot < 3; spot++) hit(spot)
  for (const spot of [0, 1]) while (handTotal(hands[spot]) < 13 && hit(spot));
  if (handTotal(hands[0]) <= 21 || handTotal(hands[1]) <= 21) while (handTotal(hands[DEALER]) < 17 && hit(DEALER));
  return { deals, next: pos }
}

export type Outcome = 'blackjack' | 'win' | 'push' | 'lose' | 'bust'

// How a fully dealt round ends: each player hand against the dealer, and whether the dealer
// beat at least one hand or busted.
export function settle(deals: Deal[]) {
  const cards = (spot: number) => deals.filter((d) => d.spot === spot).map((d) => d.card)
  const natural = (hand: Card[]) => hand.length === 2 && handTotal(hand) === 21
  const dealer = cards(DEALER)
  const total = handTotal(dealer)
  const hands = [0, 1].map((spot): Outcome => {
    const hand = cards(spot)
    const p = handTotal(hand)
    if (p > 21) return 'bust'
    if (natural(hand)) return natural(dealer) ? 'push' : 'blackjack'
    if (natural(dealer)) return 'lose'
    if (total > 21 || p > total) return 'win'
    return p === total ? 'push' : 'lose'
  })
  const dealerResult: 'win' | 'bust' | null = total > 21 ? 'bust' : hands.some((o) => o === 'lose' || o === 'bust') ? 'win' : null
  return { hands, dealer: dealerResult }
}

// Deals the whole level up front so the UI only replays it. Checkpoints come every few rounds
// (spaced out on bigger shoes) and always after the last round, when the cut card shows.
export function planLevel(decks: number, rand = Math.random) {
  const shoe = makeShoe(decks, rand)
  const cut = Math.floor(shoe.length * PENETRATION)
  const rounds: Deal[][] = []
  for (let pos = 0; pos < cut; ) {
    const round = playRound(shoe, pos)
    rounds.push(round.deals)
    pos = round.next
  }
  const checks = new Set<number>([rounds.length - 1])
  const gap = () => 2 + Math.floor(decks / 3) + Math.floor(rand() * 2)
  for (let i = gap() - 1; i < rounds.length - 1; i += gap()) checks.add(i)
  return { shoeSize: shoe.length, rounds, checks }
}

export const trueCount = (rc: number, cardsLeft: number) => rc / (cardsLeft / 52)
// Decks left are estimated from the discard tray, so any answer within one of the exact value counts.
export const trueCountOk = (answer: number, rc: number, cardsLeft: number) => Math.abs(answer - trueCount(rc, cardsLeft)) <= 1

export const points = (decks: number, kind: 'rc' | 'tc', streak: number) =>
  (kind === 'tc' ? 2 : 1) * (50 + 10 * decks) * Math.min(1 + streak, 8)

export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')
