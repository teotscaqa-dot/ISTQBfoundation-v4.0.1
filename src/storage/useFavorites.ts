import { createPersistentStore } from './local'

const store = createPersistentStore<string[]>('favorites', [])

export function toggleFavorite(id: string): void {
  const ids = store.get()
  store.set(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])
}

export function clearFavorites(): void {
  store.set([])
}

export const useFavorites = store.use
