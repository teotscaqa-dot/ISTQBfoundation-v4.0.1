import { createPersistentStore } from './local'

/**
 * Per-question marks kept on the device.
 * Favorites and excluded are mutually exclusive: marking one clears the other.
 */
const favorites = createPersistentStore<string[]>('favorites', [])
const excluded = createPersistentStore<string[]>('excluded', [])

type Store = typeof favorites

function toggle(store: Store, other: Store, id: string): void {
  const ids = store.get()
  if (ids.includes(id)) {
    store.set(ids.filter((x) => x !== id))
  } else {
    store.set([...ids, id])
    if (other.get().includes(id)) other.set(other.get().filter((x) => x !== id))
  }
}

export const useFavorites = favorites.use
export const toggleFavorite = (id: string) => toggle(favorites, excluded, id)
export const clearFavorites = () => favorites.set([])

export const useExcluded = excluded.use
export const toggleExcluded = (id: string) => toggle(excluded, favorites, id)
export const clearExcluded = () => excluded.set([])
