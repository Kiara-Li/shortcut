import type { Pair } from '@/lib/deck'
import type { AchievementEntry, Bridge, HistoryEntry, SavedEntry, ShowCardRequest } from './types'

/**
 * Browser implementation of the bridge. All data lives in localStorage on
 * this device; nothing is sent anywhere.
 */

const STORAGE_KEY = 'shortcut-translator/v1'

interface Stored {
  pair: Pair | null
  saved: Record<string, SavedEntry>
  achievements: Record<string, AchievementEntry>
}

const EMPTY: Stored = { pair: { from: 'figma', to: 'photoshop' }, saved: {}, achievements: {} }

function read(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<Stored>
    return { pair: parsed.pair ?? EMPTY.pair, saved: parsed.saved ?? {}, achievements: parsed.achievements ?? {} }
  } catch {
    // Private mode, blocked storage or corrupt JSON: start fresh in memory.
    return EMPTY
  }
}

// In-memory copy so reads return stable references (needed by useSyncExternalStore)
// and the app still works if localStorage is unavailable.
let state: Stored = read()
let savedList: SavedEntry[] = Object.values(state.saved)
let achievementList = Object.values(state.achievements)

const changeListeners = new Set<() => void>()
const cardListeners = new Set<(req: ShowCardRequest) => void>()
const achievementListeners = new Set<(entry: AchievementEntry) => void>()
// Browser searches cannot create real cross-application usage records.
const history: HistoryEntry[] = []

function write(next: Stored) {
  state = next
  savedList = Object.values(next.saved)
  achievementList = Object.values(next.achievements)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // TODO: surface a "couldn't save" error state in the UI.
  }
  changeListeners.forEach((cb) => cb())
}

// Keep multiple tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return
    state = read()
    savedList = Object.values(state.saved)
    achievementList = Object.values(state.achievements)
    changeListeners.forEach((cb) => cb())
  })
}

export const localBridge: Bridge = {
  getPair: () => state.pair,
  setPair: (pair) => write({ ...state, pair }),

  getSavedCards: () => savedList,
  recordLookup: (cardId) => {
    const now = Date.now()
    const prev = state.saved[cardId]
    const entry: SavedEntry = prev
      ? { ...prev, count: prev.count + 1, lastSeen: now }
      : { cardId, count: 1, firstSeen: now, lastSeen: now }
    write({ ...state, saved: { ...state.saved, [cardId]: entry } })
  },
  clearSaved: () => write({ ...state, saved: {} }),
  getHistory: () => history,
  clearHistory: () => {},
  getAchievements: () => achievementList,
  markTried: (cardId) => {
    if (!state.pair || state.achievements[cardId]) return
    const entry: AchievementEntry = { cardId, ...state.pair, unlockedAt: Date.now(), method: 'self-reported' }
    write({ ...state, achievements: { ...state.achievements, [cardId]: entry } })
    achievementListeners.forEach((listener) => listener(entry))
  },
  onAchievement: (listener) => {
    achievementListeners.add(listener)
    return () => { achievementListeners.delete(listener) }
  },
  resetAll: () => write(EMPTY),

  showCard: (req) => cardListeners.forEach((cb) => cb(req)),
  onCardShow: (cb) => {
    cardListeners.add(cb)
    return () => cardListeners.delete(cb)
  },

  subscribe: (cb) => {
    changeListeners.add(cb)
    return () => changeListeners.delete(cb)
  },
}
