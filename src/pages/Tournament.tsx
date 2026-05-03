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

  // Tournament ends last day of May 2026
  const TOURNAMENT_END = new Date("2026-06-01T00:00:00Z");
  const TOURNAMENT_NAME = "May 2026 Tournament";
  const PRIZE_POOL = 500;

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      const diff = TOURNAMENT_END.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Participants count
    const { count } = await supabase
      .from("tournament_entries")
      .select("*", { count: "exact", head: true });
    setParticipants(count || 0);

    // Top forecasters (leaderboard for this month)
    const { data: leaders } = await supabase
      .from("users")
      .select("id, username, accuracy_score, correct_predictions, resolved_predictions, total_predictions")
      .gt("total_predictions", 0)
      .order("accuracy_score", { ascending: false })
      .limit(10);
    setLeaderboard(leaders || []);

    // Check if current user is joined
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Upsert user record if not exists
      let { data: u } = await supabase.from("users").select("id").eq("email", user.email).single();
      if (!u) {
        const { data: newU } = await supabase.from("users")
          .upsert({ email: user.email, username: user.email.split("@")[0] }, { onConflict: "email" })
          .select("id").single();
        u = newU;
      }
      setCurrentUser(u);
      if (u) {
        const { data: entry } = await supabase
          .from("tournament_entries")
          .select("id")
          .eq("user_id", u.id)
          .single();
        setIsJoined(!!entry);
      }
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!currentUser) { navigate("/auth"); return; }
    setJoining(true);
    const { error } = await supabase.from("tournament_entries")
      .upsert({ user_id: currentUser.id }, { onConflict: "user_id" });
    if (!error) {
      setIsJoined(true);
      setParticipants(p => p + 1);
    } else {
      console.error("Join error:", error);
    }
    setJoining(false);
  };

  const prizes = [
    { place: "1st", pct: 50, icon: "🥇", color: "#ffd700", bg: "#ffd70015", border: "#ffd70040" },
    { place: "2nd", pct: 20, icon: "🥈", color: "#c0c0c0", bg: "#c0c0c015", border: "#c0c0c040" },
    { place: "3rd", pct: 10, icon: "🥉", color: "#cd7f32", bg: "#cd7f3215", border: "#cd7f3240" },
  ];

  const getRank = (i: number) => {
    if (i === 0) return { symbol: "🥇", color: "#ffd700" };
    if (i === 1) return { symbol: "🥈", color: "#c0c0c0" };
    if (i === 2) return { symbol: "🥉", color: "#cd7f32" };
    return { symbol: `#${i + 1}`, color: "#6b7f99" };
  };

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ background: "#00B4D815", border: "1px solid #00B4D840", color: "#00B4D8", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
            🏆 MAY 2026
          </span>
          <h1 style={{ fontSize: "48px", fontWeight: 900, margin: "16px 0 8px", letterSpacing: "-1px", lineHeight: 1.1 }}>
            Monthly Tournament
          </h1>
          <p style={{ color: "#6b7f99", fontSize: "16px", maxWidth: "500px", margin: "0 auto" }}>
            Most accurate forecaster wins. All predictions made in May count toward your score.
          </p>
        </div>

        {/* Countdown + Prize Pool */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>

          {/* Countdown */}
          <div style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "16px", padding: "28px" }}>
            <div style={{ fontSize: "11px", color: "#6b7f99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px" }}>
              Time Remaining
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              {[
                { value: timeLeft.days, label: "d" },
                { value: timeLeft.hours, label: "h" },
                { value: timeLeft.minutes, label: "m" },
                { value: timeLeft.seconds, label: "s" },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                  {i > 0 && <span style={{ color: "#1a3050", fontSize: "20px", marginBottom: "4px", marginRight: "2px" }}>:</span>}
                  <span style={{ fontSize: "36px", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>
                    {String(t.value).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "13px", color: "#00B4D8", fontWeight: 700, marginBottom: "2px" }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prize Pool */}
          <div style={{ background: "linear-gradient(135deg, #0d1f35, #091525)", border: "1px solid #1a3050", borderTop: "3px solid #00ff88", borderRadius: "16px", padding: "28px" }}>
            <div style={{ fontSize: "11px", color: "#6b7f99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px" }}>
              Prize Pool
            </div>
            <div style={{ fontSize: "52px", fontWeight: 900, color: "#00ff88", lineHeight: 1, marginBottom: "8px" }}>
              ${PRIZE_POOL}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7f99" }}>
              {participants} participant{participants !== 1 ? "s" : ""} registered
            </div>
          </div>
        </div>

        {/* Prize breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {prizes.map(p => (
            <div key={p.place} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: "14px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{p.icon}</div>
              <div style={{ fontSize: "13px", color: p.color, fontWeight: 700, marginBottom: "4px" }}>{p.place} Place</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: p.color }}>${Math.round(PRIZE_POOL * p.pct / 100)}</div>
              <div style={{ fontSize: "12px", color: "#6b7f99", marginTop: "2px" }}>{p.pct}% of pool</div>
            </div>
          ))}
        </div>

        {/* Join button */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          {isJoined ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#00ff8815", border: "1px solid #00ff8840", color: "#00ff88", padding: "14px 32px", borderRadius: "12px", fontSize: "15px", fontWeight: 700 }}>
              ✓ You're registered for this tournament
            </div>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              style={{ background: "#00B4D8", border: "none", color: "#000", padding: "16px 48px", borderRadius: "12px", fontSize: "16px", fontWeight: 900, cursor: "pointer", opacity: joining ? 0.7 : 1 }}
            >
              {joining ? "Joining..." : "🏆 Join Tournament — Free"}
            </button>
          )}
          <p style={{ color: "#6b7f99", fontSize: "13px", marginTop: "12px" }}>
            Free to enter. Start making predictions in the{" "}
            <Link to="/feed" style={{ color: "#00B4D8" }}>Feed</Link> to compete.
          </p>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "20px" }}>
            Current Standings
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", color: "#6b7f99", padding: "40px" }}>Loading standings...</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050", color: "#6b7f99" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏆</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>No standings yet</div>
              <div>Be the first to make predictions and claim the top spot!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {leaderboard.map((user, i) => {
                const rank = getRank(i);
                const prizeAmt = i === 0 ? PRIZE_POOL * 0.5 : i === 1 ? PRIZE_POOL * 0.2 : i === 2 ? PRIZE_POOL * 0.1 : null;
                return (
                  <Link to={`/profile/${user.username}`} key={user.id} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: i < 3 ? "linear-gradient(135deg, #0d1f35, #091525)" : "#0d1f35",
                      border: `1px solid ${i === 0 ? "#ffd70040" : i === 1 ? "#c0c0c040" : i === 2 ? "#cd7f3240" : "#1a3050"}`,
                      borderRadius: "14px", padding: "16px 22px",
                      display: "flex", alignItems: "center", gap: "14px",
                      transition: "border-color 0.2s",
                    }}>
                      {/* Rank */}
                      <div style={{ minWidth: "40px", textAlign: "center", fontSize: i < 3 ? "24px" : "15px", fontWeight: 900, color: rank.color }}>
                        {rank.symbol}
                      </div>

                      {/* Avatar */}
                      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #00B4D8, #0077B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                        {user.username?.[0]?.toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{user.username}</span>
                          {i === 0 && <span style={{ background: "#ffd70020", border: "1px solid #ffd700", color: "#ffd700", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "8px" }}>👑 LEADER</span>}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7f99", marginTop: "2px" }}>
                          {user.resolved_predictions || 0} resolved · {user.total_predictions || 0} total
                        </div>
                      </div>

                      {/* Prize */}
                      {prizeAmt && (
                        <div style={{ textAlign: "center", marginRight: "8px" }}>
                          <div style={{ fontSize: "10px", color: "#6b7f99", marginBottom: "2px" }}>PRIZE</div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: rank.color }}>${prizeAmt}</div>
                        </div>
                      )}

                      {/* Accuracy */}
                      <div style={{ textAlign: "right", minWidth: "70px" }}>
                        <div style={{ fontSize: "26px", fontWeight: 900, color: (user.accuracy_score || 0) >= 70 ? "#00ff88" : (user.accuracy_score || 0) >= 50 ? "#00B4D8" : "#6b7f99" }}>
                          {Math.round(user.accuracy_score || 0)}%
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7f99" }}>accuracy</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Rules */}
        <div style={{ marginTop: "40px", background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "16px", padding: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "#ffffff" }}>Tournament Rules</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "All predictions made in May 2026 count toward your accuracy score",
              "Accuracy = correct predictions ÷ total resolved predictions × 100",
              "Minimum 3 resolved predictions required to qualify for prizes",
              "Prize pool distributed to top 3 forecasters at end of month",
              "Ties broken by number of total resolved predictions",
            ].map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ color: "#00B4D8", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>0{i + 1}</span>
                <span style={{ color: "#8899aa", fontSize: "14px", lineHeight: 1.5 }}>{rule}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
