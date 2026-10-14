import { useSyncExternalStore } from 'react'

const PREFIX = 'istqb:v1:'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Private mode or quota exceeded: keep working in memory only.
  }
}

/** A value persisted in localStorage and shared between all components that use it. */
export function createPersistentStore<T>(key: string, fallback: T) {
  let value = read(key, fallback)
  const listeners = new Set<() => void>()

  const get = () => value
  const set = (next: T) => {
    value = next
    write(key, next)
    listeners.forEach((l) => l())
  }
  const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  }
  const use = () => useSyncExternalStore(subscribe, get, get)

  return { get, set, use }
}
