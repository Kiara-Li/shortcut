import { useState } from 'react'
import { bridge } from '@/bridge'
import { KeyCaps, KeySequence } from './KeyCombo'
import { APPS, parseCombo, type Deck } from '@/lib/deck'

function normalize(value: string) {
  return value.toLowerCase().replace(/⌘|command/g, 'cmd').replace(/⇧/g, 'shift').replace(/[+\s→]/g, '')
}

/** A real deck lookup, also usable on the static website without OS access. */
export function ShortcutSearch({ deck }: { deck: Deck }) {
  const [query, setQuery] = useState('')
  const needle = normalize(query)
  const matches = deck.cards.filter((card) =>
    [card.fromKeys, card.action, card.toKeys ?? ''].some((text) => normalize(text).includes(needle)),
  )
  return (
    <section aria-labelledby="lookup-title" className="mt-7 border-t border-field-border pt-5">
      <h3 id="lookup-title" className="text-body font-semibold">Find it in {APPS[deck.to].name}</h3>
      <label htmlFor="shortcut-search" className="mt-4 block text-small text-window-ink-muted">Figma shortcut or action</label>
      <input id="shortcut-search" type="search" value={query} placeholder="K, ⌘D, scale…"
        onChange={(event) => setQuery(event.target.value)}
        className="mt-2 min-h-12 w-full rounded-full border border-field-border bg-field px-4 text-body" />
      <p role="status" className="mt-3 text-small text-window-ink-muted">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>
      {matches.length === 0 ? <p className="mt-3 text-small">No card for this yet. Try “K”, “Copy” or “Duplicate”.</p> : (
        <ul className="mt-3 space-y-2">
          {matches.map((card) => (
            <li key={card.id}>
              <button type="button" onClick={() => bridge.showCard({ pressed: parseCombo(card.fromKeys), at: null, source: 'search' })}
                className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl bg-tile px-4 py-3 text-left hover:bg-tile-hover"
                aria-label={`Show ${card.action} hint`}>
                <span className="text-small font-medium">{card.action}</span>
                <span className="flex shrink-0 items-center gap-2 text-small">
                  <KeyCaps combo={parseCombo(card.fromKeys)} />
                  <span aria-hidden>→</span>
                  {card.toKeys ? <KeySequence keys={card.toKeys} /> : <span>No match</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
