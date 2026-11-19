import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { comboId, parseCombo, parseSequence } from '../src/lib/shortcuts.ts'

const read = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'))
const illustrator = read('../src/data/figma-to-illustrator.json')
const photoshop = read('../src/data/figma-to-photoshop.json')
const baseline = read('../docs/illustrator-coverage.json')
let checks = 0
const check = (condition, message) => { assert.ok(condition, message); checks += 1 }
const idFor = (text) => comboId(parseCombo(text))

for (const deck of [illustrator, photoshop]) {
  const ids = new Set()
  const chords = new Map()
  for (const card of deck.cards) {
    check(!ids.has(card.id), `Duplicate action ID: ${card.id}`)
    ids.add(card.id)
    for (const key of [card.fromKeys, ...(card.aliases ?? [])]) {
      const combo = parseCombo(key)
      check(Boolean(combo.key), `Invalid source key: ${card.id}: ${key}`)
      const id = comboId(combo)
      check(!chords.has(id), `Ambiguous source chord: ${key}: ${card.id} / ${chords.get(id)}`)
      chords.set(id, card.id)
    }
    if (card.toKeys) {
      check(parseSequence(card.toKeys).length > 0, `Invalid target sequence: ${card.id}`)
      check(card.type !== 'no-match', `Executable card mislabeled: ${card.id}`)
    } else {
      check(card.type === 'no-match' && Boolean(card.noMatchAlternative), `Unavailable card needs an honest alternative: ${card.id}`)
    }
    if (deck === illustrator) {
      check(['shortcut', 'manual', 'figma-only'].includes(card.availability), `Missing disposition: ${card.id}`)
      check(card.sources?.length > 0 && card.sources.every((id) => /^https:\/\//.test(deck.scope.sources[id])), `Missing source provenance: ${card.id}`)
      check(card.verified === false, `Documentation review must not claim hands-on verification: ${card.id}`)
      check(card.context === (card.intercept ? 'canvas' : 'reference-only'), `Context policy mismatch: ${card.id}`)
    }
  }
}
// Coverage is a separately checked reference baseline: deleting an action or alias
// from the runtime catalog cannot silently reduce the declared coverage.
const actual = new Map(illustrator.cards.map((card) => [card.id, card]))
check(actual.size === baseline.actions.length, 'Catalog and reference baseline must cover the same actions')
for (const expected of baseline.actions) {
  const card = actual.get(expected.id)
  check(Boolean(card), `Missing reference action: ${expected.id}`)
  check(card.fromKeys === expected.source && JSON.stringify(card.aliases ?? []) === JSON.stringify(expected.aliases), `Source drift needs explicit reference review: ${expected.id}`)
  check(expected.disposition === (card.toKeys ? 'execute' : card.intercept ? 'manual' : 'preserve-native'), `Coverage cannot count a manual action as automated: ${card.id}`)
}
const targets = {
  pencil: 'N', 'pixel-preview': 'Cmd+Alt+Y', 'place-image': 'Cmd+Shift+P',
  outlines: 'Cmd+Y', 'bring-front': 'Cmd+Shift+]', 'send-back': 'Cmd+Shift+[',
  duplicate: 'Cmd+C, Cmd+F', 'zoom-fit': 'Cmd+0', rulers: 'Cmd+R',
}
for (const [id, target] of Object.entries(targets)) check(actual.get(id).toKeys === target, `Documented target changed: ${id}`)
const current = { 'outline-stroke': 'Cmd+Alt+O', flatten: 'Alt+Shift+F', outlines: 'Cmd+Shift+O', paint: 'Shift+B', actions: 'Cmd+K', 'text-link': 'Cmd+Shift+U', 'boolean-union': 'Alt+Shift+U' }
for (const [id, source] of Object.entries(current)) check(idFor(actual.get(id).fromKeys) === idFor(source), `Do not restore a stale Figma binding: ${id}`)
for (const id of ['select-inverse', 'outline-stroke', 'copy-properties', 'paste-properties', 'remove-fill', 'remove-stroke', 'mask', 'flip-horizontal', 'flip-vertical', 'paste-over']) {
  check(actual.get(id).toKeys === null, `Unsafe context-dependent replacement must not be synthesized: ${id}`)
}
for (const id of ['edit-selection', 'select-parent', 'next-sibling', 'previous-sibling', 'deselect', 'next-region', 'shortcut-panel']) {
  check(actual.get(id).intercept === false, `Focus/cancel/edit keys must remain native: ${id}`)
}
check(!illustrator.cards.some((card) => [card.fromKeys, ...(card.aliases ?? [])].some((keys) => ['Shift+O', 'Cmd+E', 'Cmd+P'].includes(keys))), 'Legacy conflicts must not become active aliases')
check(idFor('Control+Option+Command+Shift+ArrowUp') === 'ctrl+alt+cmd+shift+UP', 'All modifiers and arrow synonyms parse')
check(idFor('+') === idFor('Shift+='), 'Literal plus is a physical shifted equals key')
check(idFor('Cmd++') === idFor('Cmd+Shift+='), 'Command plus preserves Shift')
check(parseSequence('Cmd+,').length === 1 && parseSequence('Cmd+,, Cmd+F').length === 2, 'Comma keys are distinct from sequence separators')
check(parseSequence('Cmd+C, BAD+F').length === 0, 'A partial invalid sequence must not execute')
for (const input of ['', 'Cmd+', 'BAD+F', 'Ctrl', 'Cmd+CapsLock', 'Cmd+F21', 'Cmd+A+B']) check(!parseCombo(input).key, `Reject unsupported chord: ${input}`)
const executable = illustrator.cards.filter((card) => card.intercept && card.toKeys).length
const manual = illustrator.cards.filter((card) => card.intercept && !card.toKeys).length
const contextual = illustrator.cards.filter((card) => !card.intercept).length
console.log(`Passed ${checks} parser, provenance, collision, coverage and unsafe-equivalence checks.`)
console.log(`Illustrator: ${illustrator.cards.length} actions; ${executable} executable/shared, ${manual} manual, ${contextual} preserve native; ${baseline.gestures.length} pointer gestures classified separately.`)
