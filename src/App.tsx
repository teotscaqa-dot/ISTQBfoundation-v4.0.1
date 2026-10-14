import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { useStreak } from './storage/useStreak'
import { useNick } from './storage/useNick'
import { Home } from './pages/Home'
import { QuizPage } from './pages/QuizPage'
import { Favorites, FavoritesQuiz } from './pages/Favorites'
import { Settings } from './pages/Settings'

function Header() {
  const { current, best } = useStreak()
  const nick = useNick()
  return (
    <header className="header">
      <nav>
        <NavLink to="/" end>Topics</NavLink>
        <NavLink to="/favorites">★ Favorites</NavLink>
        <NavLink to="/settings">{nick || 'Settings'}</NavLink>
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
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
