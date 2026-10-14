export function getCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((c) => c.startsWith(name + '='))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

export function setCookie(name: string, value: string, maxAgeSeconds = 31536000): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`
}
