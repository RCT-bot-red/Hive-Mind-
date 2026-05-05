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
          <Link to="/" className="navbar-logo" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <svg width="44" height="44" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="80,4 148,42 148,118 80,156 12,118 12,42" fill="none" stroke="#1a3a5c" strokeWidth="2"/>
              <polygon points="80,22 130,50 130,110 80,138 30,110 30,50" fill="none" stroke="#00B4D8" strokeWidth="2.5"/>
              <polygon points="80,44 108,60 108,100 80,116 52,100 52,60" fill="#00B4D8" fillOpacity="0.12" stroke="#00B4D8" strokeWidth="2"/>
              <line x1="80" y1="78" x2="80" y2="4" stroke="#00B4D8" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="80" y1="78" x2="148" y2="42" stroke="#00B4D8" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="80" y1="78" x2="148" y2="118" stroke="#00B4D8" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="80" y1="78" x2="80" y2="156" stroke="#00B4D8" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="80" y1="78" x2="12" y2="118" stroke="#00B4D8" strokeWidth="1" strokeOpacity="0.4"/>
              <line x1="80" y1="78" x2="12" y2="42" stroke="#00B4D8" strokeWidth="1" strokeOpacity="0.4"/>
              <circle cx="80" cy="4" r="4" fill="#00B4D8" opacity="0.7"/>
              <circle cx="148" cy="42" r="4" fill="#00B4D8" opacity="0.7"/>
              <circle cx="148" cy="118" r="4" fill="#00B4D8" opacity="0.7"/>
              <circle cx="80" cy="156" r="4" fill="#00B4D8" opacity="0.7"/>
              <circle cx="12" cy="118" r="4" fill="#00B4D8" opacity="0.7"/>
              <circle cx="12" cy="42" r="4" fill="#00B4D8" opacity="0.7"/>
              <circle cx="80" cy="78" r="10" fill="#00B4D8"/>
              <circle cx="80" cy="78" r="5" fill="white"/>
            </svg>
            <span style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>HiveMind</span>
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
