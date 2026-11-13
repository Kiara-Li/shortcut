import { Trophy } from 'lucide-react'
import { bridge, useAchievements } from '@/bridge'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import { KeySequence } from '@/components/KeyCombo'
import { APPS, cardById, DECKS, parseCombo, type Deck } from '@/lib/deck'

export function Achievements({ deck }: { deck: Deck }) {
  const achievements = useAchievements()
  const items = [...achievements].sort((a, b) => b.unlockedAt - a.unlockedAt).flatMap((entry) => {
    const sourceDeck = DECKS.find((item) => item.from === entry.from && item.to === entry.to)
    const card = sourceDeck ? cardById(sourceDeck, entry.cardId) : null
    return card ? [{ entry, card }] : []
  })
  const count = items.filter(({ entry }) => entry.from === deck.from && entry.to === deck.to).length
  const total = deck.cards.filter((card) => card.toKeys !== null).length
  return (
    <WindowFrame title="Achievements" className="pb-[calc(var(--size-tabbar)+1rem)]">
      <ScreenHeading sub="A little record of the shortcuts you’ve tried.">Your first tries</ScreenHeading>
      <div className="flex items-center gap-4 rounded-card border border-brand-soft/40 bg-brand/10 p-5">
        <Trophy className="size-8 shrink-0 text-brand-soft" aria-hidden />
        <div>
          <p className="text-card-action font-semibold">{count} / {total}</p>
          <p className="text-small text-window-ink-muted">Figma → {APPS[deck.to].name}</p>
        </div>
      </div>
      <p className="mt-4 text-small text-window-ink-muted">In the Mac app, read a card, then try its target shortcut in the matching app within two minutes. Each card unlocks once. This records the key press, not whether the app finished the action. Website entries are explicitly marked as self-reported.</p>
      {items.length === 0 ? (
        <p className="mt-7 rounded-card border border-dashed border-field-border p-6 text-body text-window-ink-muted">Your first shortcut is waiting. Look up Scale, then try the shortcut shown on its card.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map(({ entry, card }) => (
            <li key={entry.cardId} className="rounded-card bg-tile p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-body font-semibold">{card.action}</p>
                  <p className="mt-1 text-small text-window-ink-muted">{APPS[entry.to].name} · {entry.method === 'shortcut' ? 'First shortcut try' : 'Self-reported try'}</p>
                </div>
                <Trophy className="size-5 shrink-0 text-brand-soft" aria-hidden />
              </div>
              {card.toKeys && <div className="mt-3"><KeySequence keys={card.toKeys} /></div>}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-small">
                <time dateTime={new Date(entry.unlockedAt).toISOString()} className="text-window-ink-muted">{new Date(entry.unlockedAt).toLocaleDateString()}</time>
                {entry.from === deck.from && entry.to === deck.to && <button type="button" className="min-h-8 rounded-lg px-2 text-brand-soft underline underline-offset-4" onClick={() => bridge.showCard({ pressed: parseCombo(card.fromKeys), at: null, source: 'saved' })}>Revisit card</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </WindowFrame>
  )
}
