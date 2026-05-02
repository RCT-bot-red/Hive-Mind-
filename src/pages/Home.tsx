import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 29, hours: 0, minutes: 0, seconds: 0 });
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    const endDate = new Date("2026-05-31T23:59:59");
    const timer = setInterval(() => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.from("tournament_entries")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => { if (count) setParticipants(count); });
  }, []);

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh" }}>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "80px 32px 48px" }}>
        <p style={{ color: "#00B4D8", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "20px" }}>
          ◎ The prediction market for sharp minds
        </p>
        <h1 style={{ fontSize: "62px", fontWeight: 900, lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-2px" }}>
          Stake your{" "}
          <span style={{ color: "#00B4D8" }}>reputation</span>
          <br />on what happens next.
        </h1>
        <p style={{ fontSize: "17px", color: "#6b7f99", maxWidth: "580px", margin: "0 auto 56px", lineHeight: 1.7 }}>
          Post bold predictions, challenge others publicly, and climb the global accuracy leaderboard. For analysts, nerds, and forecasters.
        </p>

        {/* TOURNAMENT CARD */}
        <div style={{
          background: "linear-gradient(180deg, #0d1f35 0%, #091525 100%)",
          border: "1px solid #1a3a5c",
          borderTop: "3px solid #00B4D8",
          borderRadius: "16px",
          padding: "28px 32px",
          maxWidth: "460px",
          margin: "0 auto 64px",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ background: "#0a1f35", border: "1px solid #1a3a5c", color: "#00B4D8", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
              🏆 MAY 2026
            </span>
            <span style={{ color: "#00cc77", fontSize: "13px", fontWeight: 700 }}>✓ Registered</span>
          </div>

          <div style={{ fontSize: "24px", fontWeight: 900, marginBottom: "6px" }}>Monthly Tournament</div>
          <div style={{ color: "#6b7f99", fontSize: "14px", marginBottom: "28px", lineHeight: 1.5 }}>
            Most accurate forecaster wins the crown. All predictions this month count.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#6b7f99", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "6px" }}>Prize Pool</div>
              <div style={{ fontSize: "42px", fontWeight: 900, color: "#00ff88", lineHeight: 1 }}>$500</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#6b7f99", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "6px" }}>Competitors</div>
              <div style={{ fontSize: "42px", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>{participants}</div>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "#6b7f99", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700, marginBottom: "10px" }}>Time Remaining</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "28px" }}>
            <span style={{ fontSize: "32px", fontWeight: 900 }}>{timeLeft.days}</span>
            <span style={{ fontSize: "14px", color: "#00B4D8", fontWeight: 700, marginRight: "8px" }}>D</span>
            <span style={{ fontSize: "32px", fontWeight: 900 }}>{String(timeLeft.hours).padStart(2, "0")}</span>
            <span style={{ fontSize: "14px", color: "#00B4D8", fontWeight: 700, marginRight: "8px" }}>H</span>
            <span style={{ fontSize: "32px", fontWeight: 900 }}>{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span style={{ fontSize: "14px", color: "#00B4D8", fontWeight: 700, marginRight: "8px" }}>M</span>
            <span style={{ fontSize: "32px", fontWeight: 900 }}>{String(timeLeft.seconds).padStart(2, "0")}</span>
            <span style={{ fontSize: "14px", color: "#00B4D8", fontWeight: 700 }}>S</span>
          </div>

          <Link to="/leaderboard" style={{
            display: "block", width: "100%", background: "transparent",
            border: "1px solid #2a4060", borderRadius: "10px", padding: "14px",
            color: "#ffffff", fontWeight: 600, fontSize: "15px",
            textAlign: "center", textDecoration: "none", marginBottom: "12px",
            transition: "all 0.2s"
          }}>
            View Tournament →
          </Link>
          <Link to="/leaderboard" style={{ display: "block", textAlign: "center", color: "#6b7f99", fontSize: "13px", textDecoration: "none" }}>
            View leaderboard &amp; prizes
          </Link>
        </div>

        {/* CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", maxWidth: "960px", margin: "0 auto", padding: "0 32px 80px" }}>
          {[
            { icon: "⚡", title: "Challenge Others", desc: "Disagree with a forecast? Issue a public challenge with your own confidence rating." },
            { icon: "🏆", title: "Global Ranking", desc: "Compete in monthly tournaments. Build an accuracy track record that gets you noticed." },
            { icon: "📊", title: "Track Record", desc: "Every prediction you make is public and permanent. Your accuracy score tells the real story." }
          ].map((card) => (
            <div key={card.title} style={{
              background: "#0d1f35", border: "1px solid #1a3050",
              borderRadius: "16px", padding: "28px", textAlign: "left"
            }}>
              <div style={{ fontSize: "28px", marginBottom: "14px" }}>{card.icon}</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>{card.title}</div>
              <div style={{ color: "#6b7f99", fontSize: "14px", lineHeight: 1.7 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}