import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { parseSequence, type Combo } from '@/lib/deck'
import { cn } from '@/lib/utils'

const SYMBOLS = { cmd: '⌘', shift: '⇧', ctrl: '⌃', alt: '⌥' }
const KEY_LABELS: Record<string, string> = { LEFT: '←', RIGHT: '→', UP: '↑', DOWN: '↓', RETURN: '↩', TAB: '⇥', SPACE: 'Space', DELETE: '⌫', FORWARDDELETE: '⌦', ESCAPE: 'Esc', PAGEUP: 'PgUp', PAGEDOWN: 'PgDn', HOME: 'Home', END: 'End' }
const SPOKEN: Record<string, string> = { LEFT: 'Left arrow', RIGHT: 'Right arrow', UP: 'Up arrow', DOWN: 'Down arrow', RETURN: 'Return', TAB: 'Tab', SPACE: 'Space', DELETE: 'Delete', FORWARDDELETE: 'Forward delete', ESCAPE: 'Escape', PAGEUP: 'Page up', PAGEDOWN: 'Page down', HOME: 'Home', END: 'End', '\\': 'Backslash' }

/** Human label for a combo, e.g. "⌘⇧H". */
export function comboLabel(c: Combo, opts: { withTrigger?: boolean } = {}): string {
  return [
    opts.withTrigger ? SYMBOLS.ctrl + SYMBOLS.alt : '',
    c.ctrl ? SYMBOLS.ctrl : '',
    c.alt ? SYMBOLS.alt : '',
    c.cmd ? SYMBOLS.cmd : '',
    c.shift ? SYMBOLS.shift : '',
    KEY_LABELS[c.key] ?? c.key,
  ].join('')
}

/** Spoken label for screen readers, e.g. "Command Shift H". */
export function comboSpoken(c: Combo): string {
  return [c.ctrl && 'Control', c.alt && 'Option', c.cmd && 'Command', c.shift && 'Shift', SPOKEN[c.key] ?? c.key]
    .filter(Boolean)
    .join(' ')
}

/** One combo as keycaps: ⌘ ⇧ H */
export function KeyCaps({ combo, className }: { combo: Combo; className?: string }) {
  const caps = [combo.ctrl && SYMBOLS.ctrl, combo.alt && SYMBOLS.alt, combo.cmd && SYMBOLS.cmd, combo.shift && SYMBOLS.shift, KEY_LABELS[combo.key] ?? combo.key].filter(Boolean) as string[]
  return (
    <KbdGroup className={className} aria-label={comboSpoken(combo)}>
      {caps.map((cap, i) => (
        <Kbd
          key={i}
          className="h-[1.6em] min-w-[1.6em] rounded-keycap border border-keycap-border bg-keycap px-[0.4em] text-[1em] font-medium text-keycap-ink"
        >
          {cap}
        </Kbd>
      ))}
    </KbdGroup>
  )
}

/** A key sequence from the data file, e.g. "Cmd+C, Cmd+F" → [⌘ C] then [⌘ F] */
export function KeySequence({ keys, className }: { keys: string; className?: string }) {
  const seq = parseSequence(keys)
  return (
    <span className={cn('inline-flex flex-wrap items-center justify-center gap-1.5', className)}>
      {seq.map((combo, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="text-[0.8em] text-card-ink-soft">then</span>}
          <KeyCaps combo={combo} />
        </span>
      ))}
    </span>
  )
}
