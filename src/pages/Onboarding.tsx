import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleCat = (cat: string) => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const checkUsername = async () => {
    if (!username.trim() || username.length < 3) { setError("Username must be at least 3 characters"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError("Only letters, numbers and underscores"); return; }
    setLoading(true);
    const { data } = await supabase.from("users").select("id").eq("username", username.trim()).single();
    if (data) { setError("Username already taken"); setLoading(false); return; }
    setError("");
    setLoading(false);
    setStep(2);
  };

  const finish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    await supabase.from("users").upsert(
      { email: user.email, username: username.trim(), interests: selectedCats },
      { onConflict: "email" }
    );
    navigate("/feed");
  };

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <svg width="48" height="48" viewBox="0 0 160 160" fill="none" style={{ margin: "0 auto 12px" }}>
            <polygon points="80,4 148,42 148,118 80,156 12,118 12,42" fill="none" stroke="#1a3a5c" strokeWidth="2"/>
            <polygon points="80,22 130,50 130,110 80,138 30,110 30,50" fill="none" stroke="#00B4D8" strokeWidth="2.5"/>
            <polygon points="80,44 108,60 108,100 80,116 52,100 52,60" fill="#00B4D8" fillOpacity="0.12" stroke="#00B4D8" strokeWidth="2"/>
            <circle cx="80" cy="78" r="10" fill="#00B4D8"/>
            <circle cx="80" cy="78" r="5" fill="white"/>
          </svg>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>Welcome to HiveMind</h1>
          <p style={{ color: "#6b7f99", marginTop: "8px", fontSize: "15px" }}>Let's set up your forecaster profile</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: "3px", borderRadius: "2px", background: s <= step ? "#00B4D8" : "#1a3050", transition: "background 0.3s" }}/>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Choose your username</h2>
            <p style={{ color: "#6b7f99", fontSize: "14px", marginBottom: "24px" }}>This is how other forecasters will see you on the leaderboard and profiles.</p>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#3a5070", fontSize: "15px", fontWeight: 700 }}>@</span>
                <input
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && checkUsername()}
                  placeholder="yourname"
                  autoFocus
                  style={{ width: "100%", background: "#0d1f35", border: `1px solid ${error ? "#ff4444" : "#1a3050"}`, borderRadius: "12px", padding: "14px 14px 14px 32px", color: "#fff", fontSize: "16px", outline: "none", boxSizing: "border-box", fontWeight: 600 }}
                />
              </div>
              {error && <p style={{ color: "#ff4444", fontSize: "13px", marginTop: "8px" }}>{error}</p>}
              {username.length >= 3 && !error && (
                <p style={{ color: "#00ff88", fontSize: "13px", marginTop: "8px" }}>✓ @{username} looks good!</p>
              )}
            </div>

            <button onClick={checkUsername} disabled={loading || username.length < 3}
              style={{ width: "100%", padding: "16px", background: username.length >= 3 ? "#00B4D8" : "#1a3050", border: "none", borderRadius: "12px", color: username.length >= 3 ? "#000" : "#3a5070", fontSize: "16px", fontWeight: 900, cursor: username.length >= 3 ? "pointer" : "default", transition: "all 0.2s" }}>
              {loading ? "Checking..." : "Continue →"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>What do you want to predict?</h2>
            <p style={{ color: "#6b7f99", fontSize: "14px", marginBottom: "24px" }}>Pick your favorite categories. We'll show you the most relevant predictions first.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px" }}>
              {CATEGORIES.map(cat => {
                const selected = selectedCats.includes(cat);
                return (
                  <button key={cat} onClick={() => toggleCat(cat)} style={{
                    background: selected ? "#00B4D820" : "#0d1f35",
                    border: `1.5px solid ${selected ? "#00B4D8" : "#1a3050"}`,
                    borderRadius: "12px", padding: "14px 16px",
                    color: selected ? "#00B4D8" : "#8899aa",
                    fontSize: "14px", fontWeight: 700, cursor: "pointer",
                    textAlign: "left", display: "flex", alignItems: "center", gap: "10px",
                    transition: "all 0.15s"
                  }}>
                    <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${selected ? "#00B4D8" : "#3a5070"}`, background: selected ? "#00B4D8" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {selected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#000" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </span>
                    {cat}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(1)} style={{ padding: "16px 24px", background: "none", border: "1px solid #1a3050", borderRadius: "12px", color: "#6b7f99", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>← Back</button>
              <button onClick={finish} disabled={loading}
                style={{ flex: 1, padding: "16px", background: "#00B4D8", border: "none", borderRadius: "12px", color: "#000", fontSize: "16px", fontWeight: 900, cursor: "pointer" }}>
                {loading ? "Setting up..." : selectedCats.length > 0 ? `Start Predicting →` : "Skip for now →"}
              </button>
            </div>

            {selectedCats.length > 0 && (
              <p style={{ textAlign: "center", color: "#6b7f99", fontSize: "12px", marginTop: "12px" }}>
                {selectedCats.length} categor{selectedCats.length > 1 ? "ies" : "y"} selected
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
