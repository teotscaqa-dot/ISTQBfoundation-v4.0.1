import type { Question } from '../types'

export interface QuizFilter {
  sections: readonly string[]
  /** Add all favorites to the deck, whatever their section. */
  withFavorites: boolean
  /** Skip already answered questions of the selected sections. Favorites are added regardless. */
  onlyNew: boolean
}

export interface Marks {
  favorites: readonly string[]
  excluded: readonly string[]
  answered: readonly string[]
}

/** Whether a question of a selected section goes into the deck. */
export function inRotation(q: Question, onlyNew: boolean, excluded: Set<string>, answered: Set<string>) {
  return !excluded.has(q.id) && !(onlyNew && answered.has(q.id))
}

export function selectQuestions(all: readonly Question[], filter: QuizFilter, marks: Marks): Question[] {
  const sections = new Set(filter.sections)
  const excluded = new Set(marks.excluded)
  const answered = new Set(marks.answered)
  const favorites = new Set(filter.withFavorites ? marks.favorites : [])
  // Favorites and excluded are mutually exclusive, so a favorite is never excluded here.
  return all.filter(
    (q) => favorites.has(q.id) || (sections.has(q.section) && inRotation(q, filter.onlyNew, excluded, answered)),
  )
}

export function filterToQuery(f: QuizFilter): string {
  const p = new URLSearchParams({ s: f.sections.join(',') })
  if (f.withFavorites) p.set('fav', '1')
  if (f.onlyNew) p.set('new', '1')
  return p.toString()
}

export function filterFromQuery(p: URLSearchParams): QuizFilter {
  return {
    sections: (p.get('s') ?? '').split(',').filter(Boolean),
    withFavorites: p.get('fav') === '1',
    onlyNew: p.get('new') === '1',
  }
}
