import { useState } from 'react'
import { bridge, usePair } from '@/bridge'
import { isDesktop, useDesktopStatus } from '@/bridge/desktop'
import { ModeHotKeyPicker } from '@/components/KeyboardModeControl'
import { comboLabel } from '@/components/KeyCombo'
import { PairForm } from '@/components/PairForm'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import { Button } from '@/components/ui/button'
import { parseCombo, type Deck } from '@/lib/deck'
import { navigate } from '@/lib/router'

/**
 * Change the two apps, see keyboard triggers, reset data.
 * TODO(design): needs design (only the window chrome comes from the designs).
 */
export function Settings({ deck }: { deck: Deck }) {
  const pair = usePair()
  const status = useDesktopStatus()
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <WindowFrame title="Settings" className="pb-[calc(var(--size-tabbar)+1rem)]">
      <ScreenHeading sub="Use a shortcut you know to find its equivalent here.">Set up a relationship</ScreenHeading>

      <PairForm
        initial={pair}
        submitLabel={savedAt ? 'Saved ✓' : 'Save'}
        onSubmit={(p) => {
          bridge.setPair(p)
          setSavedAt(Date.now())
        }}
        onEdit={() => setSavedAt(null)}
      />
      {status && <ModeHotKeyPicker key={status.modeHotKey} status={status} />}

      <section className="mt-8 border-t border-field-border pt-6" aria-labelledby="kb-title">
        <h3 id="kb-title" className="text-body font-semibold">
          Desktop shortcuts
        </h3>
        <p className="mt-1 text-small text-window-ink-muted">
          Choose Learning or Direct remap in the menu-bar panel, then turn on Figma Mode.
          Turn off to restore the target app’s original shortcuts and stop lookups. Shared shortcuts pass through.
          Learning shows what to press. Direct remap sends supported target shortcuts for you and shows brief feedback. Requires Accessibility permission and the apps’ default keymaps.
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {deck.cards.map((c) => (
            <li key={c.id} className="rounded-md bg-tile px-2 py-1 text-tiny text-window-ink-muted">
              {comboLabel(parseCombo(c.fromKeys))}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 border-t border-field-border pt-6" aria-labelledby="data-title">
        <h3 id="data-title" className="text-body font-semibold">
          Your data
        </h3>
        <p className="mt-1 text-small text-window-ink-muted">
          {isDesktop ? 'Your app pair and saved cards are stored locally in the macOS app.' : 'Browser settings and saved cards stay in this browser; they are separate from the macOS app.'} Nothing is sent anywhere.
        </p>
        <div className="mt-3">
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2 text-small text-window-ink-muted">
              Reset your app pair, saved cards and achievements?
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  bridge.resetAll()
                  navigate('home')
                }}
              >
                Reset
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setConfirmReset(true)}>
              Reset everything
            </Button>
          )}
        </div>
      </section>
    </WindowFrame>
  )
}
