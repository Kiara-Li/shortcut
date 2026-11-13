import figmaToIllustrator from '@/data/figma-to-illustrator.json'
import figmaToPhotoshop from '@/data/figma-to-photoshop.json'

/* ------------------------------------------------------------------ */
/* Apps                                                                */
/* ------------------------------------------------------------------ */

export type AppId = 'figma' | 'illustrator' | 'photoshop' | 'indesign'

export const APPS: Record<AppId, { id: AppId; name: string }> = {
  figma: { id: 'figma', name: 'Figma' },
  illustrator: { id: 'illustrator', name: 'Illustrator' },
  photoshop: { id: 'photoshop', name: 'Photoshop' },
  indesign: { id: 'indesign', name: 'InDesign' },
}

export const APP_ORDER: AppId[] = ['illustrator', 'figma', 'photoshop', 'indesign']

/* ------------------------------------------------------------------ */
/* Cards (shape of the JSON files in /src/data)                        */
/* ------------------------------------------------------------------ */

export type CardType = 'different-key' | 'same-key' | 'false-friend' | 'no-match'

export interface Card {
  id: string
  action: string
  /** Shortcut in the app you know, e.g. "Cmd+Shift+H". */
  fromKeys: string
  /** Shortcut in the app you're in now. null for no-match. "A, B" means press A then B. */
  toKeys: string | null
  type: CardType
  summary: string
  but: string | null
  noMatchAlternative: string | null
  verified: boolean
}

export interface Deck {
  from: AppId
  to: AppId
  cards: Card[]
}

export interface Pair {
  /** The app you already know. */
  from: AppId
  /** The app you're working in now. */
  to: AppId
}

/** Every pair we have content for. MVP: just one. Add a JSON file + a line here to add more. */
export const DECKS: Deck[] = [figmaToPhotoshop as Deck, figmaToIllustrator as Deck]

export function findDeck(pair: Pair | null): Deck | null {
  if (!pair) return null
  return DECKS.find((d) => d.from === pair.from && d.to === pair.to) ?? null
}

export function isSupportedPair(pair: Partial<Pair>): boolean {
  return DECKS.some(
    (d) => (!pair.from || d.from === pair.from) && (!pair.to || d.to === pair.to),
  )
}

/* ------------------------------------------------------------------ */
/* Key combos                                                          */
/* ------------------------------------------------------------------ */

export interface Combo {
  cmd: boolean
  shift: boolean
  /** Upper-case letter, digit or symbol: "K", "1", "\\". */
  key: string
}

const MOD_ALIASES: Record<string, 'cmd' | 'shift'> = {
  cmd: 'cmd',
  command: 'cmd',
  meta: 'cmd',
  shift: 'shift',
}

/** "Cmd+Shift+H" → { cmd, shift, key: "H" }. Only Cmd and Shift are used by the decks. */
export function parseCombo(text: string): Combo {
  const parts = text.split('+').map((p) => p.trim())
  const combo: Combo = { cmd: false, shift: false, key: '' }
  for (const part of parts) {
    const mod = MOD_ALIASES[part.toLowerCase()]
    if (mod) combo[mod] = true
    else combo.key = part.toUpperCase()
  }
  // "Cmd++" style edge case: a trailing "+" means the key itself is "+"
  if (!combo.key && text.endsWith('+')) combo.key = '+'
  return combo
}

export function comboId(c: Combo): string {
  return `${c.cmd ? 'cmd+' : ''}${c.shift ? 'shift+' : ''}${c.key}`
}

/** Split "Cmd+C, Cmd+F" into a sequence of combos. */
export function parseSequence(text: string): Combo[] {
  return text.split(',').map((s) => parseCombo(s.trim()))
}

/** Map KeyboardEvent.code → key label. Using code (not key) because Option changes event.key on macOS. */
export function keyFromCode(code: string): string | null {
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  const map: Record<string, string> = {
    Backslash: '\\',
    Slash: '/',
    Minus: '-',
    Equal: '=',
    BracketLeft: '[',
    BracketRight: ']',
    Semicolon: ';',
    Quote: "'",
    Comma: ',',
    Period: '.',
    Backquote: '`',
  }
  return map[code] ?? null
}

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

export type Lookup =
  | { kind: 'card'; card: Card; pressed: Combo }
  | { kind: 'unknown'; pressed: Combo }

export function lookup(deck: Deck, pressed: Combo): Lookup {
  const id = comboId(pressed)
  const card = deck.cards.find((c) => comboId(parseCombo(c.fromKeys)) === id)
  return card ? { kind: 'card', card, pressed } : { kind: 'unknown', pressed }
}

export function cardById(deck: Deck, id: string): Card | null {
  return deck.cards.find((c) => c.id === id) ?? null
}
