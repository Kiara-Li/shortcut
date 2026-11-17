import assert from 'node:assert/strict'
import { groupHistory, historyActionKey } from '../src/lib/history.ts'

const oldTZ = process.env.TZ
process.env.TZ = 'America/New_York'
let checks = 0
const check = (condition, message) => { assert.ok(condition, message); checks += 1 }
const entry = (id, usedAt, extra = {}) => ({
  id, cardId: 'scale', action: 'Scale', from: 'figma', to: 'illustrator',
  fromKeys: 'K', toKeys: 'S', kind: 'remapped', usedAt: Date.parse(usedAt), ...extra,
})
try {
  const first = entry('one', '2026-11-16T09:00:00-05:00')
  const second = entry('two', '2026-11-16T09:30:00-05:00')
  const previous = entry('previous', '2026-11-15T23:59:00-05:00')
  const source = [first, previous, second]
  const days = groupHistory(source)
  check(days.length === 2 && days[0].key === '2026-11-16', 'Activity is newest-first by the local day')
  check(days[0].uses === 2 && days[0].actions.length === 1, 'Repeated actions group without losing usage counts')
  check(days[0].actions[0].firstUsedAt === first.usedAt && days[0].actions[0].lastUsedAt === second.usedAt, 'First and last use remain accurate')
  check(source[0] === first && source[1] === previous, 'Review does not mutate the bridge store')
  const ps = entry('ps', '2026-11-16T10:00:00-05:00', { to: 'photoshop', toKeys: 'Cmd+T' })
  check(groupHistory([first, ps])[0].actions.length === 2, 'Photoshop and Illustrator actions are kept distinct')
  check(historyActionKey(first) !== historyActionKey({ ...first, toKeys: 'Shift+S' }), 'Changed mappings retain separate historical key snapshots')
  const dst = groupHistory([
    entry('late', '2026-11-01T01:30:00-05:00'),
    entry('early', '2026-11-01T01:30:00-04:00'),
  ])
  check(dst.length === 1 && dst[0].uses === 2, 'Both repeated hours of the DST fall-back day remain in the same calendar day')
  const midnight = groupHistory([entry('utc', '2026-11-16T02:00:00Z')])
  check(midnight[0].key === '2026-11-15', 'UTC timestamps are not grouped into the wrong local date')
  check(groupHistory([]).length === 0, 'A new or cleared history has no sample activity')
  check(groupHistory([{ ...first, usedAt: NaN }]).length === 0, 'Invalid timestamps do not crash the review screen')
  console.log(`Passed ${checks} history grouping and timezone checks.`)
} finally {
  if (oldTZ === undefined) delete process.env.TZ
  else process.env.TZ = oldTZ
}
