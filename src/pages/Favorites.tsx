import { Link } from 'react-router-dom'
import { epic, getSection } from '../data/bank'
import { toggleFavorite, useFavorites } from '../storage/useFavorites'
import { QuizRunner } from '../quiz/QuizRunner'

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
          <ul className="fav-list">
            {questions.map((q) => (
              <li key={q.id} className="card fav">
                <span className="chip" title={getSection(q.section)?.title}>{q.section}</span>
                <p>{q.text || '(question with image)'}</p>
                <button
                  className="star on"
                  onClick={() => toggleFavorite(q.id)}
                  aria-label="Remove from favorites"
                  title="Remove from favorites"
                >
                  ★
                </button>
              </li>
            ))}
          </ul>
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
