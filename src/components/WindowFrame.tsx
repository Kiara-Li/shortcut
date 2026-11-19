import { Command } from 'lucide-react'
import type { ReactNode } from 'react'
import { isDesktop } from '@/bridge/desktop'

export function WindowFrame({ title, children }: { title: string; children: ReactNode }) {
  return <section className="app-page" aria-label={title}>
    <header className="app-header">
      <a href="#/settings" className="app-brand" aria-label="Shortcut settings">
        <span className="brand-mark"><Command size={19} strokeWidth={1.8} aria-hidden="true" /></span>
        Shortcut
      </a>
      {!isDesktop && <span className="preview-label">Web preview</span>}
    </header>
    <div className="page-content">{children}</div>
  </section>
}

export function ScreenHeading({ children }: { children: ReactNode }) {
  return <div className="screen-heading"><h1 tabIndex={-1}>{children}</h1></div>
}
