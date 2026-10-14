import { getSection } from '../data/bank'
import type { Question } from '../types'

interface Props {
  questions: Question[]
  actionIcon: string
  actionLabel: string
  actionClass: string
  onAction: (id: string) => void
}

/** List of marked questions (favorites / excluded) with a per-item unmark button. */
export function QuestionList({ questions, actionIcon, actionLabel, actionClass, onAction }: Props) {
  return (
    <ul className="fav-list">
      {questions.map((q) => (
        <li key={q.id} className="card fav">
          <span className="chip" title={getSection(q.section)?.title}>{q.section}</span>
          <p>{q.text || '(question with image)'}</p>
          <button
            className={actionClass}
            onClick={() => onAction(q.id)}
            aria-label={actionLabel}
            title={actionLabel}
          >
            {actionIcon}
          </button>
        </li>
      ))}
    </ul>
  )
}
