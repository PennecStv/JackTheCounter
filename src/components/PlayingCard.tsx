import type { CSSProperties } from 'react'
import { RANKS, type Card } from '@/game'
import { useT } from '@/i18n'

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
// Card faces: Jfred's Pixel Cards (CC0), one 50x75 PNG per card in public/cards/<suit>/<rank>.png.
const SUIT_DIRS = ['spades', 'hearts', 'clubs', 'diamonds'] // in the game's suit order

export function Suit({ suit, className }: { suit: number; className?: string }) {
  return (
    <svg viewBox="0 0 7 7" shapeRendering="crispEdges" className={className} aria-hidden>
      <path d={PATHS[suit]} fill="currentColor" />
    </svg>
  )
}

export function PlayingCard({ card, tilt = 0, animate = true }: { card: Card; tilt?: number; animate?: boolean }) {
  const t = useT()
  return (
    <img
      src={`${import.meta.env.BASE_URL}cards/${SUIT_DIRS[card.suit]}/${RANKS[card.rank - 1]}.png`}
      alt={t.card(card.rank, card.suit)}
      className={animate ? 'pcard dealt' : 'pcard'}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
      draggable={false}
    />
  )
}
