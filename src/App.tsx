import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { supabase } from './utils/supabase'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Auth from './pages/Auth'
import Market from './pages/Market'
import Admin from './pages/Admin'
import Tournament from './pages/Tournament'
import './App.css'

function App() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Router>
      <div style={{ backgroundColor: '#0a1628', minHeight: '100vh' }}>
        <nav className="navbar">
          <Link to="/" className="navbar-logo">
            <div className="hex"></div>
            HiveMind
          </Link>
          <div className="navbar-links">
            {user ? (
              <>
                <Link to="/feed">Feed</Link>
                <Link to="/tournament">Tournament</Link>
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to="/profile">Profile</Link>
                <button onClick={logout} className="btn-primary">Logout</button>
              </>
            ) : (
              <>
                <Link to="/tournament">Tournament</Link>
                <Link to="/auth">Login</Link>
                <Link to="/auth" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tournament" element={<Tournament />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/market/:id" element={<Market />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
