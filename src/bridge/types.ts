import type { AppId, Combo, Pair } from '@/lib/deck'

/**
 * The only way UI code talks to "the outside world" (storage, the OS).
 * The browser uses localStorage. The macOS app uses the native bridge and
 * UserDefaults, shared by its settings window and floating card window.
 */

export interface SavedEntry {
  cardId: string
  count: number
  firstSeen: number
  lastSeen: number
}

export interface ShowCardRequest {
  /** What was pressed, in the "from" app's terms. */
  pressed: Combo
  /** Screen position to place the card next to (cursor or tap point). Null = center. */
  at: { x: number; y: number } | null
  /** Where the request came from. 'saved' opens don't count as look-ups. */
  source: 'keyboard' | 'search' | 'saved'
}

export interface AchievementEntry {
  cardId: string
  from: AppId
  to: AppId
  unlockedAt: number
  method: 'shortcut' | 'self-reported'
}

export interface Bridge {
  getPair(): Pair | null
  setPair(pair: Pair): void

  getSavedCards(): SavedEntry[]
  recordLookup(cardId: string): void
  clearSaved(): void
  getAchievements(): AchievementEntry[]
  /** Browser only: explicit self-report, distinguished from native key detection. */
  markTried(cardId: string): void
  onAchievement(cb: (achievement: AchievementEntry) => void): () => void
  /** Clear saved cards and restore the default Figma → Photoshop pair. */
  resetAll(): void

  /** Ask for a flashcard to be shown. */
  showCard(req: ShowCardRequest): void
  /** Listen for flashcard requests. Returns an unsubscribe function. */
  onCardShow(cb: (req: ShowCardRequest) => void): () => void

  /** Listen for any stored-state change (pair or saved). Returns an unsubscribe function. */
  subscribe(cb: () => void): () => void
}
