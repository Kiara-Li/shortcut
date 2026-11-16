import { desktopCommand, useDesktopStatus } from '@/bridge/desktop'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import { Button } from '@/components/ui/button'
import { ShortcutSearch } from '@/components/ShortcutSearch'
import { KeyboardModeControl } from '@/components/KeyboardModeControl'
import { APPS, type Deck } from '@/lib/deck'

export function Home({ deck }: { deck: Deck }) {
  const status = useDesktopStatus()
  const target = APPS[deck.to].name
  const ready = status?.listening && !status.secureInput
  const remapping = status?.interactionMode === 'remap'
  const heading = !status ? `Find your shortcut in ${target}`
    : !status.accessibility ? 'Allow Accessibility access'
    : status.paused ? 'Listening is paused'
    : status.secureInput ? 'Secure Input is active'
    : ready ? status.keyboardMode === 'figma' ? `${remapping ? 'Direct remap' : 'Learning'} is on` : 'Figma Mode is off' : 'Shortcut listener unavailable'

  return (
    <WindowFrame title="Shortcut" className="pb-[calc(var(--size-tabbar)+1rem)]">
      <ScreenHeading sub={`${APPS[deck.from].name} shortcuts → ${APPS[deck.to].name}`}>{heading}</ScreenHeading>
      {!status && <ShortcutSearch key={deck.to} deck={deck} />}
      {status ? (
        <>
          <KeyboardModeControl status={status} target={deck.to} />
          <p role="status" className="rounded-xl bg-tile p-4 text-body">
            {!status.accessibility ? 'Enable Shortcut in System Settings → Privacy & Security → Accessibility, then return here.'
              : status.secureInput ? 'macOS is protecting keyboard input. Leave the password field or turn off Secure Keyboard Entry in the app that enabled it.'
              : status.paused ? 'Resume to look up shortcuts in your other apps.'
              : ready ? status.keyboardMode === 'figma'
                ? status.inputProtected ? 'Text input protected. Finish canvas text with ⌘Return or Esc to resume shortcuts.'
                  : status.modeActive ? remapping ? `Supported Figma shortcuts execute directly in ${target}. Keep working; feedback disappears automatically.` : `Learning is on in ${target}. Press a Figma shortcut to see a hint.`
                    : `Figma Mode is on. Switch to ${target} to use ${remapping ? 'direct remapping' : 'shortcut hints'}.`
                : `Figma Mode is off. ${target} uses its original shortcuts.`
              : status.error ?? 'Try reopening Shortcut after enabling permission.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!status.accessibility && <Button onClick={() => desktopCommand('requestPermission')}>Open Accessibility settings</Button>}
            {status.accessibility && <Button onClick={() => desktopCommand('setPaused', !status.paused)}>{status.paused ? 'Resume listening' : 'Pause listening'}</Button>}
          </div>
          <label htmlFor="all-apps" className="mt-6 flex items-center gap-3 text-small">
            <input id="all-apps" type="checkbox" checked={status.scope === 'all'}
              disabled={remapping}
              onChange={(event) => desktopCommand('setScope', event.target.checked ? 'all' : 'target')}
              aria-describedby="scope-hint" />
            Test learning lookups in any app
          </label>
          <p id="scope-hint" className="mt-2 text-small text-window-ink-muted">
            Learning only. Direct remap always stays in {target}; other apps keep their original shortcuts.
          </p>
          <p className="mt-4 text-small text-window-ink-muted">Current app: {status.foregroundApp || 'Unknown'}</p>
          {status.lastTrigger && <p className="mt-2 text-small text-window-ink-muted">Last query: {status.lastTrigger}</p>}
          {status.lastRemap && <p className="mt-2 text-small text-window-ink-muted">Last remap: {status.lastRemap}</p>}
        </>
      ) : (
        <div className="mt-7 space-y-4 border-t border-field-border pt-5 text-small text-window-ink-muted">
          <h3 className="text-body font-semibold text-window-ink">Want hints in your real apps?</h3>
          <p>System-wide shortcuts need the local macOS app. Start it from this project folder:</p>
          <pre className="overflow-x-auto rounded-xl bg-tile p-4 text-window-ink"><code>npm run desktop</code></pre>
          <p>This builds and opens <strong>Shortcut.app</strong>. Allow Accessibility access there, then use your actual applications. The website searches shortcuts and saves cards; it cannot intercept another app’s keyboard input.</p>
        </div>
      )}
      {status && <section className="mt-7 border-t border-field-border pt-5" aria-labelledby="try-title">
        <h3 id="try-title" className="text-body font-semibold">Try it in your real app</h3>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-small text-window-ink-muted">
          <li>Turn on <strong>Figma Mode</strong> from the menu-bar switch, or press <kbd>{status.modeHotKeyLabel}</kbd>.</li>
          <li>In {target}, select an object or layer. Press <kbd>K</kbd>{remapping ? ` to ${deck.to === 'photoshop' ? 'enter Free Transform' : 'select the Scale tool'} directly.` : ' to see the Scale hint at the top right.'}</li>
          <li>{remapping ? 'Drag to resize. You do not need to press the target shortcut again.' : <>Then press <kbd>{deck.to === 'photoshop' ? '⌘T (Free Transform)' : 'S'}</kbd>, and drag to resize. The hint does not execute it for you.</>}</li>
        </ol>
        <p className="mt-4 text-small text-window-ink-muted">{remapping ? 'A small, non-interactive notification confirms the shortcut was sent. Shared shortcuts such as ⌘C pass through. Sending a shortcut does not confirm a document edit.' : `Hints stay in the same corner. Choose View details for an explanation, or ⌃⌥Space while working in ${target}.`} Turn off to restore original shortcuts.</p>
      </section>}
      {status && <ShortcutSearch key={deck.to} deck={deck} />}
      {status && <p className="mt-6 text-tiny text-window-ink-muted">Closing this window keeps Shortcut in the menu bar. Quit from the menu bar to stop it completely.</p>}
    </WindowFrame>
  )
}
