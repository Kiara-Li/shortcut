import type { CSSProperties } from 'react'
import { bridge, useAchievements } from '@/bridge'
import { AchievementBadge } from '@/components/AchievementBadge'
import { AppIcon } from '@/components/AppIcon'
import { KeySequence } from '@/components/KeyCombo'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import { APPS, parseCombo, type Card, type Deck } from '@/lib/deck'

export function Achievements({ deck }: { deck: Deck }) {
  const achievements = useAchievements()
  const entries = new Map(achievements.filter((entry) => entry.from === deck.from && entry.to === deck.to).map((entry) => [entry.cardId, entry]))
  const cards = deck.cards.filter((card) => card.toKeys !== null)
  const unlocked = cards.filter((card) => entries.has(card.id)).sort((a, b) => entries.get(b.id)!.unlockedAt - entries.get(a.id)!.unlockedAt)
  const locked = cards.filter((card) => !entries.has(card.id))

  function collection(items: Card[], completed: boolean) {
    return <ul className="achievement-grid">{items.map((card) => {
      const entry = entries.get(card.id)
      return <li key={card.id}>
        <button type="button" className={`achievement-card${completed ? ' is-unlocked' : ''}`}
          aria-label={`${card.action.split(' → ')[0]}, ${completed ? 'unlocked' : 'locked'}. View shortcut`}
          onClick={() => bridge.showCard({ pressed: parseCombo(card.fromKeys), at: null, source: 'saved' })}>
          <AchievementBadge card={card} unlocked={completed} />
          <span className="achievement-title">{card.action.split(' → ')[0]}</span>
          {card.toKeys && <span className="achievement-keys"><KeySequence keys={card.toKeys} /></span>}
          {entry && <span className="achievement-date"><time dateTime={new Date(entry.unlockedAt).toISOString()}>{new Date(entry.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>{entry.method === 'self-reported' && <span aria-label="Marked as tried" title="Marked as tried">*</span>}</span>}
        </button>
      </li>
    })}</ul>
  }

  return <WindowFrame title="Achievements">
    <ScreenHeading>Achievements</ScreenHeading>
    <div className="achievement-overview">
      <div className="unlock-ring" style={{ '--progress': `${cards.length ? unlocked.length / cards.length * 100 : 0}%` } as CSSProperties} role="img" aria-label={`${unlocked.length} of ${cards.length} achievements unlocked`}>
        <span>{unlocked.length}<span>/{cards.length}</span></span>
      </div>
      <div><p className="unlock-heading">Unlocked</p><span className="achievement-app"><AppIcon app={deck.to} size={24} />{APPS[deck.to].name}</span></div>
    </div>
    {unlocked.length > 0 && <section className="achievement-section" aria-labelledby="unlocked-title"><h2 id="unlocked-title">Unlocked<span>{unlocked.length}</span></h2>{collection(unlocked, true)}</section>}
    {locked.length > 0 && <section className="achievement-section" aria-labelledby="locked-title"><h2 id="locked-title">Locked<span>{locked.length}</span></h2>{collection(locked, false)}</section>}
  </WindowFrame>
}
