import { ArrowRight, ChevronDown, History as HistoryIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { bridge, useHistory } from '@/bridge'
import { isDesktop } from '@/bridge/desktop'
import { AppIcon } from '@/components/AppIcon'
import { KeySequence } from '@/components/KeyCombo'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import { Button } from '@/components/ui/button'
import { APPS, cardById, findDeck } from '@/lib/deck'
import { groupHistory, historyActionKey, type HistoryAction } from '@/lib/history'
import { navigate } from '@/lib/router'

const dayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

export function History() {
  const entries = useHistory()
  const [confirming, setConfirming] = useState(false)
  const review = useRef<HTMLDivElement>(null)
  const clearTrigger = useRef<HTMLButtonElement>(null)
  const cancelClear = useRef<HTMLButtonElement>(null)
  const [cleared, setCleared] = useState(false)
  const days = groupHistory(entries)
  const actions = new Set(entries.map(historyActionKey)).size

  return <WindowFrame title="History" className="pb-[calc(var(--size-tabbar)+1rem)]">
    <div ref={review} tabIndex={-1} className="rounded-lg focus-visible:outline-2 focus-visible:outline-brand-soft">
      <ScreenHeading sub="Keep working. Revisit the shortcuts when you’re ready.">Your recent shortcuts</ScreenHeading>
    </div>
    <p role="status" className="sr-only">{cleared && entries.length === 0 ? 'History cleared. Saved lookups and achievements are unchanged.' : ''}</p>
    {entries.length === 0 ? <div className="rounded-card border border-dashed border-field-border p-6">
      <HistoryIcon className="mb-4 size-7 text-brand-soft" aria-hidden="true" />
      <h3 className="text-body font-semibold">Your next shortcut starts here</h3>
      <p className="mt-3 text-small text-window-ink-muted">{isDesktop
        ? 'Turn on Direct remap and use a supported shortcut in Photoshop or Illustrator. It will be saved here automatically, without interrupting your work.'
        : 'The Mac app records your shortcuts while Direct remap is on. This website cannot record activity in Photoshop or Illustrator; its history stays on your Mac.'}</p>
      <Button className="mt-5" onClick={() => navigate('home')}>{isDesktop ? 'Open mode controls' : 'Back to shortcut search'}</Button>
    </div> : <>
      <div className="mb-6 rounded-card border border-brand-soft/30 bg-brand/10 p-4">
        <p className="text-body font-semibold">{entries.length} {entries.length === 1 ? 'use' : 'uses'} <span className="text-window-ink-muted">·</span> {actions} {actions === 1 ? 'shortcut' : 'shortcuts'}</p>
        <p className="mt-2 text-small text-window-ink-muted">In your recent activity. Open any action to see its keys and what’s different.</p>
      </div>
      <div className="space-y-7">
        {days.map((day) => <section key={day.key} aria-labelledby={`history-${day.key}`}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 id={`history-${day.key}`} className="text-body font-semibold">{dayFormat.format(day.date)}</h3>
            <span className="text-small text-window-ink-muted">{day.uses} {day.uses === 1 ? 'use' : 'uses'}</span>
          </div>
          <ul className="space-y-2">
            {day.actions.map((action) => <li key={historyActionKey(action.entry)}><HistoryItem action={action} /></li>)}
          </ul>
        </section>)}
      </div>
      <div className="mt-7 rounded-xl bg-tile p-4 text-small text-window-ink-muted">
        <p>Stored only on this Mac. Keeps the latest 500 uses, including supported shared keys while Direct remap is on.</p>
        <p className="mt-2">A record means the shortcut was sent or passed through. It does not confirm an edit or that you’ve learned it.</p>
      </div>
      <div className="mt-5">
        {confirming ? <div className="rounded-xl border border-field-border p-4">
          <p id="clear-history-question" className="text-small">Clear all history on this Mac? This cannot be undone. Saved lookups and achievements will stay.</p>
          <div className="mt-3 flex gap-2">
            <Button variant="destructive" size="sm" aria-describedby="clear-history-question" onClick={() => { bridge.clearHistory(); setConfirming(false); setCleared(true); review.current?.focus() }}>Clear history</Button>
            <Button ref={cancelClear} variant="ghost" size="sm" onClick={() => { setConfirming(false); requestAnimationFrame(() => clearTrigger.current?.focus()) }}>Cancel</Button>
          </div>
        </div> : <Button ref={clearTrigger} variant="ghost" size="sm" onClick={() => { setConfirming(true); requestAnimationFrame(() => cancelClear.current?.focus()) }}>Clear history…</Button>}
      </div>
    </>}
  </WindowFrame>
}

function HistoryItem({ action }: { action: HistoryAction }) {
  const { entry, count, lastUsedAt, firstUsedAt } = action
  const deck = findDeck({ from: entry.from, to: entry.to })
  const card = deck ? cardById(deck, entry.cardId) : null
  const currentExplanation = card && card.fromKeys === entry.fromKeys && card.toKeys === entry.toKeys
  return <details className="history-action group rounded-xl border border-field-border bg-tile">
    <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-soft">
      <AppIcon app={entry.to} size={28} />
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold">{entry.action}</span>
        <span className="mt-1 block text-small text-window-ink-muted">{APPS[entry.to].name} · {count} {count === 1 ? 'use' : 'uses'} · <time dateTime={new Date(lastUsedAt).toISOString()}>{timeFormat.format(lastUsedAt)}</time></span>
      </span>
      <ChevronDown size={17} className="shrink-0 text-window-ink-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
    </summary>
    <div className="border-t border-field-border p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-small">
        <span className="text-window-ink-muted">{APPS[entry.from].name}</span><KeySequence keys={entry.fromKeys} />
        <ArrowRight size={14} className="text-brand-soft" aria-hidden="true" />
        <span className="text-window-ink-muted">{APPS[entry.to].name}</span><KeySequence keys={entry.toKeys} />
      </div>
      {currentExplanation && <><p className="mt-4 text-small">{card.summary}</p>
        {card.but && <div className="mt-3 rounded-lg bg-field p-3 text-small"><p className="mb-1 font-semibold">What’s different</p><p className="text-window-ink-muted">{card.but}</p></div>}</>}
      {card && !currentExplanation && <p className="mt-4 text-small text-window-ink-muted">This mapping has changed. The keys above are the ones recorded at the time.</p>}
      <p className="mt-4 text-small text-window-ink-muted">{entry.kind === 'shared' ? 'Same key in both apps. Passed through unchanged.' : 'Target shortcut sent by Direct remap.'}</p>
      {count > 1 && <p className="mt-2 text-small text-window-ink-muted">First used {timeFormat.format(firstUsedAt)} · last used {timeFormat.format(lastUsedAt)}</p>}
    </div>
  </details>
}
