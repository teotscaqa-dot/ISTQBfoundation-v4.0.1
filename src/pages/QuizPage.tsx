import { useSearchParams } from 'react-router-dom'
import { epic } from '../data/bank'
import { useExcluded } from '../storage/marks'
import { QuizRunner } from '../quiz/QuizRunner'

export function QuizPage() {
  const [params] = useSearchParams()
  const excluded = useExcluded()
  const sections = new Set((params.get('s') ?? '').split(','))
  // QuizRunner builds its deck once, so excluding mid-quiz takes effect on the next restart.
  const questions = epic.questions.filter((q) => sections.has(q.section) && !excluded.includes(q.id))
  return (
    <QuizRunner key={params.get('s')} questions={questions} backTo="/" backLabel="Back to topics" />
  )
}
