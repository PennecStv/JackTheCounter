import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LEVELS, PENETRATION, SYSTEMS, countValue, handTotal, makeShoe, planLevel, settle, startCount, trueCountOk, valueGroups, type SystemId } from '../src/game.ts'

const IDS = Object.keys(SYSTEMS) as SystemId[]

test('a full shoe counts back to zero on balanced systems, +4 a deck on KO', () => {
  for (const id of IDS)
    for (const { decks } of LEVELS) {
      const shoe = makeShoe(decks)
      assert.equal(shoe.length, decks * 52)
      assert.equal(shoe.reduce((rc, c) => rc + countValue(id, c), 0), SYSTEMS[id].balanced ? 0 : 4 * decks, id)
    }
})

test('value groups list every rank once, highest value first', () => {
  for (const id of IDS) {
    const groups = valueGroups(id)
    assert.deepEqual(groups.flatMap((g) => g.ranks).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    assert.deepEqual(groups.map((g) => g.value), groups.map((g) => g.value).sort((a, b) => b - a))
  }
  assert.deepEqual(valueGroups('hilo')[2], { value: -1, ranks: [10, 11, 12, 13, 1] })
})

test('hand totals handle soft aces', () => {
  assert.equal(handTotal([{ rank: 1, suit: 0 }, { rank: 6, suit: 0 }]), 17)
  assert.equal(handTotal([{ rank: 1, suit: 0 }, { rank: 6, suit: 0 }, { rank: 9, suit: 0 }]), 16)
  assert.equal(handTotal([{ rank: 1, suit: 0 }, { rank: 13, suit: 0 }]), 21)
})

test('a level deals to the cut card and ends on a checkpoint', () => {
  for (const { decks } of LEVELS) {
    const { shoeSize, rounds, checks } = planLevel(decks)
    const dealt = rounds.flat().length
    assert.ok(dealt >= shoeSize * PENETRATION && dealt <= shoeSize, `dealt ${dealt} of ${shoeSize}`)
    assert.ok(checks.has(rounds.length - 1))
    assert.ok([...checks].every((i) => i >= 0 && i < rounds.length))
    for (const r of rounds) assert.ok(r.filter((d) => d.spot === 2).length >= 1, 'dealer always gets cards')
  }
})

test('true count accepts answers within one', () => {
  assert.ok(trueCountOk(2, 7, 130)) // 7 / 2.5 decks = 2.8
  assert.ok(trueCountOk(3, 7, 130))
  assert.ok(!trueCountOk(1, 7, 130))
  assert.ok(!trueCountOk(4, 7, 130))
})

test('settle scores each hand against the dealer', () => {
  const hand = (spot: number, ...ranks: number[]) => ranks.map((rank) => ({ card: { rank, suit: 0 }, spot }))
  // dealer 18 against 20 (win) and a bust
  assert.deepEqual(settle([...hand(0, 10, 10), ...hand(1, 10, 6, 9), ...hand(2, 10, 8)]), { hands: ['win', 'bust'], dealer: 'win' })
  // blackjack against 18, and 18 against 18
  assert.deepEqual(settle([...hand(0, 1, 13), ...hand(1, 9, 9), ...hand(2, 10, 8)]), { hands: ['blackjack', 'push'], dealer: null })
  // dealer blackjack beats a three-card 21 and pushes a blackjack
  assert.deepEqual(settle([...hand(0, 5, 6, 10), ...hand(1, 1, 12), ...hand(2, 1, 11)]), { hands: ['lose', 'push'], dealer: 'win' })
  // dealer busts: standing hands win
  assert.deepEqual(settle([...hand(0, 10, 3), ...hand(1, 10, 7), ...hand(2, 10, 6, 9)]), { hands: ['win', 'win'], dealer: 'bust' })
})

test('KO starts at 4 − 4 × decks and a full shoe ends on the +4 pivot', () => {
  for (const { decks } of LEVELS) {
    const end = makeShoe(decks).reduce((rc, c) => rc + countValue('ko', c), startCount('ko', decks))
    assert.equal(end, 4)
    assert.equal(startCount('hilo', decks), 0)
  }
  assert.equal(startCount('ko', 8), -28)
})
