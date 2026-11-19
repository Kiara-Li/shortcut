import { Check, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { APPS, DECKS, type AppId, type Pair } from '@/lib/deck'
import { AppIcon } from './AppIcon'

export function PairForm({ initial, onSubmit }: { initial: Pair; onSubmit: (pair: Pair) => void }) {
  const id = useId()
  const [to, setTo] = useState<AppId>(initial.to)
  const [saved, setSaved] = useState(false)
  const [previousTarget, setPreviousTarget] = useState(initial.to)
  if (previousTarget !== initial.to) {
    setPreviousTarget(initial.to)
    if (to !== initial.to) {
      setTo(initial.to)
      setSaved(false)
    }
  }
  const options = DECKS.filter((deck) => deck.from === initial.from)

  return <form className="pair-form" aria-label="App you’re using" onSubmit={(event) => {
    event.preventDefault()
    if (!options.some((deck) => deck.to === to)) return
    onSubmit({ from: initial.from, to })
    setSaved(true)
  }}>
    <label htmlFor={id} className="sr-only">App you’re using</label>
    <div className="app-select">
      <AppIcon app={to} size={48} />
      <select id={id} name="target-app" value={to} onChange={(event) => { setTo(event.target.value as AppId); setSaved(false) }}>
        {options.map((deck) => <option key={deck.to} value={deck.to}>{APPS[deck.to].name}</option>)}
      </select>
      <ChevronDown size={20} aria-hidden="true" />
    </div>
    <Button type="submit" className="save-app-button">{saved ? <><Check size={20} aria-hidden="true" />Saved</> : 'Save changes'}</Button>
    <p role="status" className="sr-only">{saved ? 'App changes saved.' : ''}</p>
  </form>
}
