import { ArrowRight, Check, Minus } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { desktopCommand, isOverlay } from '@/bridge/desktop'
import type { ShowCardRequest } from '@/bridge'
import { APPS, parseSequence, type Deck, type Lookup } from '@/lib/deck'
import { comboLabel } from './KeyCombo'

export function RemapToast({ lookup, deck, result, onClose }: {
  lookup: Lookup
  deck: Deck
  result: ShowCardRequest['remapResult']
  onClose: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const card = lookup.kind === 'card' ? lookup.card : null
  const sent = result === 'sent'
  const feedback = sent ? 'Shortcut sent' : result === 'busy' ? 'Queue busy · try again'
    : result === 'cancelled' ? 'Stopped · input context changed' : 'No direct shortcut'

  useEffect(() => {
    const timer = window.setTimeout(onClose, 2000)
    return () => window.clearTimeout(timer)
  }, [onClose])
  useEffect(() => {
    if (!isOverlay || !ref.current) return
    const el = ref.current
    const measure = () => desktopCommand('setHintHeight', Math.ceil(el.getBoundingClientRect().height) + 32)
    const observer = new ResizeObserver(measure)
    observer.observe(el); measure()
    return () => observer.disconnect()
  }, [])

  return <article ref={ref} className="remap-toast" aria-label="Direct remap notification">
    <span className="remap-toast-icon" aria-hidden="true">{sent ? <Check size={22} /> : <Minus size={22} />}</span>
    <div className="min-w-0 flex-1">
      <p className="text-small text-window-ink-muted">{feedback} · {APPS[deck.to].name}</p>
      <h2 className="mt-1 text-body leading-snug font-semibold">{card?.action ?? 'Shortcut unavailable'}</h2>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-small text-brand-tint">
        <span>{comboLabel(lookup.pressed)}</span>
        {sent && card?.toKeys && <><ArrowRight size={12} aria-hidden="true" /><span>{parseSequence(card.toKeys).map((step) => comboLabel(step)).join(' then ')}</span></>}
      </p>
    </div>
  </article>
}
