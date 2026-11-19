import { useState } from 'react'
import { bridge, usePair } from '@/bridge'
import { isDesktop, useDesktopStatus } from '@/bridge/desktop'
import { resetPreviewPreferences } from '@/bridge/preview'
import { ConfirmAction } from '@/components/ConfirmAction'
import { KeyboardModeControl, ModeHotKeyPicker } from '@/components/KeyboardModeControl'
import { PairForm } from '@/components/PairForm'
import { ScreenHeading, WindowFrame } from '@/components/WindowFrame'
import type { Deck } from '@/lib/deck'

export function Settings({ deck }: { deck: Deck }) {
  const pair = usePair() ?? { from: deck.from, to: deck.to }
  const status = useDesktopStatus()
  const [formVersion, setFormVersion] = useState(0)

  return <WindowFrame title="Settings">
    <ScreenHeading>Settings</ScreenHeading>
    <div className="settings-stack">
      <section aria-labelledby="mode-title">
        <h2 id="mode-title" className="section-title">Mode</h2>
        <KeyboardModeControl status={status} deck={deck} />
      </section>
      <section aria-labelledby="app-title">
        <h2 id="app-title" className="section-title">App you’re using</h2>
        <div className="settings-panel">
          <PairForm key={formVersion} initial={pair} onSubmit={(next) => bridge.setPair(next)} />
        </div>
      </section>
      {status && <ModeHotKeyPicker key={status.modeHotKey} status={status} />}
      <div className="settings-reset">
        <ConfirmAction label="Reset data" question="Reset all data?" confirmLabel="Reset" onConfirm={() => {
          bridge.resetAll()
          setFormVersion((version) => version + 1)
          if (!isDesktop) resetPreviewPreferences()
        }} />
      </div>
    </div>
  </WindowFrame>
}
