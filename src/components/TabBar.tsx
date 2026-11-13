import { Bookmark, House, Settings, Trophy } from 'lucide-react'
import { navigate, type Route } from '@/lib/router'
import { cn } from '@/lib/utils'

/**
 * Navigation. The design uses a lavender side rail (Learn / Home / Check / Saved).
 * Learn and Check are out of scope for the MVP, so only Home / Saved / Settings.
 */
const TABS: { route: Route; label: string; Icon: typeof House }[] = [
  { route: 'home', label: 'Home', Icon: House },
  { route: 'saved', label: 'Saved', Icon: Bookmark },
  { route: 'achievements', label: 'Achievements', Icon: Trophy },
  { route: 'settings', label: 'Settings', Icon: Settings },
]

export function TabBar({ active }: { active: Route }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center bg-window/80 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur"
    >
      <ul className="flex w-full max-w-[420px] justify-around gap-1 rounded-window bg-rail p-1.5">
        {TABS.map(({ route, label, Icon }) => {
          const isActive = route === active
          return (
            <li key={route} className="flex-1">
              <button
                type="button"
                onClick={() => navigate(route)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center gap-0.5 rounded-[10px] py-1.5 text-small text-rail-ink transition-colors',
                  isActive ? 'bg-rail-active' : 'hover:bg-white/10',
                )}
              >
                <Icon className="size-5" strokeWidth={1.8} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
