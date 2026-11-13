import { useSyncExternalStore } from 'react'
import { localBridge } from './local'
import { desktopBridge, isDesktop } from './desktop'
import type { Bridge } from './types'

export type { AchievementEntry, Bridge, SavedEntry, ShowCardRequest } from './types'

export const bridge: Bridge = isDesktop ? desktopBridge : localBridge

export function usePair() {
  return useSyncExternalStore(bridge.subscribe, bridge.getPair)
}

export function useSavedCards() {
  return useSyncExternalStore(bridge.subscribe, bridge.getSavedCards)
}

export function useAchievements() {
  return useSyncExternalStore(bridge.subscribe, bridge.getAchievements)
}
