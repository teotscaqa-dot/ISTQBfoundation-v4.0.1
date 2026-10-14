import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { epic, questionCountBySection } from '../data/bank'
import { createPersistentStore } from '../storage/local'

const selectionStore = createPersistentStore<string[]>('selected-sections', [])
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
  const total = selected.reduce((sum, id) => sum + (questionCountBySection.get(id) ?? 0), 0)

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
        <span className="count">{epic.questions.length}</span>
      </label>

      {epic.chapters.map((c) => {
        const sections = epic.sections.filter((s) => s.chapter === c.id)
        const ids = sections.map((s) => s.id)
        const on = ids.filter((id) => selected.includes(id)).length
        const count = ids.reduce((sum, id) => sum + (questionCountBySection.get(id) ?? 0), 0)
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
                    <span className="count">{questionCountBySection.get(s.id) ?? 0}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      <div className="next-bar">
        <button
          className="btn primary"
          disabled={total === 0}
          onClick={() => navigate(`/quiz?s=${allSectionIds.filter((id) => selected.includes(id)).join(',')}`)}
        >
          Start · {total} questions
        </button>
      </div>
    </section>
  )
}
