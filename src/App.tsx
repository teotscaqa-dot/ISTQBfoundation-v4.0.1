import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { useStreak } from './storage/useStreak'
import { useNick } from './storage/useNick'
import { Home } from './pages/Home'
import { QuizPage } from './pages/QuizPage'
import { Favorites, FavoritesQuiz } from './pages/Favorites'
import { Excluded } from './pages/Excluded'
import { Settings } from './pages/Settings'

function Header() {
  const { current, best } = useStreak()
  const nick = useNick()
  return (
    <header className="header">
      <nav>
        <NavLink to="/" end title="Topics">
          <span className="ico">☰</span><span className="label">Topics</span>
        </NavLink>
        <NavLink to="/favorites" title="Favorites">
          <span className="ico">★</span><span className="label">Favorites</span>
        </NavLink>
        <NavLink to="/excluded" title="Excluded">
          <span className="ico">⊘</span><span className="label">Excluded</span>
        </NavLink>
        <NavLink to="/settings" title="Settings" className="nick">
          {nick || <><span className="ico">⚙</span><span className="label">Settings</span></>}
        </NavLink>
      </nav>
      <span className="streak" title={`Best streak: ${best}`}>
        🔥 {current} <small>/ {best}</small>
      </span>
    </header>
  )
}

export function App() {
  return (
    <HashRouter>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/favorites/quiz" element={<FavoritesQuiz />} />
          <Route path="/excluded" element={<Excluded />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
