import { Link } from 'react-router-dom'
import { epic } from '../data/bank'
import { toggleFavorite, useFavorites } from '../storage/marks'
import { QuizRunner } from '../quiz/QuizRunner'
import { QuestionList } from './QuestionList'

function useFavoriteQuestions() {
  const ids = useFavorites()
  return epic.questions.filter((q) => ids.includes(q.id))
}

export function Favorites() {
  const questions = useFavoriteQuestions()

  return (
    <section>
      <h1>Favorites</h1>
      {questions.length === 0 ? (
        <p className="muted">
          No favorites yet. Tap ☆ on any question during a quiz to save it here.
        </p>
      ) : (
        <>
          <QuestionList
            questions={questions}
            actionIcon="★"
            actionLabel="Remove from favorites"
            actionClass="star on"
            onAction={toggleFavorite}
          />
          <div className="next-bar">
            <Link className="btn primary" to="/favorites/quiz">
              Practice favorites · {questions.length}
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

export function FavoritesQuiz() {
  // QuizRunner builds its deck once, so un-starring mid-quiz only affects the next restart.
  const questions = useFavoriteQuestions()
  return <QuizRunner questions={questions} backTo="/favorites" backLabel="Back to favorites" />
}
