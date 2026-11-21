import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LEVELS, PENETRATION, SYSTEMS, countValue, handTotal, makeShoe, planLevel, trueCountOk, valueGroups, type SystemId } from '../src/game.ts'

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
