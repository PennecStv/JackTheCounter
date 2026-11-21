import type { CSSProperties } from 'react'
import { RANKS, RANK_NAMES, SUIT_NAMES, type Card } from '@/game'

// 7x7 pixel suits, drawn in code: spades, hearts, clubs, diamonds.
const BITMAPS = [
  ['...#...', '..###..', '.#####.', '#######', '##.#.##', '...#...', '..###..'],
  ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'],
  ['..###..', '..###..', '#######', '#######', '##.#.##', '...#...', '..###..'],
  ['...#...', '..###..', '.#####.', '#######', '.#####.', '..###..', '...#...'],
]
const PATHS = BITMAPS.map((rows) =>
  rows.flatMap((row, y) => [...row].map((px, x) => (px === '#' ? `M${x} ${y}h1v1h-1z` : ''))).join(''),
)
const SUIT_COLORS = ['#403995', '#f03464', '#235955', '#f06b3f']

export function Suit({ suit, className }: { suit: number; className?: string }) {
  return (
    <svg viewBox="0 0 7 7" shapeRendering="crispEdges" className={className} aria-hidden>
      <path d={PATHS[suit]} fill="currentColor" />
    </svg>
  )
}

export function PlayingCard({ card, tilt = 0, animate = true }: { card: Card; tilt?: number; animate?: boolean }) {
  const rank = RANKS[card.rank - 1]
  return (
    <div
      role="img"
      aria-label={`${RANK_NAMES[card.rank - 1]} of ${SUIT_NAMES[card.suit]}`}
      className={animate ? 'pcard dealt' : 'pcard'}
      style={{ '--suit': SUIT_COLORS[card.suit], '--tilt': `${tilt}deg` } as CSSProperties}
    >
      <span className="pcard-corner">
        {rank}
        <Suit suit={card.suit} className="pcard-small" />
      </span>
      <span className="pcard-center">
        {card.rank > 10 || card.rank === 1 ? <span className="pcard-face">{rank}</span> : <Suit suit={card.suit} className="pcard-big" />}
      </span>
      <span className="pcard-corner pcard-corner-end" aria-hidden>
        {rank}
        <Suit suit={card.suit} className="pcard-small" />
      </span>
    </div>
  )
}
