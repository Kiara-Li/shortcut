import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { APPS, DECKS, isSupportedPair, type AppId, type Pair } from '@/lib/deck'
import { AppIcon } from './AppIcon'

/** One relationship editor in Settings, with no introductory setup gate. */
export function PairForm({
  initial,
  submitLabel,
  onSubmit,
  onEdit,
}: {
  initial: Pair | null
  submitLabel: string
  onSubmit: (pair: Pair) => void
  /** Called whenever a choice changes (before submit). */
  onEdit?: () => void
}) {
  // Start with the default pair; keep both supported targets available.
  const fallback = DECKS[0]
  const [to, setTo] = useState<AppId | null>(initial?.to ?? fallback.to)
  const [from, setFrom] = useState<AppId | null>(initial?.from ?? fallback.from)
  const valid = !!to && !!from && to !== from && isSupportedPair({ from, to })

  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit({ from: from!, to: to! })
      }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-card border border-field-border bg-field p-5">
        <div className="min-w-0">
          <label htmlFor="pair-from" className="mb-4 block text-small text-window-ink-muted">I know</label>
          {from && <AppIcon app={from} size={38} />}
          <select id="pair-from" value={from ?? ''}
            onChange={(event) => { setFrom(event.target.value as AppId); onEdit?.() }}
            className="mt-3 min-h-11 w-full rounded-lg border border-field-border bg-tile px-2 text-body font-semibold">
            {[...new Set(DECKS.map((deck) => deck.from))].map((id) => <option key={id} value={id}>{APPS[id].name}</option>)}
          </select>
        </div>
        <ArrowRight className="mt-7 size-5 text-brand-soft" aria-hidden />
        <div className="min-w-0">
          <label htmlFor="pair-to" className="mb-4 block text-small text-window-ink-muted">I’m working in</label>
          {to && <AppIcon app={to} size={38} />}
          <select id="pair-to" value={to ?? ''}
            onChange={(event) => { setTo(event.target.value as AppId); onEdit?.() }}
            className="mt-3 min-h-11 w-full rounded-lg border border-field-border bg-tile px-2 text-body font-semibold">
            {DECKS.filter((deck) => deck.from === from).map((deck) => <option key={deck.to} value={deck.to}>{APPS[deck.to].name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-5">
        <Button type="submit" disabled={!valid} className="h-12 rounded-full px-6 text-body font-semibold">
          {submitLabel} <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  )
}
