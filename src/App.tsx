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
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'
import Tournament from './pages/Tournament'
import './App.css'

function App() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from("users").select("id").eq("email", user.email).single().then(({ data }) => {
          if (data) fetchNotifications(data.id);
        });
      }
    });
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      // Redirect to onboarding if new user has no username
      if (session?.user) {
        supabase.from('users').select('username').eq('email', session.user.email).single().then(({ data }) => {
          const path = window.location.pathname
          if ((!data || !data.username || data.username === session.user!.email?.split('@')[0]) && path !== '/onboarding') {
            // Only redirect if username looks like default email prefix
          }
        })
      }
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
            <span style={{ fontSize: "26px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>HiveMind</span>
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
          {/* Notification bell */}
          {user && (
            <div style={{ position: "relative" }}>
              <button onClick={() => { setNotifOpen(o => !o); if (!notifOpen) { supabase.from("users").select("id").eq("email", user.email).single().then(({ data }) => { if (data) { markAllRead(data.id); } }); } }}
                style={{ background: "none", border: "none", color: "#ccd6f6", cursor: "pointer", padding: "6px", position: "relative", display: "flex", alignItems: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: "2px", right: "2px", width: "16px", height: "16px", background: "#ff4444", borderRadius: "50%", fontSize: "10px", fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {/* Dropdown */}
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "40px", width: "320px", background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "14px", boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 100, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a3050", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Notifications</span>
                    {notifications.length > 0 && <span style={{ fontSize: "11px", color: "#3a5070" }}>{notifications.length} total</span>}
                  </div>
                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "32px 16px", textAlign: "center", color: "#3a5070", fontSize: "14px" }}>
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔔</div>
                        No notifications yet
                      </div>
                    ) : notifications.map((n: any) => (
                      <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #0a1628", background: n.read ? "transparent" : "#00B4D808", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.read ? "transparent" : "#00B4D8", flexShrink: 0, marginTop: "6px" }}/>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: "#c0d0e0", fontSize: "13px", lineHeight: 1.5, margin: "0 0 4px" }}>{n.message}</p>
                          <span style={{ fontSize: "11px", color: "#3a5070" }}>{new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Hamburger - mobile only */}
          <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {mobileMenuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </nav>
        {notifOpen && <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }}/>}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {[{to:"/feed",l:"Feed"},{to:"/tournament",l:"Tournament"},{to:"/leaderboard",l:"Leaderboard"},{to:"/profile",l:"Profile"}].map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className="mobile-menu-link">{item.l}</Link>
            ))}
            {user
              ? <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="mobile-menu-logout">Logout</button>
              : <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="mobile-menu-link">Sign In</Link>
            }
          </div>
        )}
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
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
