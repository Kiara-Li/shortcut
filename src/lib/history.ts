import type { HistoryEntry } from '../bridge/types'

export interface HistoryAction {
  entry: HistoryEntry
  count: number
  firstUsedAt: number
  lastUsedAt: number
}

export interface HistoryDay {
  key: string
  date: number
  uses: number
  actions: HistoryAction[]
}

export function historyActionKey(entry: HistoryEntry): string {
  return JSON.stringify([entry.from, entry.to, entry.cardId, entry.fromKeys, entry.toKeys])
}

/** Group absolute timestamps by local calendar day, including DST transitions. */
export function groupHistory(entries: HistoryEntry[]): HistoryDay[] {
  const days = new Map<string, { day: HistoryDay; actions: Map<string, HistoryAction> }>()
  for (const entry of [...entries].sort((a, b) => b.usedAt - a.usedAt)) {
    const date = new Date(entry.usedAt)
    if (!Number.isFinite(date.getTime())) continue
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    let group = days.get(key)
    if (!group) {
      group = { day: { key, date: entry.usedAt, uses: 0, actions: [] }, actions: new Map() }
      days.set(key, group)
    }
    group.day.uses += 1
    const actionKey = historyActionKey(entry)
    const previous = group.actions.get(actionKey)
    if (previous) {
      previous.count += 1
      previous.firstUsedAt = Math.min(previous.firstUsedAt, entry.usedAt)
    } else {
      const action = { entry, count: 1, firstUsedAt: entry.usedAt, lastUsedAt: entry.usedAt }
      group.actions.set(actionKey, action)
      group.day.actions.push(action)
    }
  }
  return [...days.values()].map(({ day }) => day)
}
