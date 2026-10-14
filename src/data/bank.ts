import type { Epic, Section } from '../types'
// Bundled into the app: no runtime request for questions. Regenerate with `npm run import`.
import data from './foundation-4.0.1.json'

export const epic = data as Epic

const sectionById = new Map(epic.sections.map((s) => [s.id, s]))

export function getSection(id: string): Section | undefined {
  return sectionById.get(id)
}

export const questionCountBySection = epic.questions.reduce((m, q) => {
  m.set(q.section, (m.get(q.section) ?? 0) + 1)
  return m
}, new Map<string, number>())

export function imageUrl(file: string): string {
  return `${import.meta.env.BASE_URL}q-img/${file}`
}
