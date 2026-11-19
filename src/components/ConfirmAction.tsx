import { useId, useRef } from 'react'
import { Button } from './ui/button'

/** The native dialog supplies focus containment, Escape and focus restoration. */
export function ConfirmAction({ label, question, confirmLabel, onConfirm }: {
  label: string
  question: string
  confirmLabel: string
  onConfirm: () => void
}) {
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  return <>
    <Button type="button" variant="ghost" className="reset-button" onClick={() => dialog.current?.showModal()}>{label}</Button>
    <dialog ref={dialog} aria-labelledby={titleId} className="confirm-dialog">
      <h2 id={titleId}>{question}</h2>
      <form method="dialog">
        <Button autoFocus type="submit" variant="secondary">Cancel</Button>
        <Button type="submit" variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
      </form>
    </dialog>
  </>
}
