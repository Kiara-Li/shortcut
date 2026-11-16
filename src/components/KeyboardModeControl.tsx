import { useState } from 'react'
import { desktopCommand, type DesktopStatus } from '@/bridge/desktop'
import { APPS, type AppId } from '@/lib/deck'
import { Button } from './ui/button'

export function KeyboardModeControl({ status, target }: { status: DesktopStatus; target: AppId }) {
  const on = status.keyboardMode === 'figma'
  return (
    <fieldset className="mb-5 rounded-card border border-field-border bg-field p-4" aria-describedby="mode-help">
      <legend className="px-1 text-body font-semibold">Figma Mode</legend>
      <div className="flex items-center justify-between gap-4 py-2">
        <label htmlFor="figma-mode" className="cursor-pointer">
          <span className="block text-lg font-semibold">{on ? 'On' : 'Off'}</span>
          <span className="mt-1 block text-small text-window-ink-muted">{on ? `${status.interactionMode === 'remap' ? 'Direct remap' : 'Learning'} in ${APPS[target].name}` : `Original ${APPS[target].name} shortcuts`}</span>
        </label>
        <input id="figma-mode" name="figma-mode" type="checkbox" role="switch" checked={on}
          onChange={(event) => desktopCommand('setKeyboardMode', event.target.checked ? 'figma' : 'native')}
          className="mode-switch" aria-label="Figma Mode" />
      </div>
      <fieldset className="mt-4" aria-describedby="behavior-help">
        <legend className="text-small font-semibold">How you want to work</legend>
        <div className="mt-3 grid gap-2">
          {([
            {id:'learn',title:'Learning',description:'See a hint, then press the target shortcut yourself.'},
            {id:'remap',title:'Direct remap',description:'Use supported Figma shortcuts directly. Brief feedback only.'},
          ] as const).map((mode) => <label key={mode.id}
            className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border p-3 ${status.interactionMode === mode.id ? 'border-brand-soft bg-tile' : 'border-field-border'}`}>
            <input type="radio" name="interaction-mode" value={mode.id} checked={status.interactionMode === mode.id}
              onChange={() => desktopCommand('setInteractionMode', mode.id)} className="mt-1 accent-brand" />
            <span><span className="block text-body font-semibold">{mode.title}</span>
              <span className="mt-1 block text-small text-window-ink-muted">{mode.description}</span></span>
          </label>)}
        </div>
      </fieldset>
      <p id="behavior-help" className="mt-3 text-small text-window-ink-muted">{status.remapSupported} of {status.remapTotal} shortcuts have an executable mapping, including shared keys. Auto layout has no direct equivalent. Uses the apps’ default keymaps.</p>
      <p id="mode-help" className="mt-3 text-small text-window-ink-muted">
        {status.modeHotKeyRegistered ? <>Press <kbd>{status.modeHotKeyLabel}</kbd> to turn on or off.</> : 'Choose a working toggle shortcut in Settings, or use the menu-bar switch.'}
      </p>
      <button type="button" onClick={() => desktopCommand('showModeControl')} className="mt-3 min-h-8 rounded-md text-small text-brand-soft underline underline-offset-4">Open menu-bar switch</button>
    </fieldset>
  )
}

const SWITCH_KEYS = [
  { id: 'controlShiftSpace', label: '⌃⇧Space' },
  { id: 'controlOptionBackslash', label: '⌃⌥\\' },
  { id: 'controlOptionReturn', label: '⌃⌥Return' },
] as const

/** Keyed by the active native registration so menu-bar changes refresh the choice. */
export function ModeHotKeyPicker({ status }: { status: DesktopStatus }) {
  const [chosen, setChosen] = useState(status.modeHotKey)
  return (
    <form onSubmit={(event) => { event.preventDefault(); desktopCommand('setModeHotKey', chosen) }} className="mt-6">
      <fieldset aria-describedby="switch-key-help">
        <legend className="text-body font-semibold">Toggle Figma Mode</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {SWITCH_KEYS.map((key) => (
            <label key={key.id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-tile px-3 text-small">
              <input type="radio" name="switch-shortcut" value={key.id} checked={chosen === key.id} onChange={() => setChosen(key.id)} className="accent-brand" />
              {key.label}
            </label>
          ))}
        </div>
      </fieldset>
      <p id="switch-key-help" className="mt-3 text-small text-window-ink-muted">{status.modeHotKeyRegistered ? `Currently registered: ${status.modeHotKeyLabel}.` : 'No switch shortcut is registered.'} If macOS reports a conflict, your previous working shortcut is kept.</p>
      <Button type="submit" size="sm" className="mt-3">Apply switch shortcut</Button>
      {status.modeHotKeyError && <p role="alert" className="mt-3 text-small text-window-ink-muted">{status.modeHotKeyError}</p>}
    </form>
  )
}
