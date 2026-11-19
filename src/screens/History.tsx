import { ArrowRight, ChevronDown, History as HistoryIcon } from 'lucide-react'
import { bridge, useHistory } from '@/bridge'
import { isDesktop } from '@/bridge/desktop'
import { AppIcon } from '@/components/AppIcon'
import { ConfirmAction } from '@/components/ConfirmAction'
import { KeySequence } from '@/components/KeyCombo'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import { APPS } from '@/lib/deck'
import { groupHistory, historyActionKey, type HistoryAction } from '@/lib/history'

const dayFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

export function History() {
  const entries = useHistory()
  const days = groupHistory(entries)

  return <WindowFrame title="History">
    <ScreenHeading>Recent history</ScreenHeading>
    {days.length === 0 ? <div className="history-empty">
      <HistoryIcon size={44} strokeWidth={1.3} aria-hidden="true" />
      <h2>No activity yet</h2>
      <p>{isDesktop ? 'Your Direct remap activity will appear here.' : 'History is recorded in the Mac app.'}</p>
    </div> : <>
      <div className="history-days">{days.map((day) => <section key={day.key} aria-labelledby={`history-${day.key}`}>
        <h2 id={`history-${day.key}`} className="history-date"><time dateTime={new Date(day.date).toISOString()}>{dayFormat.format(day.date)}</time></h2>
        <ul className="history-list">{day.actions.map((action) => <li key={historyActionKey(action.entry)}><HistoryItem action={action} /></li>)}</ul>
      </section>)}</div>
      <div className="history-actions"><ConfirmAction label="Clear history" question="Clear history?" confirmLabel="Clear" onConfirm={() => bridge.clearHistory()} /></div>
    </>}
  </WindowFrame>
}

function HistoryItem({ action }: { action: HistoryAction }) {
  const { entry, count, lastUsedAt } = action
  return <details className="history-action">
    <summary>
      <AppIcon app={entry.to} size={36} />
      <span className="history-action-name">{entry.action.split(' → ')[0]}<span className="sr-only"> in {APPS[entry.to].name}</span>{count > 1 && <span className="use-count">×{count}</span>}</span>
      <time dateTime={new Date(lastUsedAt).toISOString()}>{timeFormat.format(lastUsedAt)}</time>
      <ChevronDown size={16} aria-hidden="true" />
    </summary>
    <div className="history-mapping">
      <span className="sr-only">{APPS[entry.from].name}</span><KeySequence keys={entry.fromKeys} />
      <ArrowRight size={16} aria-hidden="true" /><span className="sr-only">{APPS[entry.to].name}</span><KeySequence keys={entry.toKeys} />
    </div>
  </details>
}
