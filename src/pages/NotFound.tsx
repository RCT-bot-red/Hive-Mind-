import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div style={{ marginBottom: "24px" }}>
          <svg width="80" height="80" viewBox="0 0 160 160" fill="none" style={{ margin: "0 auto", opacity: 0.3 }}>
            <polygon points="80,4 148,42 148,118 80,156 12,118 12,42" fill="none" stroke="#00B4D8" strokeWidth="3"/>
            <polygon points="80,22 130,50 130,110 80,138 30,110 30,50" fill="none" stroke="#00B4D8" strokeWidth="2"/>
            <circle cx="80" cy="78" r="10" fill="#00B4D8"/>
            <circle cx="80" cy="78" r="5" fill="white"/>
          </svg>
        </div>
        <div style={{ fontSize: "96px", fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #00B4D8, #00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "16px" }}>
          404
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "#ffffff" }}>
          Page not found
        </h1>
        <p style={{ color: "#6b7f99", fontSize: "15px", lineHeight: 1.7, marginBottom: "32px" }}>
          This prediction doesn't exist or has been removed. Head back to the feed to explore what the community is forecasting.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/feed" style={{ background: "#00B4D8", color: "#000", padding: "14px 28px", borderRadius: "12px", fontWeight: 700, fontSize: "15px", textDecoration: "none" }}>
            Browse Predictions →
          </Link>
          <Link to="/" style={{ background: "#0d1f35", border: "1px solid #1a3050", color: "#8899aa", padding: "14px 28px", borderRadius: "12px", fontWeight: 700, fontSize: "15px", textDecoration: "none" }}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
