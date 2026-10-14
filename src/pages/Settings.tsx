import { useState } from 'react'
import { saveNick, useNick } from '../storage/useNick'
import { resetStreak, useStreak } from '../storage/useStreak'
import { clearFavorites, useFavorites } from '../storage/useFavorites'

export function Settings() {
  const nick = useNick()
  const [draft, setDraft] = useState(nick)
  const [saved, setSaved] = useState(false)
  const streak = useStreak()
  const favorites = useFavorites()

  return (
    <section>
      <h1>Settings</h1>

      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault()
          saveNick(draft)
          setSaved(true)
        }}
      >
        <label htmlFor="nick">Nickname</label>
        <div className="row">
          <input
            id="nick"
            value={draft}
            maxLength={32}
            placeholder="Your nickname"
            onChange={(e) => {
              setDraft(e.target.value)
              setSaved(false)
            }}
          />
          <button className="btn primary" type="submit">Save</button>
        </div>
        {saved && <p className="muted">Saved on this device.</p>}
      </form>

      <div className="card">
        <p>Streak: 🔥 {streak.current} · best {streak.best}</p>
        <button
          className="btn"
          onClick={() => confirm('Reset current and best streak?') && resetStreak()}
        >
          Reset streak
        </button>
      </div>

      <div className="card">
        <p>Favorites: {favorites.length}</p>
        <button
          className="btn"
          disabled={!favorites.length}
          onClick={() => confirm('Remove all favorites?') && clearFavorites()}
        >
          Clear favorites
        </button>
      </div>

      <p className="muted small">All data stays in this browser. Nothing is sent to a server.</p>
    </section>
  )
}
