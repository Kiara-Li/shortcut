import { Check, Circle, Copy, EyeOff, Frame, Group, LockKeyhole, Maximize2, Minus, MousePointer2, PenTool, RectangleHorizontal, Ruler, Type, ZoomIn } from 'lucide-react'
import type { Card } from '@/lib/deck'

const ICONS: Record<string, typeof Copy> = {
  'Cmd+C': Copy, K: Maximize2, R: RectangleHorizontal, O: Circle, L: Minus,
  F: Frame, 'Cmd+Shift+H': EyeOff, 'Cmd+Shift+L': LockKeyhole, 'Cmd+D': Copy,
  'Shift+R': Ruler, 'Shift+1': ZoomIn, V: MousePointer2, P: PenTool, T: Type, 'Cmd+G': Group,
}

export function AchievementBadge({ card, unlocked }: { card: Card; unlocked: boolean }) {
  const Icon = ICONS[card.fromKeys] ?? KeyboardFallback
  return <span className={`achievement-medal${unlocked ? ' is-unlocked' : ''}`} aria-hidden="true">
    <span className="medal-ribbons"><i /><i /></span>
    <span className="medal-rim"><span className="medal-face"><Icon size={36} strokeWidth={1.5} /></span></span>
    <span className="medal-status">{unlocked ? <Check size={13} strokeWidth={3} /> : <LockKeyhole size={12} strokeWidth={2} />}</span>
  </span>
}

function KeyboardFallback({ size = 36, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return <Frame size={size} strokeWidth={strokeWidth} />
}
