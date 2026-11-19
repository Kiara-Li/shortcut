import { AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Circle, ClipboardPaste, Copy, EyeOff, Frame, Group, Hand, ImagePlus, Layers, LockKeyhole, Maximize2, Minus, MousePointer2, PanelLeftClose, PenLine, PenTool, Pipette, RectangleHorizontal, Redo2, Ruler, ScanLine, Scissors, SendToBack, BringToFront, Slice, SquareDashed, Trash2, Type, Undo2, Ungroup, Upload, ZoomIn, ZoomOut } from 'lucide-react'
import type { Card } from '@/lib/deck'

const ICONS: Record<string, typeof Copy> = {
  'Cmd+C': Copy, K: Maximize2, R: RectangleHorizontal, O: Circle, L: Minus,
  F: Frame, 'Cmd+Shift+H': EyeOff, 'Cmd+Shift+L': LockKeyhole, 'Cmd+D': Copy,
  'Shift+R': Ruler, 'Shift+1': ZoomIn, V: MousePointer2, P: PenTool, T: Type, 'Cmd+G': Group,
}

const ACTION_ICONS: Record<string, typeof Copy> = {
  pencil: PenLine, hand: Hand, slice: Slice, eyedropper: Pipette,
  'toggle-ui': PanelLeftClose, outlines: ScanLine, 'pixel-preview': SquareDashed,
  'layers-panel': Layers, 'zoom-in': ZoomIn, 'zoom-out': ZoomOut, 'zoom-100': Maximize2,
  cut: Scissors, paste: ClipboardPaste, undo: Undo2, redo: Redo2, delete: Trash2,
  export: Upload, 'place-image': ImagePlus, 'select-all': SquareDashed, ungroup: Ungroup,
  'bring-forward': BringToFront, 'bring-front': BringToFront,
  'send-backward': SendToBack, 'send-back': SendToBack,
  'nudge-left': ArrowLeft, 'big-nudge-left': ArrowLeft, 'nudge-right': ArrowRight, 'big-nudge-right': ArrowRight,
  'nudge-up': ArrowUp, 'big-nudge-up': ArrowUp, 'nudge-down': ArrowDown, 'big-nudge-down': ArrowDown,
  'text-align-left': AlignLeft, 'text-align-center': AlignCenter, 'text-align-right': AlignRight, 'text-align-justify': AlignJustify,
  'font-size-increase': Type, 'font-size-decrease': Type, 'swap-fill-stroke': Circle, join: PenTool,
}

export function AchievementBadge({ card, unlocked }: { card: Card; unlocked: boolean }) {
  const Icon = ACTION_ICONS[card.id] ?? ICONS[card.fromKeys] ?? KeyboardFallback
  return <span className={`achievement-medal${unlocked ? ' is-unlocked' : ''}`} aria-hidden="true">
    <span className="medal-ribbons"><i /><i /></span>
    <span className="medal-rim"><span className="medal-face"><Icon size={36} strokeWidth={1.5} /></span></span>
    <span className="medal-status">{unlocked ? <Check size={13} strokeWidth={3} /> : <LockKeyhole size={12} strokeWidth={2} />}</span>
  </span>
}

function KeyboardFallback({ size = 36, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return <Frame size={size} strokeWidth={strokeWidth} />
}
