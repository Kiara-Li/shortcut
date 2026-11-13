import { useCallback, useEffect, useRef, useState } from 'react'
import { bridge, useAchievements, type ShowCardRequest } from '@/bridge'
import { desktopCommand, isDesktop, isOverlay } from '@/bridge/desktop'
import { lookup as lookupCombo, type Deck, type Lookup } from '@/lib/deck'
import { Flashcard } from './Flashcard'

/** TODO(timing): tune with real users. Paused while the card is hovered or flipped. */
const AUTO_HIDE_MS = 6000
const GAP = 14 // px between the pointer and the card
const MARGIN = 12 // px kept free at the viewport edges

interface Shown {
  id: number
  lookup: Lookup
  at: ShowCardRequest['at']
}

/**
 * Listens for card requests (native keyboard shortcut or saved list),
 * places the card next to the pointer, and handles flip / dismiss / auto-hide.
 * Never takes keyboard focus, so typing keeps going to whatever had it.
 */
export function CardLayer({ deck }: { deck: Deck }) {
  const achievements = useAchievements()
  const [shown, setShown] = useState<Shown | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [hovered, setHovered] = useState(false)
  const nextId = useRef(0)

  const close = useCallback(() => {
    setShown(null)
    setFlipped(false)
    setHovered(false)
    if (isOverlay) desktopCommand('hideCard')
  }, [])

  // Card requests
  useEffect(
    () =>
      bridge.onCardShow((req) => {
        const result = lookupCombo(deck, req.pressed)
        if (result.kind === 'card' && req.source !== 'saved') bridge.recordLookup(result.card.id)
        setShown({ id: nextId.current++, lookup: result, at: req.at })
        setFlipped(false)
        setHovered(false)
      }),
    [deck],
  )

  // Auto-hide
  useEffect(() => {
    if (!shown || flipped || hovered) return
    const t = window.setTimeout(close, AUTO_HIDE_MS)
    return () => window.clearTimeout(t)
  }, [shown, flipped, hovered, close])

  // Native shortcuts are forwarded explicitly because the overlay takes no focus.
  useEffect(() => {
    if (!shown) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === ' ' && hovered && shown.lookup.kind === 'card') {
        e.preventDefault()
        setFlipped((f) => !f)
      }
    }
    window.addEventListener('keydown', onKey)
    const onFlip = () => setFlipped((value) => !value)
    window.addEventListener('shortcut-dismiss', close)
    window.addEventListener('shortcut-flip', onFlip)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('shortcut-dismiss', close)
      window.removeEventListener('shortcut-flip', onFlip)
    }
  }, [shown, hovered, close])

  if (!shown) return null

  const { left, top, width, height } = placeCard(shown.at)
  const card = shown.lookup.kind === 'card' ? shown.lookup.card : null
  const unlocked = card !== null && achievements.some((entry) => entry.cardId === card.id)

  return (
    <div
      key={shown.id}
      role="status"
      aria-live="polite"
      className="card-enter fixed z-50"
      style={{ left, top, width, height }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
    >
      <Flashcard
        lookup={shown.lookup}
        from={deck.from}
        to={deck.to}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
        onClose={close}
        unlocked={unlocked}
        desktop={isDesktop}
        onMarkTried={card && card.toKeys && !isDesktop && !unlocked ? () => { bridge.markTried(card.id); close() } : undefined}
      />
    </div>
  )
}

/** Put the card above the point if it fits (so a finger doesn't cover it), else below; keep it on screen. */
function placeCard(at: ShowCardRequest['at']) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const css = getComputedStyle(document.documentElement)
  const baseW = parseFloat(css.getPropertyValue('--size-card-w')) || 250
  const baseH = parseFloat(css.getPropertyValue('--size-card-h')) || 345
  const scale = Math.min(1, (vw - MARGIN * 2) / baseW, (vh - MARGIN * 2) / baseH)
  const width = baseW * scale
  const height = baseH * scale

  if (!at) return { left: (vw - width) / 2, top: (vh - height) / 2, width, height }

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
  const left = clamp(at.x - width / 2, MARGIN, vw - width - MARGIN)
  const above = at.y - GAP - height
  const top = above >= MARGIN ? above : clamp(at.y + GAP, MARGIN, vh - height - MARGIN)
  return { left, top, width, height }
}
