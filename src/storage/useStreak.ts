import { createPersistentStore } from './local'

interface Streak {
  current: number
  best: number
}

const store = createPersistentStore<Streak>('streak', { current: 0, best: 0 })

export function recordAnswer(correct: boolean): void {
  const { current, best } = store.get()
  const next = correct ? current + 1 : 0
  store.set({ current: next, best: Math.max(best, next) })
}

export function resetStreak(): void {
  store.set({ current: 0, best: 0 })
}

export const useStreak = store.use
