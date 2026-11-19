/** Physical US QWERTY chords, shared by catalog lookup, hints and validation. */
export interface Combo {
  cmd: boolean
  shift: boolean
  alt?: boolean
  ctrl?: boolean
  key: string
}

const MODIFIERS: Record<string, 'cmd' | 'shift' | 'alt' | 'ctrl'> = {
  cmd: 'cmd', command: 'cmd', meta: 'cmd', shift: 'shift',
  alt: 'alt', option: 'alt', ctrl: 'ctrl', control: 'ctrl',
}
const NAMES: Record<string, string> = {
  ENTER: 'RETURN', ESC: 'ESCAPE', BACKSPACE: 'DELETE',
  ARROWLEFT: 'LEFT', ARROWRIGHT: 'RIGHT', ARROWUP: 'UP', ARROWDOWN: 'DOWN',
}
const SPECIAL = new Set(['RETURN', 'ESCAPE', 'DELETE', 'FORWARDDELETE', 'SPACE', 'TAB',
  'LEFT', 'RIGHT', 'UP', 'DOWN', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN'])
const SYMBOL_KEYS = new Set('=-[];\'\\,./`'.split(''))

export function parseCombo(text: string): Combo {
  let value = text.trim()
  let plus = false
  if (value === '+') { value = '='; plus = true }
  else if (value.endsWith('++')) { value = `${value.slice(0, -1)}=`; plus = true }
  const parts = value.split('+').map((part) => part.trim())
  const combo: Combo = { cmd: false, shift: plus, alt: false, ctrl: false, key: '' }
  for (const part of parts.slice(0, -1)) {
    const modifier = MODIFIERS[part.toLowerCase()]
    if (!modifier) return combo
    combo[modifier] = true
  }
  const last = (parts.at(-1) ?? '').toUpperCase()
  const key = NAMES[last] ?? last
  if (/^[A-Z0-9]$/.test(key) || /^F([1-9]|1[0-9]|20)$/.test(key) || SPECIAL.has(key) || SYMBOL_KEYS.has(key)) combo.key = key
  return combo
}

export function comboId(combo: Combo): string {
  return `${combo.ctrl ? 'ctrl+' : ''}${combo.alt ? 'alt+' : ''}${combo.cmd ? 'cmd+' : ''}${combo.shift ? 'shift+' : ''}${combo.key}`
}

/** ', ' separates chords; ',' alone is a real keyboard key. */
export function parseSequence(text: string): Combo[] {
  const sequence = text.split(', ').map(parseCombo)
  return sequence.every((combo) => combo.key) ? sequence : []
}
