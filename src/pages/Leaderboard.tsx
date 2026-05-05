import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("accuracy");
  const [totalForecasters, setTotalForecasters] = useState(0);

  useEffect(() => { fetchLeaderboard(); }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, count } = await supabase
      .from("users")
      .select("id, username, accuracy_score, total_predictions, correct_predictions, resolved_predictions", { count: "exact" })
      .order(filter === "accuracy" ? "accuracy_score" : "total_predictions", { ascending: false })
      .limit(50);
    setUsers(data || []);
    setTotalForecasters(count || 0);
    setLoading(false);
  };

  const getRank = (i: number) => {
    if (i === 0) return { color: "#ffd700", bg: "#ffd70010", border: "#ffd70040", prize: "$250" };
    if (i === 1) return { color: "#c0c0c0", bg: "#c0c0c010", border: "#c0c0c040", prize: "$100" };
    if (i === 2) return { color: "#cd7f32", bg: "#cd7f3210", border: "#cd7f3240", prize: "$50" };
    return { color: "#3a5070", bg: "transparent", border: "#1a3050", prize: null };
  };

  const getAccuracyColor = (score: number) => {
    if (score >= 75) return "#00ff88";
    if (score >= 60) return "#00B4D8";
    if (score >= 45) return "#ffd700";
    return "#ff6b6b";
  };

  const getAccuracyLabel = (score: number) => {
    if (score >= 75) return { text: "ELITE", color: "#00ff88", bg: "#00ff8815" };
    if (score >= 60) return { text: "SHARP", color: "#00B4D8", bg: "#00B4D815" };
    if (score >= 45) return { text: "SOLID", color: "#ffd700", bg: "#ffd70015" };
    return { text: "LEARNING", color: "#6b7f99", bg: "#6b7f9915" };
  };

  const top3 = users.slice(0, 3);

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh" }}>

      {/* HERO HEADER */}
      <div style={{ background: "linear-gradient(180deg, #0d1f35 0%, #0a1628 100%)", borderBottom: "1px solid #1a3050", padding: "48px 32px 40px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <p style={{ color: "#00B4D8", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
                May 2026 Tournament
              </p>
              <h1 style={{ fontSize: "42px", fontWeight: 900, margin: 0, letterSpacing: "-1px", lineHeight: 1.1 }}>
                Global Leaderboard
              </h1>
              <p style={{ color: "#6b7f99", fontSize: "15px", marginTop: "10px" }}>
                {totalForecasters} forecasters competing for $500
              </p>
            </div>
            <Link to="/tournament" style={{ background: "#00B4D8", color: "#000", padding: "12px 24px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>
              Join Tournament →
            </Link>
          </div>

          {/* TOP 3 PODIUM */}
          {!loading && top3.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "12px", marginTop: "40px", alignItems: "flex-end" }}>
              {/* 2nd place */}
              {top3[1] ? (
                <Link to={`/profile/${top3[1].username}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#0d1f35", border: "1px solid #c0c0c040", borderRadius: "16px 16px 0 0", padding: "20px 16px 24px", textAlign: "center", borderBottom: "3px solid #c0c0c0" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #c0c0c030, #c0c0c010)", border: "2px solid #c0c0c060", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "20px", fontWeight: 900, color: "#c0c0c0" }}>
                      {top3[1].username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{top3[1].username}</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#c0c0c0" }}>{Math.round(top3[1].accuracy_score || 0)}%</div>
                    <div style={{ fontSize: "11px", color: "#6b7f99", marginBottom: "8px" }}>{top3[1].resolved_predictions || 0} resolved</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#c0c0c0" }}>$100</div>
                    <div style={{ marginTop: "12px", fontSize: "11px", color: "#c0c0c0", fontWeight: 700, letterSpacing: "1px" }}>2nd</div>
                  </div>
                </Link>
              ) : <div/>}

              {/* 1st place - TALLER */}
              {top3[0] && (
                <Link to={`/profile/${top3[0].username}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "linear-gradient(180deg, #1a1a00 0%, #0d1f35 100%)", border: "1px solid #ffd70060", borderRadius: "16px 16px 0 0", padding: "28px 16px 24px", textAlign: "center", borderBottom: "3px solid #ffd700", position: "relative" }}>
                    <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#ffd700", color: "#000", fontSize: "10px", fontWeight: 900, padding: "4px 12px", borderRadius: "20px", letterSpacing: "1px" }}>LEADER</div>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #ffd70040, #ffd70010)", border: "2px solid #ffd700", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "22px", fontWeight: 900, color: "#ffd700" }}>
                      {top3[0].username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{top3[0].username}</div>
                    <div style={{ fontSize: "36px", fontWeight: 900, color: "#ffd700" }}>{Math.round(top3[0].accuracy_score || 0)}%</div>
                    <div style={{ fontSize: "11px", color: "#6b7f99", marginBottom: "8px" }}>{top3[0].resolved_predictions || 0} resolved</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffd700" }}>$250</div>
                    <div style={{ marginTop: "12px", fontSize: "11px", color: "#ffd700", fontWeight: 700, letterSpacing: "1px" }}>1st</div>
                  </div>
                </Link>
              )}

              {/* 3rd place */}
              {top3[2] ? (
                <Link to={`/profile/${top3[2].username}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#0d1f35", border: "1px solid #cd7f3240", borderRadius: "16px 16px 0 0", padding: "16px 16px 24px", textAlign: "center", borderBottom: "3px solid #cd7f32" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #cd7f3230, #cd7f3210)", border: "2px solid #cd7f3260", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "18px", fontWeight: 900, color: "#cd7f32" }}>
                      {top3[2].username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{top3[2].username}</div>
                    <div style={{ fontSize: "26px", fontWeight: 900, color: "#cd7f32" }}>{Math.round(top3[2].accuracy_score || 0)}%</div>
                    <div style={{ fontSize: "11px", color: "#6b7f99", marginBottom: "8px" }}>{top3[2].resolved_predictions || 0} resolved</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#cd7f32" }}>$50</div>
                    <div style={{ marginTop: "12px", fontSize: "11px", color: "#cd7f32", fontWeight: 700, letterSpacing: "1px" }}>3rd</div>
                  </div>
                </Link>
              ) : <div/>}
            </div>
          )}
        </div>
      </div>

      {/* REST OF LEADERBOARD */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {[{ key: "accuracy", label: "By Accuracy" }, { key: "total", label: "By Volume" }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ background: filter === f.key ? "#00B4D8" : "#0d1f35", border: `1px solid ${filter === f.key ? "#00B4D8" : "#1a3050"}`, color: filter === f.key ? "#000" : "#8899aa", padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "60px" }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#1a3050", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="28" height="28" fill="none" stroke="#3a5070" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a2 2 0 0 0-2 2v2c0 3.31 2.69 6 6 6h8c3.31 0 6-2.69 6-6V6a2 2 0 0 0-2-2h-3"/><rect x="7" y="2" width="10" height="9" rx="2"/></svg>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>No forecasters yet</div>
            <div style={{ color: "#6b7f99", marginBottom: "24px" }}>Be the first to make predictions and claim the #1 spot</div>
            <Link to="/feed" style={{ background: "#00B4D8", color: "#000", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>Start Predicting →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "48px 1fr auto auto auto", gap: "16px", padding: "0 16px 8px", alignItems: "center" }}>
              <div/>
              <div style={{ fontSize: "11px", color: "#3a5070", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Forecaster</div>
              <div style={{ fontSize: "11px", color: "#3a5070", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", textAlign: "center", minWidth: "80px" }}>Resolved</div>
              <div style={{ fontSize: "11px", color: "#3a5070", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", textAlign: "center", minWidth: "60px" }}>Tier</div>
              <div style={{ fontSize: "11px", color: "#3a5070", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", textAlign: "right", minWidth: "80px" }}>Accuracy</div>
            </div>

            {users.map((user, i) => {
              const rank = getRank(i);
              const label = getAccuracyLabel(user.accuracy_score || 0);
              const accColor = getAccuracyColor(user.accuracy_score || 0);
              const pct = user.resolved_predictions > 0 ? Math.round(((user.correct_predictions || 0) / user.resolved_predictions) * 100) : 0;

              return (
                <Link key={user.id} to={`/profile/${user.username}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: i < 3 ? rank.bg : "#0d1f35", border: `1px solid ${rank.border}`, borderRadius: "12px", padding: "14px 16px", display: "grid", gridTemplateColumns: "48px 1fr auto auto auto", gap: "16px", alignItems: "center", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#00B4D840"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = rank.border}>

                    {/* Rank number */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1.5px solid ${rank.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900, color: rank.color }}>
                        {i + 1}
                      </div>
                    </div>

                    {/* User info + mini bar */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `${rank.color}20`, border: `1px solid ${rank.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 900, color: rank.color === "#3a5070" ? "#6b7f99" : rank.color }}>
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{user.username}</span>
                        {rank.prize && <span style={{ fontSize: "11px", fontWeight: 700, color: rank.color, background: `${rank.color}15`, border: `1px solid ${rank.color}30`, padding: "2px 8px", borderRadius: "20px" }}>{rank.prize}</span>}
                      </div>
                      {/* Progress bar */}
                      <div style={{ background: "#1a3050", borderRadius: "4px", height: "4px", width: "160px" }}>
                        <div style={{ background: accColor, height: "4px", borderRadius: "4px", width: `${pct}%`, transition: "width 0.6s ease" }}/>
                      </div>
                    </div>

                    {/* Resolved */}
                    <div style={{ textAlign: "center", minWidth: "80px" }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{user.resolved_predictions || 0}</div>
                      <div style={{ fontSize: "10px", color: "#3a5070" }}>resolved</div>
                    </div>

                    {/* Tier badge */}
                    <div style={{ textAlign: "center", minWidth: "60px" }}>
                      <span style={{ background: label.bg, color: label.color, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", letterSpacing: "0.5px" }}>
                        {label.text}
                      </span>
                    </div>

                    {/* Accuracy */}
                    <div style={{ textAlign: "right", minWidth: "80px" }}>
                      <div style={{ fontSize: "24px", fontWeight: 900, color: accColor, lineHeight: 1 }}>
                        {Math.round(user.accuracy_score || 0)}%
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
