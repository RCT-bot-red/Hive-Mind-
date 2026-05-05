import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Home() {
  const [stats, setStats] = useState({ users: 0, predictions: 0, votes: 0 });
  const [topPredictions, setTopPredictions] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const timer = setInterval(() => {
      const diff = new Date("2026-06-01T00:00:00Z").getTime() - Date.now();
      if (diff > 0) setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60) });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    const [{ count: users }, { count: predictions }, { count: votes }, { data: topPreds }] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("predictions").select("*", { count: "exact", head: true }),
      supabase.from("votes").select("*", { count: "exact", head: true }),
      supabase.from("predictions").select("id, question, confidence, category, created_at").eq("status", "open").order("created_at", { ascending: false }).limit(4),
    ]);
    setStats({ users: users || 0, predictions: predictions || 0, votes: votes || 0 });
    setTopPredictions(topPreds || []);
  };

  const categoryColors: Record<string, string> = {
    Politics: "#ff6b6b", Technology: "#00B4D8", Economics: "#00ff88",
    Sports: "#ffd700", Science: "#a855f7", Climate: "#22c55e",
    Entertainment: "#f97316", Health: "#ec4899",
  };

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "90px 24px 60px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#00B4D815", border: "1px solid #00B4D840", color: "#00B4D8", padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "28px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", display: "inline-block", animation: "pulse 2s infinite" }}></span>
          Live — May 2026 Tournament Active
        </div>

        <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", fontWeight: 900, lineHeight: 1.05, marginBottom: "24px", letterSpacing: "-2px", color: "#ffffff" }}>
          The world's smartest<br />
          <span style={{ background: "linear-gradient(135deg, #00B4D8, #00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>prediction community</span>
        </h1>

        <p style={{ fontSize: "18px", color: "#8899aa", maxWidth: "560px", margin: "0 auto 40px", lineHeight: 1.7 }}>
          Make bold predictions. Challenge others. Build an unbeatable track record. Compete for real prizes.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
          {!user ? (
            <>
              <Link to="/auth" style={{ background: "#00B4D8", color: "#000", padding: "16px 36px", borderRadius: "12px", fontWeight: 900, fontSize: "16px", textDecoration: "none", display: "inline-block" }}>
                Join Free →
              </Link>
              <Link to="/feed" style={{ background: "#0d1f35", border: "1px solid #1a3050", color: "#ffffff", padding: "16px 36px", borderRadius: "12px", fontWeight: 700, fontSize: "16px", textDecoration: "none", display: "inline-block" }}>
                Browse Predictions
              </Link>
            </>
          ) : (
            <>
              <Link to="/feed" style={{ background: "#00B4D8", color: "#000", padding: "16px 36px", borderRadius: "12px", fontWeight: 900, fontSize: "16px", textDecoration: "none", display: "inline-block" }}>
                Make Predictions →
              </Link>
              <Link to="/tournament" style={{ background: "#00ff8820", border: "1px solid #00ff8840", color: "#00ff88", padding: "16px 36px", borderRadius: "12px", fontWeight: 700, fontSize: "16px", textDecoration: "none", display: "inline-block" }}>
                🏆 View Tournament
              </Link>
            </>
          )}
        </div>

        {/* LIVE STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "600px", margin: "0 auto 80px" }}>
          {[
            { value: stats.predictions, label: "Predictions", suffix: "+" },
            { value: stats.votes, label: "Votes Cast", suffix: "+" },
            { value: "$500", label: "Prize Pool", suffix: "" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "14px", padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: 900, color: i === 2 ? "#00ff88" : "#ffffff" }}>
                {typeof s.value === "number" ? s.value.toLocaleString() : s.value}{s.suffix}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7f99", marginTop: "4px", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TOURNAMENT BANNER */}
      <div style={{ maxWidth: "900px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ background: "linear-gradient(135deg, #0d1f35, #091828)", border: "1px solid #1a3a5c", borderTop: "3px solid #00B4D8", borderRadius: "20px", padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#00B4D8", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>🏆 May 2026 Tournament</div>
            <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "6px" }}>Win your share of <span style={{ color: "#00ff88" }}>$500</span></div>
            <div style={{ color: "#6b7f99", fontSize: "14px" }}>Most accurate forecaster takes the crown</div>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                {[{ v: timeLeft.days, l: "d" }, { v: timeLeft.hours, l: "h" }, { v: timeLeft.minutes, l: "m" }, { v: timeLeft.seconds, l: "s" }].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    {i > 0 && <span style={{ color: "#1a3050", fontSize: "20px" }}>:</span>}
                    <span style={{ fontSize: "28px", fontWeight: 900 }}>{String(t.v).padStart(2, "0")}</span>
                    <span style={{ fontSize: "11px", color: "#00B4D8", fontWeight: 700 }}>{t.l}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "11px", color: "#6b7f99", marginTop: "4px" }}>Time remaining</div>
            </div>
            <Link to="/tournament" style={{ background: "#00B4D8", color: "#000", padding: "14px 28px", borderRadius: "10px", fontWeight: 900, fontSize: "15px", textDecoration: "none", whiteSpace: "nowrap" }}>
              Join Now →
            </Link>
          </div>
        </div>
      </div>

      {/* LIVE PREDICTIONS */}
      <div style={{ maxWidth: "900px", margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 900, margin: 0 }}>Live Predictions</h2>
          <Link to="/feed" style={{ color: "#00B4D8", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>See all →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "12px" }}>
          {topPredictions.map(p => (
            <Link to={`/market/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
              <div style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "14px", padding: "20px", cursor: "pointer", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#00B4D840")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a3050")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ background: "#0a1f35", border: `1px solid ${categoryColors[p.category] || "#1a3a5c"}40`, color: categoryColors[p.category] || "#00B4D8", padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, marginBottom: "10px", display: "inline-block" }}>
                      {p.category}
                    </span>
                    <p style={{ color: "#ffffff", fontWeight: 600, margin: 0, fontSize: "15px", lineHeight: 1.4 }}>{p.question}</p>
                  </div>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: p.confidence >= 70 ? "#00ff88" : p.confidence >= 50 ? "#00B4D8" : "#ff6b6b" }}>{p.confidence}%</div>
                    <div style={{ fontSize: "10px", color: "#6b7f99", fontWeight: 700 }}>CONFIDENCE</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: "900px", margin: "0 auto 80px", padding: "0 24px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 900, textAlign: "center", marginBottom: "40px" }}>How HiveMind works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {[
            { step: "01", icon: "🎯", title: "Make a Prediction", desc: "Post your forecast with a confidence level from 1-99%. Be bold — vague predictions don't count." },
            { step: "02", icon: "🗳️", title: "Community Votes", desc: "Other forecasters vote agree or disagree, moving the community consensus in real time." },
            { step: "03", icon: "✅", title: "Predictions Resolve", desc: "When the event happens, predictions are marked correct or incorrect. Your accuracy score updates automatically." },
            { step: "04", icon: "🏆", title: "Climb the Leaderboard", desc: "Build your reputation as a top forecaster. Compete in monthly tournaments for real prizes." },
          ].map(s => (
            <div key={s.step} style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "16px", padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", color: "#00B4D8", fontWeight: 900, letterSpacing: "1px" }}>{s.step}</span>
                <span style={{ fontSize: "24px" }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "10px" }}>{s.title}</div>
              <div style={{ color: "#6b7f99", fontSize: "14px", lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ textAlign: "center", padding: "60px 24px 100px" }}>
        <div style={{ background: "linear-gradient(135deg, #0d1f35, #091525)", border: "1px solid #1a3a5c", borderRadius: "24px", padding: "60px 40px", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🐝</div>
          <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "16px", lineHeight: 1.2 }}>Ready to prove you can predict the future?</h2>
          <p style={{ color: "#6b7f99", fontSize: "16px", marginBottom: "32px", lineHeight: 1.6 }}>Join the HiveMind community. Make predictions, build your track record, and compete for $500.</p>
          {!user ? (
            <Link to="/auth" style={{ background: "#00B4D8", color: "#000", padding: "18px 48px", borderRadius: "12px", fontWeight: 900, fontSize: "17px", textDecoration: "none", display: "inline-block" }}>
              Join Free — No Credit Card
            </Link>
          ) : (
            <Link to="/feed" style={{ background: "#00B4D8", color: "#000", padding: "18px 48px", borderRadius: "12px", fontWeight: 900, fontSize: "17px", textDecoration: "none", display: "inline-block" }}>
              Make Your First Prediction →
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}
