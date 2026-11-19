import { useSyncExternalStore } from 'react'

/** Browser-only preferences. These never enable or intercept system shortcuts. */
interface PreviewPreferences {
  mode: 'learn' | 'remap'
  enabled: boolean
}
const KEY = 'shortcut-preview/v1'
const DEFAULT: PreviewPreferences = { mode: 'learn', enabled: false }

function read(): PreviewPreferences {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    return { mode: value?.mode === 'remap' ? 'remap' : 'learn', enabled: value?.enabled === true }
  } catch { return DEFAULT }
}

let preferences = read()
const listeners = new Set<() => void>()
function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => { listeners.delete(callback) }
}

window.addEventListener('storage', (event) => {
  if (event.key !== KEY && event.key !== null) return
  preferences = read()
  listeners.forEach((callback) => callback())
})

export function usePreviewPreferences() {
  return useSyncExternalStore(subscribe, () => preferences)
}

export function setPreviewPreferences(next: Partial<PreviewPreferences>) {
  preferences = { ...preferences, ...next }
  try { localStorage.setItem(KEY, JSON.stringify(preferences)) } catch { /* Keep this session usable. */ }
  listeners.forEach((callback) => callback())
}

export function resetPreviewPreferences() {
  setPreviewPreferences(DEFAULT)
}
