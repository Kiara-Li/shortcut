import { MoveDiagonal, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { APPS, type AppId, type Lookup } from '@/lib/deck'
import { cn } from '@/lib/utils'
import { AppIcon } from './AppIcon'
import { KeyCaps, KeySequence } from './KeyCombo'

/**
 * The flashcard from the "in the moment" designs.
 * Front: what you pressed + what it's called → how to do it here.
 * Back: one-line explanation + a highlighted "BUT!" when behavior differs.
 * Purely presentational: position, timing and flip state live in CardLayer.
 */
export interface FlashcardProps {
  lookup: Lookup
  from: AppId
  to: AppId
  flipped: boolean
  onFlip: () => void
  onClose: () => void
  unlocked?: boolean
  desktop?: boolean
  onMarkTried?: () => void
}

const TYPE_TAG: Partial<Record<string, string>> = {
  'same-key': 'Same key',
  'false-friend': 'Watch out',
  'no-match': 'No match',
}

export function Flashcard({ lookup, from, to, flipped, onFlip, onClose, unlocked, desktop, onMarkTried }: FlashcardProps) {
  const fromName = APPS[from].name
  const toName = APPS[to].name
  const card = lookup.kind === 'card' ? lookup.card : null
  const canFlip = card !== null
  const tag = card ? TYPE_TAG[card.type] : 'Not in deck'
  const isWarning = card?.type === 'false-friend' || card?.type === 'no-match' || !card

  return (
    <div className="flip-scene size-full">
      <div className="flip-inner" data-flipped={flipped}>
        {/* ---------- FRONT ---------- */}
        <Face
          side="front"
          to={to}
          canFlip={canFlip}
          flipped={flipped}
          onFlip={onFlip}
          onClose={onClose}
          tag={tag}
          warn={isWarning}
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="flex items-center gap-1.5 text-small text-card-ink-soft">
              You pressed <KeyCaps combo={lookup.pressed} className="text-small" />
            </p>
            <p className="text-card-action leading-tight font-semibold text-card-ink">
              {card ? card.action : 'Not in your deck yet'}
            </p>
          </div>
          <div className="flex min-h-12 flex-wrap items-center justify-center gap-1.5 text-center text-card-body text-card-ink">
            {card?.toKeys ? (
              <>
                <span>In {toName}, it's</span>
                <KeySequence keys={card.toKeys} />
              </>
            ) : card ? (
              <span className="text-card-ink-soft">No shortcut in {toName}</span>
            ) : (
              <span className="text-body text-card-ink-soft">
                We don't have this {fromName} shortcut yet.
              </span>
            )}
          </div>
          {card?.toKeys && <div className="mt-3 text-center text-tiny text-card-ink-soft">
            {unlocked ? '✓ First try unlocked' : desktop ? 'Try this shortcut in the app to unlock an achievement.' : (
              <button type="button" onClick={(event) => { event.stopPropagation(); onMarkTried?.() }}
                className="min-h-8 rounded-full border border-keycap-border px-3 text-small text-card-ink">I tried this · mark as tried</button>
            )}
          </div>}
        </Face>

        {/* ---------- BACK ---------- */}
        {card && (
          <Face
            side="back"
            to={to}
            canFlip
            flipped={flipped}
            onFlip={onFlip}
            onClose={onClose}
            tag={card.action}
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <p className="text-card-body leading-snug font-medium text-card-ink">{card.summary}</p>
            </div>
            {(card.but || card.noMatchAlternative) && (
              <div className="rounded-xl bg-but-bg px-3 py-2.5 text-center">
                <p className="text-tiny font-bold tracking-[0.12em] text-but">
                  {card.noMatchAlternative ? 'TRY' : 'BUT!'}
                </p>
                <p className="mt-1 text-small leading-snug text-card-ink">
                  {card.noMatchAlternative ?? card.but}
                </p>
              </div>
            )}
          </Face>
        )}
      </div>
    </div>
  )
}

function Face({
  side,
  to,
  canFlip,
  flipped,
  onFlip,
  onClose,
  tag,
  warn,
  children,
}: {
  side: 'front' | 'back'
  to: AppId
  canFlip: boolean
  flipped: boolean
  onFlip: () => void
  onClose: () => void
  tag?: string
  warn?: boolean
  children: ReactNode
}) {
  const visible = (side === 'front') !== flipped
  return (
    <div
      className={cn(
        'flip-face flex flex-col rounded-card bg-card p-4 shadow-card select-none',
        side === 'back' && 'flip-face--back',
        canFlip && 'cursor-pointer',
      )}
      onClick={canFlip ? onFlip : undefined}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="flex items-start justify-between gap-2">
        <AppIcon app={to} size={32} />
        {tag && (
          <span
            className={cn(
              'mt-1 truncate rounded-full px-2 py-0.5 text-tiny font-semibold',
              warn ? 'bg-warn-bg text-warn' : 'bg-card-muted/60 text-card-ink-soft',
            )}
          >
            {tag}
          </span>
        )}
        <div className="flex gap-1.5">
          {canFlip && (
            <CardButton label={flipped ? 'Show front' : 'Show explanation'} onClick={onFlip} tabbable={visible}>
              <MoveDiagonal className="size-4" />
            </CardButton>
          )}
          <CardButton label="Close card" onClick={onClose} tabbable={visible}>
            <X className="size-4" />
          </CardButton>
        </div>
      </div>
      {children}
    </div>
  )
}

function CardButton({
  label,
  onClick,
  tabbable,
  children,
}: {
  label: string
  onClick: () => void
  tabbable: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      tabIndex={tabbable ? 0 : -1}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-brand-soft/60 bg-card-button text-card-button-ink transition-opacity hover:opacity-80"
    >
      {children}
    </button>
  )
}
