import { createPersistentStore } from './local'

/** Ids of every question the user has answered at least once (right or wrong), on this device. */
const store = createPersistentStore<string[]>('answered', [])

export function markAnswered(id: string): void {
  const ids = store.get()
  if (!ids.includes(id)) store.set([...ids, id])
}

export const useAnswered = store.use
export const clearAnswered = () => store.set([])
