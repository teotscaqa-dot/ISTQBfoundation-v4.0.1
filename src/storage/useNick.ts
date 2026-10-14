import { useSyncExternalStore } from 'react'
import { deleteCookie, getCookie, setCookie } from './cookie'

const COOKIE = 'istqb_nick'
const listeners = new Set<() => void>()
let nick = getCookie(COOKIE) ?? ''

export function saveNick(value: string): void {
  nick = value.trim().slice(0, 32)
  if (nick) setCookie(COOKIE, nick)
  else deleteCookie(COOKIE)
  listeners.forEach((l) => l())
}

export function useNick(): string {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => nick,
  )
}
