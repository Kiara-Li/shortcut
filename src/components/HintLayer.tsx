import { useCallback, useEffect, useRef, useState } from 'react'
import { bridge, useAchievements, type ShowCardRequest } from '@/bridge'
import { desktopCommand, isDesktop, isOverlay } from '@/bridge/desktop'
import { lookup as lookupCombo, type Deck, type Lookup } from '@/lib/deck'
import { comboSpoken } from './KeyCombo'
import { ShortcutHint } from './ShortcutHint'
import { RemapToast } from './RemapToast'

/** One fixed-position notification, shared by native lookups and website search. */
export function HintLayer({ deck }: { deck: Deck }) {
  const achievements = useAchievements()
  const [shown, setShown] = useState<{ id: number; lookup: Lookup; remap: boolean; result: ShowCardRequest['remapResult'] } | null>(null)
  const nextId = useRef(0)
  const returnFocus = useRef<HTMLElement | null>(null)
  const close = useCallback(() => {
    if (!isDesktop && document.activeElement?.closest('.shortcut-hint') && returnFocus.current?.isConnected) {
      returnFocus.current.focus()
    }
    setShown(null)
    if (isOverlay) desktopCommand('hideCard')
  }, [])

  useEffect(() => bridge.onCardShow((request) => {
    const result = lookupCombo(deck, request.pressed)
    if (result.kind === 'card' && request.source !== 'saved' && request.source !== 'remap') bridge.recordLookup(result.card.id)
    if (document.activeElement instanceof HTMLElement && !document.activeElement.closest('.shortcut-hint')) {
      returnFocus.current = document.activeElement
    }
    setShown({ id: nextId.current++, lookup: result, remap: request.source === 'remap', result: request.remapResult })
  }), [deck])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('shortcut-dismiss', close)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('shortcut-dismiss', close)
    }
  }, [close])

  const card = shown?.lookup.kind === 'card' ? shown.lookup.card : null
  const announcement = shown?.remap ? `${card?.action ?? 'Shortcut'}. ${shown.result === 'sent' ? 'Target shortcut sent.' : 'Not remapped.'}` : shown ? card
    ? `${card.action}. ${card.toKeys ? `Target shortcut: ${card.toKeys}.` : 'No direct equivalent.'}`
    : `${comboSpoken(shown.lookup.pressed)} is not in this collection yet.` : ''

  return <>
    <p role="status" aria-atomic="true" className="sr-only">{announcement}</p>
    {shown && <div className={`${isOverlay ? 'hint-layer hint-layer-native' : 'hint-layer'}${shown.remap ? ' hint-layer-remap' : ''}`}>
      {shown.remap ? <RemapToast key={shown.id} lookup={shown.lookup} deck={deck} result={shown.result} onClose={close} />
        : <ShortcutHint key={shown.id} lookup={shown.lookup} deck={deck} onClose={close}
          unlocked={card !== null && achievements.some((entry) => entry.cardId === card.id)} />}
    </div>}
  </>
}
