import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Tournament() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  const TOURNAMENT_END = new Date("2026-06-01T00:00:00Z");
  const PRIZE_POOL = 500;

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      const diff = TOURNAMENT_END.getTime() - Date.now();
      if (diff > 0) setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60) });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let { data: tournament } = await supabase.from("tournaments").select("id").eq("name", "May 2026 Tournament").single();
    if (!tournament) {
      const { data: newT } = await supabase.from("tournaments").insert({ name: "May 2026 Tournament", start_date: "2026-05-01", end_date: "2026-06-01", prize_pool: 500, status: "active" }).select("id").single();
      tournament = newT;
    }
    if (tournament) setTournamentId(tournament.id);
    const { count } = await supabase.from("tournament_entries").select("*", { count: "exact", head: true }).eq("tournament_id", tournament?.id || "");
    setParticipants(count || 0);
    const { data: leaders } = await supabase.from("users").select("id, username, accuracy_score, correct_predictions, resolved_predictions, total_predictions").gt("total_predictions", 0).order("accuracy_score", { ascending: false }).limit(10);
    setLeaderboard(leaders || []);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let { data: u } = await supabase.from("users").select("id").eq("email", user.email).single();
      if (!u) { const { data: newU } = await supabase.from("users").upsert({ email: user.email, username: user.email.split("@")[0] }, { onConflict: "email" }).select("id").single(); u = newU; }
      setCurrentUser(u);
      if (u && tournament) {
        // Check using count which is more reliable than single()
        const { count } = await supabase.from("tournament_entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", u.id)
          .eq("tournament_id", tournament.id);
        setIsJoined((count || 0) > 0);
      }
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!currentUser) { navigate("/auth"); return; }
    setJoining(true);
    const { error } = await supabase.from("tournament_entries")
      .upsert({ user_id: currentUser.id, tournament_id: tournamentId }, { onConflict: "user_id,tournament_id" });
    if (!error) { setIsJoined(true); setParticipants(p => p + 1); }
    else if (error.code === "23505") { setIsJoined(true); } // already joined
    setJoining(false);
  };

  const accColor = (s: number) => s >= 70 ? "#00ff88" : s >= 50 ? "#00B4D8" : "#6b7f99";
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh" }}>

      {/* HERO BANNER */}
      <div style={{ background: "linear-gradient(180deg, #0d2040 0%, #0a1628 100%)", borderBottom: "1px solid #1a3050", padding: "56px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, #00B4D808 0%, transparent 70%)", pointerEvents: "none" }}/>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#00B4D815", border: "1px solid #00B4D840", color: "#00B4D8", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "20px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", animation: "pulse 2s infinite" }}/>
            LIVE — MAY 2026
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-2px", lineHeight: 1.05 }}>
            Monthly<br/>
            <span style={{ background: "linear-gradient(135deg, #00B4D8, #00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tournament</span>
          </h1>

          <p style={{ color: "#6b7f99", fontSize: "16px", maxWidth: "460px", margin: "0 auto 36px", lineHeight: 1.6 }}>
            The most accurate forecaster wins. Every prediction you make in May counts.
          </p>

          {/* 3 key stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap", marginBottom: "36px" }}>
            {[
              { label: "Prize Pool", value: `$${PRIZE_POOL}`, color: "#00ff88" },
              { label: "Participants", value: participants.toString(), color: "#00B4D8" },
              { label: "Days Left", value: String(timeLeft.days), color: "#ffd700" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "40px", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#6b7f99", fontWeight: 600, marginTop: "4px", letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isJoined ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#00ff8815", border: "1px solid #00ff8840", color: "#00ff88", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: 700 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Registered — Go make predictions!
            </div>
          ) : (
            <button onClick={handleJoin} disabled={joining} style={{ background: "linear-gradient(135deg, #00B4D8, #0077B6)", border: "none", color: "#fff", padding: "16px 48px", borderRadius: "12px", fontSize: "16px", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 32px #00B4D830" }}>
              {joining ? "Joining..." : "Join Tournament — Free"}
            </button>
          )}
          <div style={{ marginTop: "10px", fontSize: "13px", color: "#3a5070" }}>
            Free entry · <Link to="/feed" style={{ color: "#00B4D8" }}>Start predicting</Link> to compete
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* COUNTDOWN + PRIZE breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          {/* Countdown */}
          <div style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "#6b7f99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px" }}>Time Remaining</div>
            <div style={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
              {[{ v: timeLeft.days, l: "D" }, { v: timeLeft.hours, l: "H" }, { v: timeLeft.minutes, l: "M" }, { v: timeLeft.seconds, l: "S" }].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "1px" }}>
                  {i > 0 && <span style={{ color: "#1a3050", fontSize: "24px", margin: "0 2px 4px" }}>:</span>}
                  <div style={{ background: "#0a1628", border: "1px solid #1a3050", borderRadius: "8px", padding: "8px 10px", textAlign: "center", minWidth: "52px" }}>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{String(t.v).padStart(2, "0")}</div>
                    <div style={{ fontSize: "10px", color: "#00B4D8", fontWeight: 700, marginTop: "2px" }}>{t.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prize breakdown */}
          <div style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "#6b7f99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px" }}>Prize Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[{ place: "1st", pct: 50, color: "#ffd700" }, { place: "2nd", pct: 20, color: "#c0c0c0" }, { place: "3rd", pct: 10, color: "#cd7f32" }].map(p => (
                <div key={p.place} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: p.color, minWidth: "28px" }}>{p.place}</span>
                  <div style={{ flex: 1, background: "#0a1628", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                    <div style={{ background: p.color, width: `${p.pct * 2}%`, height: "100%", borderRadius: "4px" }}/>
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 900, color: p.color, minWidth: "48px", textAlign: "right" }}>${Math.round(PRIZE_POOL * p.pct / 100)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STANDINGS */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0 }}>Current Standings</h2>
            <span style={{ fontSize: "13px", color: "#3a5070" }}>Updated live</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "#6b7f99", padding: "40px" }}>Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a3050" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 14px", display: "block" }}>
                <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
                <path d="M7 4H4a2 2 0 0 0-2 2v2c0 3.31 2.69 6 6 6h8c3.31 0 6-2.69 6-6V6a2 2 0 0 0-2-2h-3"/>
                <rect x="7" y="2" width="10" height="9" rx="2"/>
              </svg>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>No standings yet</div>
              <div style={{ color: "#6b7f99", marginBottom: "20px" }}>Be the first to make predictions and claim the #1 spot</div>
              <Link to="/feed" style={{ background: "#00B4D8", color: "#000", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, textDecoration: "none" }}>Start Predicting →</Link>
            </div>
          ) : (
            <>
              {/* TOP 3 PODIUM */}
              {top3.length > 0 && (() => {
                const podiumSlot = (user: any, rank: number, config: { color: string; prize: string; label: string; height: string; avatarSize: string; scoreSize: string; pad: string }) => {
                  const empty = (
                    <div style={{ background: "#0d1f3580", border: `1px dashed ${config.color}30`, borderRadius: "14px 14px 0 0", padding: config.pad, textAlign: "center", borderBottom: `3px solid ${config.color}40`, height: config.height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: `2px dashed ${config.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "18px", color: `${config.color}50`, fontWeight: 900 }}>?</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#3a5070" }}>Open spot</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: `${config.color}60` }}>{config.prize}</div>
                      <div style={{ fontSize: "10px", color: `${config.color}50`, fontWeight: 700, letterSpacing: "1px" }}>{config.label}</div>
                    </div>
                  );
                  if (!user) return empty;
                  return (
                    <Link to={`/profile/${user.username}`} style={{ textDecoration: "none" }}>
                      <div style={{ background: rank === 1 ? "linear-gradient(180deg, #1a1500 0%, #0d1f35 100%)" : "#0d1f35", border: `1px solid ${config.color}40`, borderRadius: "14px 14px 0 0", padding: config.pad, textAlign: "center", borderBottom: `3px solid ${config.color}`, position: "relative", minHeight: config.height }}>
                        {rank === 1 && <div style={{ position: "absolute", top: "-11px", left: "50%", transform: "translateX(-50%)", background: "#ffd700", color: "#000", fontSize: "9px", fontWeight: 900, padding: "3px 12px", borderRadius: "20px", letterSpacing: "1.5px", whiteSpace: "nowrap" }}>LEADER</div>}
                        <div style={{ width: config.avatarSize, height: config.avatarSize, borderRadius: "50%", background: `${config.color}20`, border: `2px solid ${config.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: rank === 1 ? "22px" : "16px", fontWeight: 900, color: config.color }}>
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ fontSize: rank === 1 ? "14px" : "12px", fontWeight: 700, color: "#fff", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.username}</div>
                        <div style={{ fontSize: config.scoreSize, fontWeight: 900, color: config.color }}>{Math.round(user.accuracy_score || 0)}%</div>
                        <div style={{ fontSize: "11px", color: "#6b7f99", marginTop: "2px" }}>{user.resolved_predictions || 0} resolved</div>
                        <div style={{ marginTop: "8px", fontSize: rank === 1 ? "15px" : "13px", fontWeight: 700, color: config.color }}>{config.prize}</div>
                        <div style={{ fontSize: "10px", color: config.color, fontWeight: 700, marginTop: "6px", letterSpacing: "1px" }}>{config.label}</div>
                      </div>
                    </Link>
                  );
                };
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "10px", marginBottom: "12px", alignItems: "flex-end" }}>
                    {podiumSlot(top3[1], 2, { color: "#c0c0c0", prize: "$100", label: "2ND", height: "200px", avatarSize: "44px", scoreSize: "26px", pad: "20px 14px 22px" })}
                    {podiumSlot(top3[0], 1, { color: "#ffd700", prize: "$250", label: "1ST", height: "240px", avatarSize: "52px", scoreSize: "34px", pad: "28px 14px 22px" })}
                    {podiumSlot(top3[2], 3, { color: "#cd7f32", prize: "$50", label: "3RD", height: "180px", avatarSize: "40px", scoreSize: "24px", pad: "16px 14px 22px" })}
                  </div>
                );
              })()}

              {/* REST OF LEADERBOARD */}
              {rest.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {rest.map((user, idx) => {
                    const i = idx + 3;
                    return (
                      <Link to={`/profile/${user.username}`} key={user.id} style={{ textDecoration: "none" }}>
                        <div style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", transition: "border-color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "#00B4D840"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "#1a3050"}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #1a3050", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#3a5070", flexShrink: 0 }}>{i + 1}</div>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #00B4D8, #0077B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900, color: "#fff", flexShrink: 0 }}>{user.username?.[0]?.toUpperCase()}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{user.username}</div>
                            <div style={{ fontSize: "11px", color: "#3a5070" }}>{user.resolved_predictions || 0} resolved</div>
                          </div>
                          <div style={{ fontSize: "22px", fontWeight: 900, color: accColor(user.accuracy_score || 0) }}>{Math.round(user.accuracy_score || 0)}%</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* RULES */}
        <div style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "16px", padding: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "18px" }}>Tournament Rules</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, text: "All predictions made in May 2026 count toward your accuracy score" },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, text: "Accuracy = correct predictions ÷ total resolved predictions × 100" },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: "Minimum 3 resolved predictions required to qualify for prizes" },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><rect x="7" y="2" width="10" height="9" rx="2"/></svg>, text: "Prize pool distributed to top 3 forecasters at end of month" },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, text: "Ties broken by number of total resolved predictions" },
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ color: "#00B4D8", flexShrink: 0, marginTop: "2px" }}>{rule.icon}</div>
                <span style={{ color: "#8899aa", fontSize: "14px", lineHeight: 1.6 }}>{rule.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
