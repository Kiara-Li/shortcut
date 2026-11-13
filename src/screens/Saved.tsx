import { useState } from 'react'
import { bridge, useSavedCards } from '@/bridge'
import { AppIcon } from '@/components/AppIcon'
import { KeyCaps, KeySequence } from '@/components/KeyCombo'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import { Button } from '@/components/ui/button'
import { APPS, cardById, parseCombo, type Deck } from '@/lib/deck'
import { navigate } from '@/lib/router'

/**
 * Every card you've met, most recent first, with look-up counts.
 * Grid styling follows the "Already yours" cards in setup4.svg.
 * TODO(design): needs its own design.
 */
export function Saved({ deck }: { deck: Deck }) {
  const saved = useSavedCards()
  const [confirming, setConfirming] = useState(false)
  const items = [...saved]
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .map((entry) => ({ entry, card: cardById(deck, entry.cardId) }))
    .filter((x): x is { entry: typeof x.entry; card: NonNullable<typeof x.card> } => x.card !== null)

  return (
    <WindowFrame title={APPS[deck.from].name} className="pb-[calc(var(--size-tabbar)+1rem)]">
      <ScreenHeading
        sub={
          items.length > 0
            ? `${items.length} of ${deck.cards.length} cards saved. Click one to see it again.`
            : undefined
        }
      >
        Saved cards
      </ScreenHeading>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-card border border-dashed border-field-border p-8 text-center">
          <p className="text-body text-window-ink-muted">
            No cards yet. Press a {APPS[deck.from].name} shortcut and the card you get will show up here.
          </p>
          <Button className="rounded-full" onClick={() => navigate('home')}>
            Try one
          </Button>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map(({ entry, card }) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() =>
                    bridge.showCard({ pressed: parseCombo(card.fromKeys), at: null, source: 'saved' })
                  }
                  className="flex aspect-[3/4] w-full cursor-pointer flex-col rounded-card bg-card-muted p-3 text-left text-card-ink transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between">
                    <AppIcon app={deck.to} size={26} />
                    <span className="rounded-full bg-card px-2 py-0.5 text-tiny font-semibold text-card-ink-soft">
                      ×{entry.count}
                    </span>
                  </div>
                  <span className="mt-auto text-body leading-tight font-semibold">{card.action}</span>
                  <span className="mt-2 flex flex-col gap-1 text-small">
                    <span className="flex items-center gap-1.5">
                      <span className="w-6 text-tiny text-card-ink-soft">{abbr(deck.from)}</span>
                      <KeyCaps combo={parseCombo(card.fromKeys)} />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-6 text-tiny text-card-ink-soft">{abbr(deck.to)}</span>
                      {card.toKeys ? (
                        <KeySequence keys={card.toKeys} className="justify-start text-tiny" />
                      ) : (
                        <span className="text-tiny text-card-ink-soft">No match</span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-center">
            {confirming ? (
              <div className="flex items-center gap-2 text-small text-window-ink-muted">
                Clear all saved cards?
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    bridge.clearSaved()
                    setConfirming(false)
                  }}
                >
                  Clear
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="text-window-title" onClick={() => setConfirming(true)}>
                Clear saved cards
              </Button>
            )}
          </div>
        </>
      )}
    </WindowFrame>
  )
}

function abbr(app: keyof typeof APPS) {
  return { figma: 'Fig', illustrator: 'Ai', photoshop: 'Ps', indesign: 'Id' }[app]
}
