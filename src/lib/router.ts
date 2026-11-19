import { useEffect, useSyncExternalStore } from 'react'

/** Hash routes keep refresh working on GitHub Pages. Old links resolve to their replacements. */
export type Route = 'history' | 'achievements' | 'settings'
const ROUTES: Route[] = ['history', 'achievements', 'settings']

function current(): Route {
  const name = window.location.hash.replace(/^#\/?/, '')
  if (name === 'saved') return 'achievements'
  return (ROUTES as string[]).includes(name) ? name as Route : 'settings'
}

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

export function useRoute(): Route {
  const route = useSyncExternalStore(subscribe, current)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.querySelector<HTMLElement>('.screen-heading h1')?.focus({ preventScroll: true })
    document.title = `${route === 'history' ? 'Recent history' : route === 'achievements' ? 'Achievements' : 'Settings'} · Shortcut`
  }, [route])
  return route
}
