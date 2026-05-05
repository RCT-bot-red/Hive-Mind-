import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("open");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { navigate("/auth"); return; }
    setUser(authUser);

    let { data: p } = await supabase.from("users").select("*").eq("email", authUser.email).single();
    if (!p) {
      const { data: newP } = await supabase.from("users")
        .upsert({ email: authUser.email, username: authUser.email.split("@")[0] }, { onConflict: "email" })
        .select("*").single();
      p = newP;
    }
    setProfile(p);
    setBioInput(p?.bio || "");
    setUsernameInput(p?.username || "");

    // Fetch predictions
    const { data: preds } = await supabase.from("predictions").select("*").eq("user_id", p.id).order("created_at", { ascending: false });
    setPredictions(preds || []);

    // Fetch followers/following counts
    const [{ count: fc }, { count: fwc }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.id),
    ]);
    setFollowersCount(fc || 0);
    setFollowingCount(fwc || 0);
    setLoading(false);
  };

  const saveBio = async () => {
    setSaving(true);
    await supabase.from("users").update({ bio: bioInput }).eq("id", profile.id);
    setProfile((p: any) => ({ ...p, bio: bioInput }));
    setEditingBio(false);
    setSaving(false);
  };

  const saveUsername = async () => {
    if (!usernameInput.trim()) return;
    setSaving(true);
    await supabase.from("users").update({ username: usernameInput.trim() }).eq("id", profile.id);
    setProfile((p: any) => ({ ...p, username: usernameInput.trim() }));
    setEditingUsername(false);
    setSaving(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const open = predictions.filter(p => p.status === "open");
  const resolved = predictions.filter(p => p.status !== "open");
  const correct = predictions.filter(p => p.status === "correct").length;
  const accuracy = resolved.length > 0 ? Math.round((correct / resolved.length) * 100) : 0;

  const getAccuracyColor = (s: number) => s >= 70 ? "#00ff88" : s >= 50 ? "#00B4D8" : s > 0 ? "#ffd700" : "#3a5070";
  const getTier = (s: number) => {
    if (s >= 75) return { text: "ELITE", color: "#00ff88", bg: "#00ff8815" };
    if (s >= 60) return { text: "SHARP", color: "#00B4D8", bg: "#00B4D815" };
    if (s >= 45) return { text: "SOLID", color: "#ffd700", bg: "#ffd70015" };
    if (s > 0) return { text: "LEARNING", color: "#6b7f99", bg: "#6b7f9915" };
    return { text: "NEW", color: "#3a5070", bg: "#3a507015" };
  };

  const tier = getTier(accuracy);
  const displayed = tab === "open" ? open : resolved;

  if (loading) return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7f99" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh" }}>

      {/* HERO BANNER */}
      <div style={{ background: "linear-gradient(180deg, #0d1f35 0%, #0a1628 100%)", borderBottom: "1px solid #1a3050", padding: "48px 24px 0" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>

          {/* Profile header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "32px", flexWrap: "wrap" }}>

            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: "linear-gradient(135deg, #00B4D8, #0077B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 900, color: "#fff", border: "3px solid #1a3a5c", flexShrink: 0 }}>
                {profile?.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "18px", height: "18px", borderRadius: "50%", background: "#00ff88", border: "2px solid #0a1628" }}/>
            </div>

            {/* Name + bio */}
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
                {editingUsername ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input value={usernameInput} onChange={e => setUsernameInput(e.target.value)} style={{ background: "#0a1628", border: "1px solid #00B4D8", borderRadius: "8px", padding: "6px 12px", color: "#fff", fontSize: "22px", fontWeight: 900, outline: "none", width: "200px" }} autoFocus/>
                    <button onClick={saveUsername} disabled={saving} style={{ background: "#00B4D8", border: "none", color: "#000", padding: "6px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Save</button>
                    <button onClick={() => setEditingUsername(false)} style={{ background: "none", border: "1px solid #1a3050", color: "#6b7f99", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, color: "#fff" }}>{profile?.username}</h1>
                    <button onClick={() => setEditingUsername(true)} style={{ background: "none", border: "1px solid #1a3050", color: "#6b7f99", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Edit</button>
                    <span style={{ background: tier.bg, color: tier.color, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.5px" }}>{tier.text}</span>
                  </>
                )}
              </div>

              {/* Bio */}
              {editingBio ? (
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "12px" }}>
                  <textarea value={bioInput} onChange={e => setBioInput(e.target.value)} placeholder="Tell the world how you predict..." rows={2} style={{ background: "#0a1628", border: "1px solid #00B4D8", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "14px", resize: "none", outline: "none", fontFamily: "inherit", flex: 1 }} autoFocus/>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button onClick={saveBio} disabled={saving} style={{ background: "#00B4D8", border: "none", color: "#000", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Save</button>
                    <button onClick={() => setEditingBio(false)} style={{ background: "none", border: "1px solid #1a3050", color: "#6b7f99", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setEditingBio(true)} style={{ cursor: "pointer", color: profile?.bio ? "#8899aa" : "#3a5070", fontSize: "14px", lineHeight: 1.6, marginBottom: "12px", padding: "6px 0" }}>
                  {profile?.bio || "Add a bio — tell others how you forecast..."}
                  <span style={{ color: "#3a5070", fontSize: "12px", marginLeft: "8px" }}>✏️</span>
                </div>
              )}

              {/* Followers */}
              <div style={{ display: "flex", gap: "20px", fontSize: "14px" }}>
                <span><strong style={{ color: "#fff" }}>{followersCount}</strong> <span style={{ color: "#6b7f99" }}>followers</span></span>
                <span><strong style={{ color: "#fff" }}>{followingCount}</strong> <span style={{ color: "#6b7f99" }}>following</span></span>
                <span><strong style={{ color: "#fff" }}>{predictions.length}</strong> <span style={{ color: "#6b7f99" }}>predictions</span></span>
              </div>
            </div>

            {/* Accuracy big display */}
            <div style={{ textAlign: "center", background: "#0a1628", border: "1px solid #1a3050", borderRadius: "16px", padding: "20px 28px" }}>
              <div style={{ fontSize: "48px", fontWeight: 900, color: getAccuracyColor(accuracy), lineHeight: 1 }}>{accuracy}%</div>
              <div style={{ fontSize: "11px", color: "#6b7f99", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "6px" }}>Accuracy</div>
              <div style={{ width: "80px", background: "#1a3050", borderRadius: "4px", height: "4px", margin: "10px auto 0" }}>
                <div style={{ background: getAccuracyColor(accuracy), height: "4px", borderRadius: "4px", width: `${accuracy}%` }}/>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
            {[
              { label: "Total", value: predictions.length, color: "#fff" },
              { label: "Resolved", value: resolved.length, color: "#00B4D8" },
              { label: "Correct", value: correct, color: "#00ff88" },
              { label: "Open", value: open.length, color: "#ffd700" },
            ].map(s => (
              <div key={s.label} style={{ background: "#0a1628", border: "1px solid #1a3050", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "26px", fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#6b7f99", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #1a3050" }}>
            {[{ key: "open", label: `Open (${open.length})` }, { key: "resolved", label: `Resolved (${resolved.length})` }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ background: "none", border: "none", borderBottom: tab === t.key ? "2px solid #00B4D8" : "2px solid transparent", color: tab === t.key ? "#ffffff" : "#6b7f99", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginBottom: "-1px" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PREDICTIONS */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px 80px" }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050" }}>
            <div style={{ color: "#3a5070", fontSize: "15px", marginBottom: "16px" }}>
              {tab === "open" ? "No open predictions yet" : "No resolved predictions yet"}
            </div>
            {tab === "open" && (
              <Link to="/feed" style={{ background: "#00B4D8", color: "#000", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
                Browse Predictions →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {displayed.map(p => (
              <Link to={`/market/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
                <div style={{ background: "#0d1f35", border: `1px solid ${p.status === "correct" ? "#00ff8830" : p.status === "incorrect" ? "#ff444430" : "#1a3050"}`, borderRadius: "14px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#00B4D840"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = p.status === "correct" ? "#00ff8830" : p.status === "incorrect" ? "#ff444430" : "#1a3050"}>
                  <div style={{ flex: 1 }}>
                    <span style={{ background: "#0a1f35", border: "1px solid #1a3a5c", color: "#00B4D8", padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, marginBottom: "8px", display: "inline-block" }}>{p.category}</span>
                    <p style={{ color: "#ffffff", fontWeight: 600, margin: 0, fontSize: "15px", lineHeight: 1.4 }}>{p.question}</p>
                    <p style={{ color: "#3a5070", margin: "6px 0 0", fontSize: "12px" }}>
                      Resolves {new Date(p.resolution_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: p.status === "correct" ? "#00ff88" : p.status === "incorrect" ? "#ff4444" : "#00B4D8" }}>
                      {p.confidence}%
                    </div>
                    {p.status !== "open" && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: p.status === "correct" ? "#00ff88" : "#ff4444" }}>
                        {p.status === "correct" ? "✓ CORRECT" : "✗ WRONG"}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Logout */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #1a3050", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "13px", color: "#3a5070" }}>{user?.email}</div>
          <button onClick={logout} style={{ background: "none", border: "1px solid #ff444440", color: "#ff6b6b", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
