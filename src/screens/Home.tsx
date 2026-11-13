import { desktopCommand, useDesktopStatus } from '@/bridge/desktop'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import { Button } from '@/components/ui/button'
import { ShortcutSearch } from '@/components/ShortcutSearch'
import { APPS, type Deck } from '@/lib/deck'

export function Home({ deck }: { deck: Deck }) {
  const status = useDesktopStatus()
  const target = APPS[deck.to].name
  const ready = status?.listening && !status.secureInput
  const heading = !status ? `Find your shortcut in ${target}`
    : !status.accessibility ? 'Allow Accessibility access'
    : status.paused ? 'Listening is paused'
    : status.secureInput ? 'Secure Input is active'
    : ready ? 'Ready for your shortcuts' : 'Shortcut listener unavailable'

  return (
    <WindowFrame title="Shortcut" className="pb-[calc(var(--size-tabbar)+1rem)]">
      <ScreenHeading sub={`${APPS[deck.from].name} shortcuts → ${APPS[deck.to].name}`}>{heading}</ScreenHeading>
      {!status && <ShortcutSearch key={deck.to} deck={deck} />}
      {status ? (
        <>
          <p role="status" className="rounded-xl bg-tile p-4 text-body">
            {!status.accessibility ? 'Enable Shortcut in System Settings → Privacy & Security → Accessibility, then return here.'
              : status.secureInput ? 'macOS is protecting keyboard input. Leave the password field or turn off Secure Keyboard Entry in the app that enabled it.'
              : status.paused ? 'Resume to look up shortcuts in your other apps.'
              : ready ? `Listening ${status.scope === 'all' ? 'in all apps (testing)' : `in ${target}`}. The card appears over your real application.`
              : status.error ?? 'Try reopening Shortcut after enabling permission.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!status.accessibility && <Button onClick={() => desktopCommand('requestPermission')}>Open Accessibility settings</Button>}
            {status.accessibility && <Button onClick={() => desktopCommand('setPaused', !status.paused)}>{status.paused ? 'Resume listening' : 'Pause listening'}</Button>}
          </div>
          <label htmlFor="all-apps" className="mt-6 flex items-center gap-3 text-small">
            <input id="all-apps" type="checkbox" checked={status.scope === 'all'}
              onChange={(event) => desktopCommand('setScope', event.target.checked ? 'all' : 'target')}
              aria-describedby="scope-hint" />
            Listen in any app for testing
          </label>
          <p id="scope-hint" className="mt-2 text-small text-window-ink-muted">
            Normally, queries are intercepted only in {target}. Testing mode uses this same {target} deck everywhere.
          </p>
          <p className="mt-4 text-small text-window-ink-muted">Current app: {status.foregroundApp || 'Unknown'}</p>
          {status.lastTrigger && <p className="mt-2 text-small text-window-ink-muted">Last query: {status.lastTrigger}</p>}
        </>
      ) : (
        <div className="mt-7 space-y-4 border-t border-field-border pt-5 text-small text-window-ink-muted">
          <h3 className="text-body font-semibold text-window-ink">Want cards over your real apps?</h3>
          <p>System-wide shortcuts need the local macOS app. Start it from this project folder:</p>
          <pre className="overflow-x-auto rounded-xl bg-tile p-4 text-window-ink"><code>npm run desktop</code></pre>
          <p>This builds and opens <strong>Shortcut.app</strong>. Allow Accessibility access there, then use your actual applications. The website searches shortcuts and saves cards; it cannot intercept another app’s keyboard input.</p>
        </div>
      )}
      {status && <section className="mt-7 border-t border-field-border pt-5" aria-labelledby="try-title">
        <h3 id="try-title" className="text-body font-semibold">Try it in your real app</h3>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-small text-window-ink-muted">
          <li>Switch to {target}{status?.scope === 'all' ? ' (or a text editor for testing)' : ''}.</li>
          <li>Hold <kbd>⌃ Control + ⌥ Option</kbd>, then press <kbd>K</kbd>. A card shows Scale → <kbd>{deck.to === 'photoshop' ? '⌘T (Free Transform)' : 'S'}</kbd>.</li>
          <li>Try <kbd>⌃⌥⌘C</kbd> for the Copy card. Plain <kbd>⌘C</kbd> still copies normally.</li>
        </ol>
        <p className="mt-4 text-small text-window-ink-muted">Query combinations are swallowed before the app acts on them. Cards explain the shortcut; they do not execute it. Click a card to flip it, use ⌃⌥Space to flip without moving focus, or Esc to dismiss.</p>
      </section>}
      {status && <ShortcutSearch key={deck.to} deck={deck} />}
      {status && <p className="mt-6 text-tiny text-window-ink-muted">Closing this window keeps Shortcut in the menu bar. Quit from the menu bar to stop it completely.</p>}
    </WindowFrame>
  )
}
