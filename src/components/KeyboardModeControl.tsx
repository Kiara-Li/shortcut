import { ArrowRight, Check, Keyboard, MousePointer2, Pause, Play, Zap } from 'lucide-react'
import { useState } from 'react'
import { desktopCommand, type DesktopStatus } from '@/bridge/desktop'
import { setPreviewPreferences, usePreviewPreferences } from '@/bridge/preview'
import type { Deck } from '@/lib/deck'
import { Button } from './ui/button'

function ModeIllustration({ mode, targetKeys }: { mode: 'learn' | 'remap'; targetKeys: string }) {
  return <span className={`mode-art mode-art-${mode}`} aria-hidden="true">
    <span className="art-key art-source">K</span>
    {mode === 'learn' ? <>
      <span className="art-hint"><span className="art-hint-line" /><span>{targetKeys}</span><span className="art-hint-lines"><i /><i /></span></span>
      <MousePointer2 className="art-cursor" size={27} strokeWidth={1.6} />
    </> : <>
      <span className="art-connector"><ArrowRight size={24} strokeWidth={2} /></span>
      <span className="art-key art-target">{targetKeys}</span>
      <Zap className="art-zap" size={20} fill="currentColor" />
    </>}
  </span>
}

export function KeyboardModeControl({ status, deck }: { status: DesktopStatus | null; deck: Deck }) {
  const preview = usePreviewPreferences()
  const mode = status?.interactionMode ?? preview.mode
  const enabled = status ? status.keyboardMode === 'figma' : preview.enabled
  const targetKeys = deck.to === 'photoshop' ? '⌘T' : 'S'

  return <fieldset className="settings-panel mode-panel">
    <legend className="sr-only">Shortcut mode</legend>
    <div className="mode-choice-grid">
      {([{ id: 'learn', label: 'Learning' }, { id: 'remap', label: 'Direct remap' }] as const).map((choice) => <label className="mode-choice" key={choice.id}>
        <input type="radio" name="interaction-mode" className="sr-only" value={choice.id} checked={mode === choice.id}
          onChange={() => status ? desktopCommand('setInteractionMode', choice.id) : setPreviewPreferences({ mode: choice.id })} />
        <span className="choice-check" aria-hidden="true">{mode === choice.id && <Check size={15} strokeWidth={2.5} />}</span>
        <ModeIllustration mode={choice.id} targetKeys={targetKeys} />
        <span className="mode-choice-title">{choice.label}</span>
      </label>)}
    </div>
    <div className="mode-footer">
      <label htmlFor="figma-mode">Figma Mode</label>
      {status && <button type="button" className="listener-pause" aria-label={status.paused ? 'Resume listening' : 'Pause listening'} title={status.paused ? 'Resume listening' : 'Pause listening'}
        onClick={() => desktopCommand('setPaused', !status.paused)}>{status.paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}</button>}
      <span className="mode-state" aria-hidden="true">{enabled ? 'On' : 'Off'}</span>
      <input id="figma-mode" name="figma-mode" type="checkbox" role="switch" checked={enabled} className="mode-switch"
        onChange={(event) => status ? desktopCommand('setKeyboardMode', event.target.checked ? 'figma' : 'native') : setPreviewPreferences({ enabled: event.target.checked })} />
    </div>
    {status && !status.accessibility && <div className="mode-notice" role="status"><span>Accessibility access needed</span><Button type="button" onClick={() => desktopCommand('requestPermission')}>Allow access</Button></div>}
    {status?.secureInput && <p className="mode-notice" role="status">Keyboard input protected</p>}
    {status?.paused && <p className="mode-notice" role="status">Listening paused</p>}
    {status?.error && <p className="mode-notice" role="alert">{status.error}</p>}
  </fieldset>
}

const SWITCH_KEYS = [
  { id: 'controlShiftSpace', label: '⌃⇧Space' },
  { id: 'controlOptionBackslash', label: '⌃⌥\\' },
  { id: 'controlOptionReturn', label: '⌃⌥Return' },
] as const

export function ModeHotKeyPicker({ status }: { status: DesktopStatus }) {
  const [chosen, setChosen] = useState(status.modeHotKey)
  return <details className="shortcut-picker">
    <summary><Keyboard size={20} aria-hidden="true" /><span>Keyboard shortcut</span><kbd>{status.modeHotKeyLabel}</kbd></summary>
    <form aria-label="Toggle shortcut" onSubmit={(event) => { event.preventDefault(); desktopCommand('setModeHotKey', chosen) }}>
      <fieldset>
        <legend className="sr-only">Toggle Figma Mode</legend>
        <div className="hotkey-options">{SWITCH_KEYS.map((key) => <label key={key.id}>
          <input type="radio" name="switch-shortcut" value={key.id} checked={chosen === key.id} onChange={() => setChosen(key.id)} />{key.label}
        </label>)}</div>
      </fieldset>
      <Button type="submit">Apply</Button>
      {status.modeHotKeyError && <p role="alert" className="mode-notice">{status.modeHotKeyError}</p>}
    </form>
  </details>
}
