import type { AppId } from '@/lib/deck'
import { cn } from '@/lib/utils'

/** Colored app tile as in the designs (Ai / Ps / Id letter tiles, Figma logo). */
const LETTER_TILES: Record<Exclude<AppId, 'figma'>, { letters: string; bg: string; ink: string }> = {
  illustrator: { letters: 'Ai', bg: 'var(--color-ai-bg)', ink: 'var(--color-ai-ink)' },
  photoshop: { letters: 'Ps', bg: 'var(--color-ps-bg)', ink: 'var(--color-ps-ink)' },
  indesign: { letters: 'Id', bg: 'var(--color-id-bg)', ink: 'var(--color-id-ink)' },
}

export function AppIcon({ app, size = 36, className }: { app: AppId; size?: number; className?: string }) {
  const style = { width: size, height: size }

  if (app === 'figma') {
    return (
      <span
        className={cn('inline-flex shrink-0 items-center justify-center rounded-icon', className)}
        style={{ ...style, background: 'var(--color-figma-bg)' }}
        aria-hidden
      >
        <svg viewBox="0 0 38 57" width={size * 0.42} height={size * 0.63}>
          <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
          <path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
          <path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
          <path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
          <path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
        </svg>
      </span>
    )
  }

  const t = LETTER_TILES[app]
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-icon font-bold leading-none', className)}
      style={{ ...style, background: t.bg, color: t.ink, fontSize: size * 0.5 }}
      aria-hidden
    >
      {t.letters}
    </span>
  )
}
