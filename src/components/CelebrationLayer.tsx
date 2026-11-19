import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { bridge, type AchievementEntry } from '@/bridge'
import { APPS, DECKS } from '@/lib/deck'

/** First-try feedback uses the same compact notification grammar as Direct remap. */
export function CelebrationLayer() {
  const [entry, setEntry] = useState<AchievementEntry | null>(null)
  useEffect(() => bridge.onAchievement(setEntry), [])
  useEffect(() => {
    if (!entry) return
    const timer = window.setTimeout(() => setEntry(null), 3800)
    return () => window.clearTimeout(timer)
  }, [entry])
  if (!entry) return null
  const card = DECKS.flatMap((deck) => deck.cards).find((item) => item.id === entry.cardId)

  return (
    <div className="celebration-layer" key={entry.unlockedAt}>
      <div role="status" className="celebration-toast remap-toast">
        <span className="remap-toast-icon" aria-hidden="true"><Check size={22} /></span>
        <div>
          <p className="text-small text-window-ink-muted">{entry.method === 'shortcut' ? 'First try saved' : 'Marked as tried'} · {APPS[entry.to].name}</p>
          <h2 className="mt-1 text-body font-semibold">{card?.action ?? 'Shortcut tried'}</h2>
          <p className="mt-1 text-small text-window-ink-muted">You can revisit it in Progress.</p>
        </div>
      </div>
    </div>
  )
}
