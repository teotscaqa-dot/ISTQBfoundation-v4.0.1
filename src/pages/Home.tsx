import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { epic, questionCountBySection } from '../data/bank'
import { useExcluded, useFavorites } from '../storage/marks'
import { useAnswered } from '../storage/answered'
import { createPersistentStore } from '../storage/local'
import { filterToQuery, inRotation, selectQuestions } from '../quiz/selectQuestions'

const selectionStore = createPersistentStore<string[]>('selected-sections', [])
const optionsStore = createPersistentStore('quiz-options', { withFavorites: false, onlyNew: false })
const allSectionIds = epic.sections.map((s) => s.id)

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} />
}

export function Home() {
  const navigate = useNavigate()
  // Drop ids of sections that no longer exist after a re-import.
  const [selected, setSelected] = useState<string[]>(() =>
    selectionStore.get().filter((id) => questionCountBySection.has(id)),
  )
  const excluded = useExcluded()
  const favorites = useFavorites()
  const answered = useAnswered()
  const options = optionsStore.use()
  const { withFavorites, onlyNew } = options
  // Counts of questions that would go into a quiz: not excluded and, with "only new", not answered.
  const available = useMemo(() => {
    const ex = new Set(excluded)
    const ans = new Set(answered)
    const m = new Map<string, number>()
    epic.questions.forEach(
      (q) => inRotation(q, onlyNew, ex, ans) && m.set(q.section, (m.get(q.section) ?? 0) + 1),
    )
    return m
  }, [excluded, answered, onlyNew])
  const countOf = (id: string) => available.get(id) ?? 0
  const availableTotal = allSectionIds.reduce((sum, id) => sum + countOf(id), 0)
  const excludedCount = useMemo(() => {
    const ex = new Set(excluded)
    return epic.questions.filter((q) => ex.has(q.id)).length
  }, [excluded])
  const answeredCount = useMemo(() => {
    const ans = new Set(answered)
    return epic.questions.filter((q) => ans.has(q.id)).length
  }, [answered])
  const filter = { sections: allSectionIds.filter((id) => selected.includes(id)), withFavorites, onlyNew }
  const total = selectQuestions(epic.questions, filter, { favorites, excluded, answered }).length

  function update(next: string[]) {
    setSelected(next)
    selectionStore.set(next)
  }

  function toggleMany(ids: string[], on: boolean) {
    update(on ? [...new Set([...selected, ...ids])] : selected.filter((id) => !ids.includes(id)))
  }

  const allOn = selected.length === allSectionIds.length

  return (
    <section>
      <h1>{epic.title}</h1>
      <p className="muted">Pick topics. Questions are shuffled and checked instantly.</p>

      <label className="topic all">
        <Checkbox
          checked={allOn}
          indeterminate={!allOn && selected.length > 0}
          onChange={() => update(allOn ? [] : allSectionIds)}
        />
        <span>All topics</span>
        <span className="count">{availableTotal}</span>
      </label>

      {epic.chapters.map((c) => {
        const sections = epic.sections.filter((s) => s.chapter === c.id)
        const ids = sections.map((s) => s.id)
        const on = ids.filter((id) => selected.includes(id)).length
        const count = ids.reduce((sum, id) => sum + countOf(id), 0)
        return (
          <div key={c.id} className="chapter">
            <label className="topic chapter-head">
              <Checkbox
                checked={on === ids.length}
                indeterminate={on > 0 && on < ids.length}
                onChange={() => toggleMany(ids, on < ids.length)}
              />
              <span>{c.id}. {c.title}</span>
              <span className="count">{count}</span>
            </label>
            <ul className="topics">
              {sections.map((s) => (
                <li key={s.id}>
                  <label className="topic sub">
                    <Checkbox
                      checked={selected.includes(s.id)}
                      onChange={() => toggleMany([s.id], !selected.includes(s.id))}
                    />
                    <span>
                      <span className="num">{s.id}</span> {s.title}
                    </span>
                    <span className="count">{countOf(s.id)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {excludedCount > 0 && (
        <p className="muted small">
          {excludedCount} excluded questions are skipped. <Link to="/excluded">Manage</Link>
        </p>
      )}

      <div className="quiz-options">
        <label className="topic">
          <input
            type="checkbox"
            checked={withFavorites}
            onChange={() => optionsStore.set({ ...options, withFavorites: !withFavorites })}
          />
          <span>
            Mix in favorites
            <small className="muted">All starred questions, from any topic</small>
          </span>
          <span className="count">★ {favorites.length}</span>
        </label>
        <label className="topic">
          <input
            type="checkbox"
            checked={onlyNew}
            onChange={() => optionsStore.set({ ...options, onlyNew: !onlyNew })}
          />
          <span>
            Only new questions
            <small className="muted">
              Skip questions you've already answered{answeredCount > 0 && ` (${answeredCount})`}
            </small>
          </span>
        </label>
      </div>

      <div className="next-bar">
        <button
          className="btn primary"
          disabled={total === 0}
          onClick={() => navigate(`/quiz?${filterToQuery(filter)}`)}
        >
          Start · {total} questions
        </button>
      </div>
    </section>
  )
}
