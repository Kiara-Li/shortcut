import { comboId, parseCombo, type Combo } from './shortcuts'
export { comboId, parseCombo, parseSequence, type Combo } from './shortcuts'
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
  aliases?: string[]
  category?: string
  intercept?: boolean
  availability?: 'shortcut' | 'manual' | 'figma-only' | 'native'
  sources?: string[]
  context?: 'canvas' | 'reference-only'
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

/** Supported pairs share one catalog between the website and native app. */
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
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

export type Lookup =
  | { kind: 'card'; card: Card; pressed: Combo }
  | { kind: 'unknown'; pressed: Combo }

export function lookup(deck: Deck, pressed: Combo): Lookup {
  const id = comboId(pressed)
  const card = deck.cards.find((c) => [c.fromKeys, ...(c.aliases ?? [])].some((keys) => comboId(parseCombo(keys)) === id))
  return card ? { kind: 'card', card, pressed } : { kind: 'unknown', pressed }
}

export function cardById(deck: Deck, id: string): Card | null {
  return deck.cards.find((c) => c.id === id) ?? null
}
