import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Question } from '../types'
import { buildDeck } from './buildDeck'
import { QuestionCard } from './QuestionCard'
import { recordAnswer, useStreak } from '../storage/useStreak'

interface Props {
  questions: Question[]
  backTo: string
  backLabel: string
}

export function QuizRunner({ questions, backTo, backLabel }: Props) {
  const [deck, setDeck] = useState(() => buildDeck(questions))
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(0)
  const { best } = useStreak()

  function restart() {
    setDeck(buildDeck(questions))
    setIndex(0)
    setCorrectCount(0)
    setAnswered(0)
  }

  if (deck.length === 0) {
    return (
      <div className="empty">
        <p>No questions to practice.</p>
        <Link className="btn" to={backTo}>{backLabel}</Link>
      </div>
    )
  }

  if (index >= deck.length) {
    const pct = Math.round((correctCount / deck.length) * 100)
    return (
      <div className="card summary">
        <h2>Done!</h2>
        <p className="big">{pct}%</p>
        <p>{correctCount} of {deck.length} correct · best streak 🔥 {best}</p>
        <div className="row">
          <button className="btn primary" onClick={restart}>Restart shuffled</button>
          <Link className="btn" to={backTo}>{backLabel}</Link>
        </div>
      </div>
    )
  }

  const q = deck[index]
  return (
    <>
      <div className="progress">
        <span>{index + 1} / {deck.length}</span>
        <span>✓ {correctCount} / {answered}</span>
      </div>
      <div className="bar"><div style={{ width: `${(index / deck.length) * 100}%` }} /></div>
      <QuestionCard
        key={`${index}-${q.id}`}
        question={q}
        isLast={index === deck.length - 1}
        onAnswered={(ok) => {
          recordAnswer(ok)
          setAnswered((n) => n + 1)
          if (ok) setCorrectCount((n) => n + 1)
        }}
        onNext={() => setIndex((i) => i + 1)}
      />
    </>
  )
}
