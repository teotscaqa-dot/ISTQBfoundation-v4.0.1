import { useEffect, useState } from 'react'
import type { Question } from '../types'
import { toggleExcluded, toggleFavorite, useExcluded, useFavorites } from '../storage/marks'
import { getSection, imageUrl } from '../data/bank'

interface Props {
  question: Question
  isLast: boolean
  onAnswered: (correct: boolean) => void
  onNext: () => void
}

export function QuestionCard({ question, isLast, onAnswered, onNext }: Props) {
  const [selected, setSelected] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const favorites = useFavorites()
  const isFavorite = favorites.includes(question.id)
  const isExcluded = useExcluded().includes(question.id)
  const multi = question.correct.length > 1
  const section = getSection(question.section)
  const isCorrect =
    selected.length === question.correct.length && selected.every((i) => question.correct.includes(i))

  function choose(index: number) {
    if (revealed) return
    const next = selected.includes(index)
      ? selected.filter((i) => i !== index)
      : [...selected, index]
    setSelected(next)
    if (next.length === question.correct.length) {
      setRevealed(true)
      onAnswered(next.every((i) => question.correct.includes(i)))
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const n = Number(e.key)
      if (n >= 1 && n <= question.options.length) choose(n - 1)
      else if (revealed && (e.key === 'Enter' || e.key === 'ArrowRight')) {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function optionClass(i: number) {
    if (!revealed) return selected.includes(i) ? 'option picked' : 'option'
    if (question.correct.includes(i)) return 'option correct'
    if (selected.includes(i)) return 'option wrong'
    return 'option dim'
  }

  return (
    <article className="card">
      <div className="card-meta">
        <span className="chip">{question.section} · {section?.title}</span>
        <div className="marks">
          <button
            className={isExcluded ? 'exclude on' : 'exclude'}
            onClick={() => toggleExcluded(question.id)}
            aria-pressed={isExcluded}
            aria-label={isExcluded ? 'Bring back to quizzes' : 'Exclude from quizzes'}
            title={isExcluded ? 'Bring back to quizzes' : 'Exclude from quizzes'}
          >
            ⊘
          </button>
          <button
            className={isFavorite ? 'star on' : 'star'}
            onClick={() => toggleFavorite(question.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>
      {isExcluded && <p className="excluded-note">Excluded — won't appear in topic quizzes.</p>}

      {question.text && <h2 className="question-text">{question.text}</h2>}
      {question.image && (
        <img className="question-img" src={imageUrl(question.image)} alt="Question illustration" />
      )}
      {multi && !revealed && (
        <p className="hint">
          Select {question.correct.length} answers ({selected.length}/{question.correct.length})
        </p>
      )}

      <ol className="options">
        {question.options.map((opt, i) => (
          <li key={i}>
            <button className={optionClass(i)} onClick={() => choose(i)} disabled={revealed}>
              <span className="key">{i + 1}</span>
              <span>{opt}</span>
            </button>
          </li>
        ))}
      </ol>

      {revealed && (
        <div className={isCorrect ? 'feedback ok' : 'feedback bad'} role="status">
          <strong>{isCorrect ? 'Correct!' : 'Wrong'}</strong>
          {question.explanation && <p>{question.explanation}</p>}
        </div>
      )}

      {revealed && (
        <div className="next-bar">
          <button className="btn primary" onClick={onNext} autoFocus>
            {isLast ? 'See results' : 'Next →'}
          </button>
        </div>
      )}
    </article>
  )
}
