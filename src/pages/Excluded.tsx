import { epic } from '../data/bank'
import { clearExcluded, toggleExcluded, useExcluded } from '../storage/marks'
import { QuestionList } from './QuestionList'

export function Excluded() {
  const ids = useExcluded()
  const questions = epic.questions.filter((q) => ids.includes(q.id))

  return (
    <section>
      <h1>Excluded</h1>
      {questions.length === 0 ? (
        <p className="muted">
          No excluded questions. Tap ⊘ on a question you no longer need to repeat — it will be
          skipped in topic quizzes.
        </p>
      ) : (
        <>
          <p className="muted">
            These {questions.length} questions are skipped in topic quizzes. Tap ⊘ to bring one back.
          </p>
          <QuestionList
            questions={questions}
            actionIcon="⊘"
            actionLabel="Bring back to quizzes"
            actionClass="exclude on"
            onAction={toggleExcluded}
          />
          <div className="next-bar">
            <button
              className="btn"
              onClick={() => confirm('Bring all excluded questions back?') && clearExcluded()}
            >
              Restore all · {questions.length}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
