import { useSearchParams } from 'react-router-dom'
import { epic } from '../data/bank'
import { useExcluded, useFavorites } from '../storage/marks'
import { useAnswered } from '../storage/answered'
import { QuizRunner } from '../quiz/QuizRunner'
import { filterFromQuery, selectQuestions } from '../quiz/selectQuestions'

export function QuizPage() {
  const [params] = useSearchParams()
  const marks = { favorites: useFavorites(), excluded: useExcluded(), answered: useAnswered() }
  // QuizRunner builds its deck once, so marks changed mid-quiz (excluded, favorites, answered)
  // take effect on the next restart.
  const questions = selectQuestions(epic.questions, filterFromQuery(params), marks)
  return <QuizRunner key={params.toString()} questions={questions} backTo="/" backLabel="Back to topics" />
}
