import { useSearchParams } from 'react-router-dom'
import { epic } from '../data/bank'
import { QuizRunner } from '../quiz/QuizRunner'

export function QuizPage() {
  const [params] = useSearchParams()
  const sections = new Set((params.get('s') ?? '').split(','))
  const questions = epic.questions.filter((q) => sections.has(q.section))
  return (
    <QuizRunner key={params.get('s')} questions={questions} backTo="/" backLabel="Back to topics" />
  )
}
