import { ArrowRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { bridge } from '@/bridge'
import { desktopCommand, isDesktop, isOverlay } from '@/bridge/desktop'
import { APPS, type Deck, type Lookup } from '@/lib/deck'
import { AppIcon } from './AppIcon'
import { KeyCaps, KeySequence } from './KeyCombo'

const AUTO_HIDE_MS = 6000

/** One notification. Disclosure expands in place without activating the native panel. */
export function ShortcutHint({ lookup, deck, unlocked, onClose }: {
  lookup: Lookup
  deck: Deck
  unlocked: boolean
  onClose: () => void
}) {
  const surface = useRef<HTMLElement>(null)
  const details = useRef<HTMLDetailsElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const card = lookup.kind === 'card' ? lookup.card : null
  const target = APPS[deck.to].name

  useEffect(() => {
    if (!isDesktop || expanded || hovered || focused) return
    const timer = window.setTimeout(onClose, AUTO_HIDE_MS)
    return () => window.clearTimeout(timer)
  }, [expanded, hovered, focused, onClose])

  useEffect(() => {
    if (!isDesktop) surface.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const toggle = () => { if (details.current) details.current.open = !details.current.open }
    window.addEventListener('shortcut-details', toggle)
    return () => window.removeEventListener('shortcut-details', toggle)
  }, [])

  // Fit the native panel to its content so invisible space cannot cover the canvas.
  useEffect(() => {
    if (!isOverlay || !surface.current) return
    const element = surface.current
    const measure = () => desktopCommand('setHintHeight', Math.ceil(element.getBoundingClientRect().height) + 32)
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    measure()
    return () => observer.disconnect()
  }, [])

  return (
    <article ref={surface} className="shortcut-hint" tabIndex={-1} aria-label="Shortcut hint"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setHovered(false)}
      onFocusCapture={() => { if (!isOverlay) setFocused(true) }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
      <header className="flex items-start gap-3">
        <AppIcon app={deck.to} size={28} />
        <div className="min-w-0 flex-1">
          <p className="text-small text-card-ink-soft">{APPS[deck.from].name} → {target}</p>
          <h2 className="mt-1 text-[1.0625rem] leading-snug font-semibold">{card?.action ?? 'Shortcut not found'}</h2>
        </div>
        <button type="button" className="hint-close" onClick={onClose} aria-label="Close hint">
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      <div className="hint-mapping">
        <div className="shrink-0">
          <p className="mb-2 text-small text-card-ink-soft">From {APPS[deck.from].name}</p>
          <KeyCaps combo={lookup.pressed} className="text-body" />
        </div>
        <ArrowRight size={18} className="mt-5 shrink-0 text-card-ink-soft" aria-hidden="true" />
        <div className="min-w-0">
          <p className="mb-2 text-small text-card-ink-soft">{card?.toKeys ? `Press in ${target}` : 'In this app'}</p>
          {card?.toKeys ? <KeySequence keys={card.toKeys} className="justify-start text-card-body" />
            : <p className="text-body font-medium">{card ? 'No direct shortcut' : 'Not in this collection yet'}</p>}
        </div>
      </div>

      {card ? <details ref={details} className="hint-details" onToggle={(event) => setExpanded(event.currentTarget.open)}>
        <summary aria-keyshortcuts={isDesktop ? 'Control+Alt+Space' : undefined}>
          {expanded ? 'Hide details' : 'View details'}
        </summary>
        <div className="hint-explanation">
          <p>{card.summary}</p>
          {card.but && <div className="hint-difference"><p className="mb-1 font-semibold">What’s different</p><p>{card.but}</p></div>}
          {card.noMatchAlternative && <div className="hint-difference"><p className="mb-1 font-semibold">Try instead</p><p>{card.noMatchAlternative}</p></div>}
          {card.toKeys && <p className="text-small text-card-ink-soft">{card.toKeys.includes(', ') ? 'Press the shortcuts in order, one after the other. ' : ''}The hint does not perform the action for you.</p>}
          {unlocked && <p className="text-small text-card-ink-soft">First try saved to Achievements.</p>}
          {card.toKeys && !isDesktop && !unlocked && <button type="button" className="hint-tried"
            onClick={() => { bridge.markTried(card.id); onClose() }}>I tried this · mark as tried</button>}
        </div>
      </details> : <p className="mt-3 text-small text-card-ink-soft">Use the app’s menus for this action.</p>}
    </article>
  )
}
