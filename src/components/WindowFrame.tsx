import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Settings content. The native window provides the actual macOS window controls.
 */
export function WindowFrame({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'mx-auto flex min-h-full w-full max-w-[452px] flex-col bg-window sm:my-6 sm:min-h-[710px] sm:rounded-window sm:shadow-window',
        className,
      )}
    >
      <header className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <h1 className="text-window-title font-semibold text-window-title">{title}</h1>
      </header>
      <div className="flex flex-1 flex-col px-(--space-window-x) pt-4 pb-(--space-window-y)">{children}</div>
    </section>
  )
}

/** Big white heading used at the top of each window screen. */
export function ScreenHeading({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-heading leading-tight font-bold text-window-ink">{children}</h2>
      {sub && <p className="mt-3 text-body text-window-ink-muted">{sub}</p>}
    </div>
  )
}
