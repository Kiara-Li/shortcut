import { History, SlidersHorizontal, Trophy } from 'lucide-react'
import type { Route } from '@/lib/router'

const TABS = [
  { route: 'history', label: 'History', Icon: History },
  { route: 'achievements', label: 'Achievements', Icon: Trophy },
  { route: 'settings', label: 'Settings', Icon: SlidersHorizontal },
] as const

export function TabBar({ active }: { active: Route }) {
  return <nav aria-label="Main" className="tab-bar">
    <ul>{TABS.map(({ route, label, Icon }) => <li key={route}>
      <a href={`#/${route}`} aria-current={route === active ? 'page' : undefined}>
        <Icon size={21} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span>
      </a>
    </li>)}</ul>
  </nav>
}
