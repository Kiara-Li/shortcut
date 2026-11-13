import { useEffect, useState, type CSSProperties } from 'react'
import { bridge, type AchievementEntry } from '@/bridge'
import { APPS, DECKS } from '@/lib/deck'

// Fixed particle positions keep rendering deterministic; no animation library.
const pieces = Array.from({ length: 54 }, (_, index) => ({
  x: (index * 37) % 100,
  drift: ((index * 29) % 240) - 120,
  rotate: (index % 2 ? 1 : -1) * (180 + index * 31),
  delay: (index % 9) * 0.045,
  color: ['#9999ff', '#ffd86b', '#f6a8ca', '#8ce3c4', '#ffffff'][index % 5],
}))

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
    <div key={entry.unlockedAt} className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <div aria-hidden="true" className="confetti-field">
        {pieces.map((piece, index) => (
          <span key={index} className="confetti-piece" style={{
            left: `${piece.x}%`, background: piece.color,
            '--drift': `${piece.drift}px`, '--spin': `${piece.rotate}deg`,
            animationDelay: `${piece.delay}s`,
          } as CSSProperties} />
        ))}
      </div>
      <div role="status" className="celebration-toast absolute top-10 left-1/2 w-[min(360px,90vw)] -translate-x-1/2 rounded-card border border-brand-soft/50 bg-window p-5 text-center text-window-ink shadow-window">
        <p className="text-tiny font-semibold tracking-widest text-brand-soft">ACHIEVEMENT UNLOCKED</p>
        <p className="mt-2 text-heading font-bold">Congratulations!</p>
        <p className="mt-2 text-body">{card?.action ?? 'Shortcut tried'} · {APPS[entry.to].name}</p>
        <p className="mt-2 text-small text-window-ink-muted">{entry.method === 'shortcut' ? 'Your first try, saved to Achievements.' : 'Marked as tried, saved to Achievements.'}</p>
      </div>
    </div>
  )
}
