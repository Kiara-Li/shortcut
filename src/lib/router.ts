import { useEffect, useSyncExternalStore } from 'react'

/** Hash routes keep refresh working on GitHub Pages (no server rewrites). */
export type Route = 'home' | 'saved' | 'achievements' | 'settings'

const ROUTES: Route[] = ['home', 'saved', 'achievements', 'settings']

function current(): Route {
  const name = window.location.hash.replace(/^#\/?/, '')
  return (ROUTES as string[]).includes(name) ? (name as Route) : 'home'
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute(): Route {
  const route = useSyncExternalStore(subscribe, current)
  useEffect(() => {
    document.title = `${route === 'saved' ? 'Saved cards' : route === 'settings' ? 'Settings' : route === 'achievements' ? 'Achievements' : 'Shortcut lookup'} · Shortcut`
  }, [route])
  return route
}

export function navigate(route: Route) {
  window.location.hash = `/${route}`
}
