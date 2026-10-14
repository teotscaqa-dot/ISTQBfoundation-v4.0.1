import type { Question } from '../types'

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Shuffles the options of a question and remaps the correct indexes. */
function shuffleOptions(q: Question): Question {
  const order = shuffle(q.options.map((_, i) => i))
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correct: order.flatMap((orig, pos) => (q.correct.includes(orig) ? [pos] : [])),
  }
}

export function buildDeck(questions: readonly Question[]): Question[] {
  return shuffle(questions).map(shuffleOptions)
}
