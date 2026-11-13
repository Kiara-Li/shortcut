import { useSyncExternalStore } from 'react'
import type { Pair } from '@/lib/deck'
import type { AchievementEntry, Bridge, SavedEntry, ShowCardRequest } from './types'

interface DesktopState {
  pair: Pair | null
  saved: Record<string, SavedEntry>
  achievements?: Record<string, AchievementEntry>
}

export interface DesktopStatus {
  accessibility: boolean
  listening: boolean
  paused: boolean
  scope: 'target' | 'all'
  foregroundApp: string
  targetActive: boolean
  secureInput: boolean
  lastTrigger: string
  error: string | null
}

declare global {
  interface Window {
    shortcutNative?: { state: DesktopState; status: DesktopStatus; overlay: boolean; celebration: boolean }
    webkit?: { messageHandlers: { shortcut: { postMessage: (message: unknown) => void } } }
  }
}

export const isDesktop = !!window.shortcutNative
export const isOverlay = window.shortcutNative?.overlay ?? false
export const isCelebration = window.shortcutNative?.celebration ?? false
let state = window.shortcutNative?.state ?? { pair: null, saved: {} }
let savedList = Object.values(state.saved)
let achievementList = Object.values(state.achievements ?? {})
let status = window.shortcutNative?.status ?? null
const listeners = new Set<() => void>()
const statusListeners = new Set<() => void>()
const cardListeners = new Set<(request: ShowCardRequest) => void>()
const achievementListeners = new Set<(entry: AchievementEntry) => void>()

export function desktopCommand(action: string, value?: unknown) {
  window.webkit?.messageHandlers.shortcut.postMessage({ action, value })
}

window.addEventListener('shortcut-native', (event) => {
  const message = (event as CustomEvent).detail
  if (message.type === 'state') {
    state = message.value
    savedList = Object.values(state.saved)
    achievementList = Object.values(state.achievements ?? {})
    listeners.forEach((listener) => listener())
  } else if (message.type === 'status') {
    status = message.value
    statusListeners.forEach((listener) => listener())
  } else if (message.type === 'card') {
    cardListeners.forEach((listener) => listener(message.value))
  } else if (message.type === 'achievement') {
    achievementListeners.forEach((listener) => listener(message.value))
  } else if (message.type === 'dismiss') {
    window.dispatchEvent(new Event('shortcut-dismiss'))
  } else if (message.type === 'flip') {
    window.dispatchEvent(new Event('shortcut-flip'))
  }
})

export function useDesktopStatus() {
  return useSyncExternalStore(
    (listener) => { statusListeners.add(listener); return () => { statusListeners.delete(listener) } },
    () => status,
  )
}

export const desktopBridge: Bridge = {
  getPair: () => state.pair,
  setPair: (pair) => desktopCommand('setPair', pair),
  getSavedCards: () => savedList,
  recordLookup: (cardId) => desktopCommand('recordLookup', cardId),
  clearSaved: () => desktopCommand('clearSaved'),
  getAchievements: () => achievementList,
  markTried: () => {},
  onAchievement: (listener) => {
    achievementListeners.add(listener)
    if (isCelebration) desktopCommand('celebrationReady')
    return () => { achievementListeners.delete(listener) }
  },
  resetAll: () => desktopCommand('resetAll'),
  showCard: (request) => desktopCommand('showCard', request),
  onCardShow: (listener) => {
    cardListeners.add(listener)
    // The native side keeps the latest request until React has subscribed.
    if (isOverlay) desktopCommand('overlayReady')
    return () => { cardListeners.delete(listener) }
  },
  subscribe: (listener) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
