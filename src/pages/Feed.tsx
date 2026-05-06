import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

type PredTheme = { color: string; bg: string; label: string; svg: string };

const getTheme = (question: string, category: string): PredTheme => {
  const q = question.toLowerCase();

  // Crypto
  if (q.includes("bitcoin") || q.includes("btc"))
    return { color: "#f7931a", bg: "#f7931a", label: "₿", svg: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' };
  if (q.includes("ethereum") || q.includes("eth") || q.includes("crypto"))
    return { color: "#627eea", bg: "#627eea", label: "Ξ", svg: '<path d="M12 2L2 12l10 6 10-6L12 2z"/><path d="M2 12l10 6 10-6"/>' };

  // Finance
  if (q.includes("stock") || q.includes("s&p") || q.includes("nasdaq") || q.includes("dow") || q.includes("index"))
    return { color: "#00ff88", bg: "#00ff88", label: "📈", svg: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' };
  if (q.includes("gold") || q.includes("silver"))
    return { color: "#ffd700", bg: "#ffd700", label: "Au", svg: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' };
  if (q.includes("oil") || q.includes("energy") || q.includes("opec"))
    return { color: "#f97316", bg: "#f97316", label: "⛽", svg: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>' };
  if (q.includes("fed") || q.includes("interest rate") || q.includes("inflation"))
    return { color: "#00B4D8", bg: "#00B4D8", label: "$", svg: '<rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' };
  if (q.includes("recession") || q.includes("gdp") || q.includes("economy") || q.includes("dollar") || q.includes("currency"))
    return { color: "#4ade80", bg: "#4ade80", label: "$", svg: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' };

  // Politics
  if (q.includes("trump") || q.includes("election") || q.includes("president") || q.includes("vote") || q.includes("congress") || q.includes("senate"))
    return { color: "#ff4444", bg: "#ff4444", label: "🏛", svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' };

  // War & Geopolitics
  if (q.includes("ukraine") || q.includes("russia") || q.includes("war") || q.includes("nato") || q.includes("military"))
    return { color: "#ef4444", bg: "#ef4444", label: "⚔", svg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' };
  if (q.includes("china") || q.includes("taiwan") || q.includes("xi"))
    return { color: "#dc2626", bg: "#dc2626", label: "🌏", svg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' };

  // Tech companies
  if (q.includes("openai") || q.includes("chatgpt") || q.includes("gpt") || q.includes("ai") || q.includes("llm") || q.includes("claude") || q.includes("gemini"))
    return { color: "#a855f7", bg: "#a855f7", label: "AI", svg: '<rect x="2" y="3" width="20" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><circle cx="15" cy="10" r="2"/><path d="M9 13s1 1 3 1 3-1 3-1"/>' };
  if (q.includes("nvidia") || q.includes("chip") || q.includes("semiconductor"))
    return { color: "#76b900", bg: "#76b900", label: "GPU", svg: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>' };
  if (q.includes("apple") || q.includes("iphone"))
    return { color: "#6b7280", bg: "#6b7280", label: "", svg: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>' };
  if (q.includes("tesla"))
    return { color: "#cc0000", bg: "#cc0000", label: "T", svg: '<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="9" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>' };
  if (q.includes("microsoft") || q.includes("windows"))
    return { color: "#0078d4", bg: "#0078d4", label: "", svg: '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>' };
  if (q.includes("google") || q.includes("alphabet"))
    return { color: "#4285f4", bg: "#4285f4", label: "G", svg: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' };
  if (q.includes("amazon") || q.includes("aws"))
    return { color: "#ff9900", bg: "#ff9900", label: "A", svg: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>' };

  // Space
  if (q.includes("space") || q.includes("nasa") || q.includes("rocket") || q.includes("moon") || q.includes("mars") || q.includes("spacex"))
    return { color: "#818cf8", bg: "#818cf8", label: "🚀", svg: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' };

  // Sports
  if (q.includes("nba") || q.includes("basketball"))
    return { color: "#ff6b35", bg: "#ff6b35", label: "", svg: '<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93c4.69 4.69 4.69 12.28 0 16.97"/><path d="M19.07 4.93c-4.69 4.69-4.69 12.28 0 16.97"/><line x1="2" y1="12" x2="22" y2="12"/>' };
  if (q.includes("nfl") || q.includes("super bowl") || q.includes("football"))
    return { color: "#1a3a6e", bg: "#2d5be3", label: "", svg: '<ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)"/><line x1="5" y1="5" x2="19" y2="19"/>' };
  if (q.includes("soccer") || q.includes("world cup") || q.includes("fifa") || q.includes("premier league") || q.includes("champions league"))
    return { color: "#16a34a", bg: "#16a34a", label: "⚽", svg: '<circle cx="12" cy="12" r="10"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' };

  // Environment
  if (q.includes("climate") || q.includes("carbon") || q.includes("emission") || q.includes("warming"))
    return { color: "#22c55e", bg: "#22c55e", label: "🌍", svg: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>' };

  // Health
  if (q.includes("health") || q.includes("covid") || q.includes("vaccine") || q.includes("fda") || q.includes("drug") || q.includes("cancer"))
    return { color: "#ec4899", bg: "#ec4899", label: "♥", svg: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' };

  // Real estate
  if (q.includes("real estate") || q.includes("housing") || q.includes("mortgage"))
    return { color: "#eab308", bg: "#eab308", label: "🏠", svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' };

  // Category fallbacks with distinct colors
  const cats: Record<string, PredTheme> = {
    Politics: { color: "#ff4444", bg: "#ff4444", label: "🏛", svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' },
    Economics: { color: "#00ff88", bg: "#00ff88", label: "$", svg: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>' },
    Sports: { color: "#ff6b35", bg: "#ff6b35", label: "⚽", svg: '<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/>' },
    Technology: { color: "#00B4D8", bg: "#00B4D8", label: "💻", svg: '<rect x="2" y="3" width="20" height="14" rx="2"/>' },
    "World Events": { color: "#a855f7", bg: "#a855f7", label: "🌍", svg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>' },
    Science: { color: "#06b6d4", bg: "#06b6d4", label: "🔬", svg: '<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/>' },
    Climate: { color: "#22c55e", bg: "#22c55e", label: "🌿", svg: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>' },
    Health: { color: "#ec4899", bg: "#ec4899", label: "♥", svg: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
  };
  return cats[category] || { color: "#00B4D8", bg: "#00B4D8", label: "?", svg: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>' };
};

export default function Feed() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPredictions(); }, [category]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("predictions")
        .select("id, question, category, confidence, resolution_date, status, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (category !== "All") query = query.eq("category", category);
      const { data } = await query;
      setPredictions(data || []);
    } finally { setLoading(false); }
  };

  const timeAgo = (date: string) => {
    const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const daysLeft = (date: string) => {
    const d = Math.floor((new Date(date).getTime() - Date.now()) / 86400000);
    if (d < 0) return { text: "Expired", urgent: true };
    if (d === 0) return { text: "Today", urgent: true };
    if (d <= 3) return { text: `${d}d left`, urgent: true };
    return { text: `${d}d left`, urgent: false };
  };

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "6px", letterSpacing: "-0.5px" }}>Predictions Feed</h1>
          <p style={{ color: "#6b7f99", fontSize: "15px", margin: 0 }}>{predictions.length} active predictions — click to vote</p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              background: category === cat ? "#00B4D8" : "#0d1f35",
              border: `1px solid ${category === cat ? "#00B4D8" : "#1a3050"}`,
              color: category === cat ? "#000" : "#8899aa",
              padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, cursor: "pointer"
            }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ background: "#0d1f35", borderRadius: "18px", height: "220px", opacity: 0.4 }}/>)}
          </div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050", color: "#6b7f99" }}>No predictions in this category yet</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {predictions.map(p => {
              const theme = getTheme(p.question, p.category);
              const dl = daysLeft(p.resolution_date);
              const confColor = p.confidence >= 65 ? "#00ff88" : p.confidence >= 45 ? "#00B4D8" : "#ff6b6b";

              return (
                <div key={p.id} onClick={() => navigate(`/market/${p.id}`)}
                  style={{ cursor: "pointer", background: "#0d1f35", border: `1px solid #1a3050`, borderRadius: "18px", overflow: "hidden", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = theme.color + "50"; e.currentTarget.style.boxShadow = `0 12px 40px ${theme.color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1a3050"; e.currentTarget.style.boxShadow = "none"; }}>

                  {/* Colored header */}
                  <div style={{ background: `${theme.color}14`, borderBottom: `1px solid ${theme.color}20`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
                    {/* BG decoration */}
                    <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: `${theme.color}10`, border: `1px solid ${theme.color}15` }}/>

                    {/* Icon square */}
                    <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: `${theme.color}22`, border: `1.5px solid ${theme.color}45`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, flexShrink: 0 }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: `<defs><filter id="glow"><feGaussianBlur stdDeviation="1" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#glow)">${theme.svg}</g>` }}/>
                    </div>

                    {/* Confidence */}
                    <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
                      <div style={{ fontSize: "42px", fontWeight: 900, lineHeight: 1, color: confColor }}>
                        {p.confidence}%
                      </div>
                      <div style={{ fontSize: "10px", color: "#6b7f99", fontWeight: 600, marginTop: "3px", letterSpacing: "1px" }}>YES PROB</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "14px", lineHeight: 1.6, margin: "0 0 14px", minHeight: "44px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {p.question}
                    </p>

                    {/* Progress */}
                    <div style={{ background: "#0a1628", borderRadius: "4px", height: "4px", marginBottom: "14px", overflow: "hidden" }}>
                      <div style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}80)`, width: `${p.confidence}%`, height: "100%", borderRadius: "4px" }}/>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ background: `${theme.color}18`, border: `1px solid ${theme.color}35`, color: theme.color, padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 }}>
                          {p.category}
                        </span>
                        <span style={{ fontSize: "11px", color: "#3a5070" }}>{timeAgo(p.created_at)}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: dl.urgent ? "#ff6b6b" : "#3a5070", fontWeight: dl.urgent ? 700 : 400 }}>
                        {dl.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
