import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

type PredTheme = { color: string; bg: string; label: string; svg: string };

const getTheme = (question: string, category: string): PredTheme => {
  const q = question.toLowerCase();
  if (q.includes("bitcoin") || q.includes("btc"))
    return { color: "#f7931a", bg: "#f7931a", label: "₿", svg: '<text x="12" y="17" text-anchor="middle" font-size="18" font-weight="900" font-family="Arial" fill="#f7931a">₿</text>' };
  if (q.includes("ethereum") || q.includes("eth") || q.includes("crypto"))
    return { color: "#627eea", bg: "#627eea", label: "Ξ", svg: '<polygon points="12,2 20,12 12,16 4,12" fill="#627eea" opacity="0.8"/><polygon points="12,16 20,12 12,22 4,12" fill="#627eea" opacity="0.5"/>' };
  if (q.includes("stock") || q.includes("s&p") || q.includes("nasdaq") || q.includes("dow") || q.includes("index"))
    return { color: "#00ff88", bg: "#00ff88", label: "📊", svg: '<line x1="6" y1="4" x2="6" y2="20" stroke-width="1"/><rect x="4" y="8" width="4" height="7" rx="0.5"/><line x1="12" y1="2" x2="12" y2="20" stroke-width="1"/><rect x="10" y="6" width="4" height="9" rx="0.5"/><line x1="18" y1="6" x2="18" y2="20" stroke-width="1"/><rect x="16" y="10" width="4" height="6" rx="0.5"/>' };
  if (q.includes("gold") || q.includes("silver"))
    return { color: "#ffd700", bg: "#ffd700", label: "Au", svg: '<rect x="3" y="8" width="18" height="10" rx="2" fill="#ffd700" opacity="0.3"/><rect x="3" y="8" width="18" height="10" rx="2"/><line x1="7" y1="8" x2="7" y2="18"/><line x1="12" y1="8" x2="12" y2="18"/><line x1="17" y1="8" x2="17" y2="18"/>' };
  if (q.includes("oil") || q.includes("opec") || q.includes("crude"))
    return { color: "#f97316", bg: "#f97316", label: "🛢", svg: '<ellipse cx="12" cy="7" rx="7" ry="3" fill="none"/><rect x="5" y="7" width="14" height="12"/><ellipse cx="12" cy="19" rx="7" ry="3" fill="none"/><line x1="5" y1="11" x2="19" y2="11"/><line x1="5" y1="15" x2="19" y2="15"/>' };
  if (q.includes("fed") || q.includes("interest rate") || q.includes("inflation"))
    return { color: "#00B4D8", bg: "#00B4D8", label: "🏦", svg: '<rect x="2" y="18" width="20" height="2"/><rect x="4" y="10" width="2" height="8"/><rect x="8" y="10" width="2" height="8"/><rect x="12" y="10" width="2" height="8"/><rect x="16" y="10" width="2" height="8"/><polygon points="12,2 2,10 22,10"/>' };
  if (q.includes("recession") || q.includes("gdp") || q.includes("economy") || q.includes("dollar") || q.includes("currency"))
    return { color: "#4ade80", bg: "#4ade80", label: "$", svg: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' };
  if (q.includes("election") || q.includes("vote") || q.includes("president") || q.includes("trump") || q.includes("congress"))
    return { color: "#ff4444", bg: "#ff4444", label: "🏛", svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' };
  if (q.includes("war") || q.includes("ukraine") || q.includes("nato") || q.includes("military"))
    return { color: "#ef4444", bg: "#ef4444", label: "⚔", svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' };
  if (q.includes("china") || q.includes("taiwan") || q.includes("xi"))
    return { color: "#dc2626", bg: "#dc2626", label: "🌏", svg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' };
  if (q.includes("ai") || q.includes("openai") || q.includes("chatgpt") || q.includes("gpt") || q.includes("llm") || q.includes("claude") || q.includes("gemini"))
    return { color: "#a855f7", bg: "#a855f7", label: "AI", svg: '<rect x="4" y="4" width="16" height="16" rx="8"/><circle cx="9" cy="10" r="1.5" fill="#a855f7"/><circle cx="15" cy="10" r="1.5" fill="#a855f7"/><path d="M9 14s1 1 3 1 3-1 3-1"/>' };
  if (q.includes("nvidia") || q.includes("chip") || q.includes("semiconductor"))
    return { color: "#76b900", bg: "#76b900", label: "GPU", svg: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><line x1="9" y1="2" x2="9" y2="6"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="15" y1="2" x2="15" y2="6"/><line x1="9" y1="18" x2="9" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="15" y1="18" x2="15" y2="22"/>' };
  if (q.includes("tesla") || q.includes("electric car") || q.includes("elon"))
    return { color: "#cc0000", bg: "#cc0000", label: "⚡", svg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' };
  if (q.includes("apple") || q.includes("iphone"))
    return { color: "#6b7280", bg: "#6b7280", label: "", svg: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>' };
  if (q.includes("microsoft") || q.includes("windows"))
    return { color: "#0078d4", bg: "#0078d4", label: "", svg: '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>' };
  if (q.includes("space") || q.includes("nasa") || q.includes("rocket") || q.includes("moon") || q.includes("mars"))
    return { color: "#818cf8", bg: "#818cf8", label: "🚀", svg: '<path d="M12 2c0 0-7 5-7 11v2l3 3h8l3-3v-2c0-6-7-11-7-11z"/><circle cx="12" cy="11" r="2" fill="#818cf8"/><path d="M9 17l-3 4h12l-3-4"/>' };
  if (q.includes("nba") || q.includes("basketball"))
    return { color: "#ff6b35", bg: "#ff6b35", label: "🏀", svg: '<circle cx="12" cy="12" r="9"/><path d="M3.5 7 Q12 10 20.5 7" fill="none"/><path d="M3.5 17 Q12 14 20.5 17" fill="none"/><line x1="12" y1="3" x2="12" y2="21"/>' };
  if (q.includes("nhl") || q.includes("hockey") || q.includes("stanley cup") || q.includes("hurricanes") || q.includes("canadiens") || q.includes("avalanche") || q.includes("sabres") || q.includes("flyers") || q.includes("golden knights") || q.includes("ducks") || q.includes("conn smythe") || q.includes("playoff"))
    return { color: "#60a5fa", bg: "#60a5fa", label: "🏒", svg: '<path d="M5 3 C5 3 5 14 5 16 C5 18 7 20 9 20 L19 20" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="13" cy="20" rx="5" ry="2.5" fill="none" stroke-width="1.5"/>' };
  if (q.includes("nfl") || q.includes("super bowl") || q.includes("touchdown"))
    return { color: "#5b4fcf", bg: "#5b4fcf", label: "🏈", svg: '<ellipse cx="12" cy="12" rx="9" ry="5.5" transform="rotate(-30 12 12)"/><line x1="8" y1="9" x2="15" y2="15" stroke-width="2"/>' };
  if (q.includes("soccer") || q.includes("world cup") || q.includes("fifa") || q.includes("champions league") || q.includes("premier league"))
    return { color: "#16a34a", bg: "#16a34a", label: "⚽", svg: '<circle cx="12" cy="12" r="9"/><polygon points="12 5 14.5 9 18 9 15.5 12 16.5 16 12 13.5 7.5 16 8.5 12 6 9 9.5 9" fill="none" stroke-width="1.2"/>' };
  if (q.includes("climate") || q.includes("carbon") || q.includes("warming") || q.includes("emission"))
    return { color: "#22c55e", bg: "#22c55e", label: "🌡", svg: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>' };
  if (q.includes("health") || q.includes("covid") || q.includes("vaccine") || q.includes("fda") || q.includes("cancer"))
    return { color: "#ec4899", bg: "#ec4899", label: "♥", svg: '<rect x="8" y="2" width="8" height="20" rx="1"/><rect x="2" y="8" width="20" height="8" rx="1"/>' };
  const cats: Record<string, PredTheme> = {
    Politics: { color: "#ff4444", bg: "#ff4444", label: "🏛", svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' },
    Economics: { color: "#00ff88", bg: "#00ff88", label: "$", svg: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>' },
    Sports: { color: "#ff6b35", bg: "#ff6b35", label: "⚽", svg: '<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/>' },
    Technology: { color: "#00B4D8", bg: "#00B4D8", label: "💻", svg: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
    "World Events": { color: "#a855f7", bg: "#a855f7", label: "🌍", svg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
    Science: { color: "#06b6d4", bg: "#06b6d4", label: "🔬", svg: '<path d="M9 3h6v8l4 7H5l4-7V3z"/>' },
    Climate: { color: "#22c55e", bg: "#22c55e", label: "🌿", svg: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>' },
    Health: { color: "#ec4899", bg: "#ec4899", label: "♥", svg: '<rect x="8" y="2" width="8" height="20" rx="1"/><rect x="2" y="8" width="20" height="8" rx="1"/>' },
  };
  return cats[category] || { color: "#00B4D8", bg: "#00B4D8", label: "?", svg: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>' };
};

export default function Feed() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => { fetchPredictions(); }, [category]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("predictions")
        .select("id, question, category, confidence, resolution_date, status, created_at, image_url")
        .eq("status", "open");
      if (category !== "All") query = query.eq("category", category);
      const { data } = await query;
      setPredictions(data || []);
    } finally { setLoading(false); }
  };

  const filtered = (predictions || [])
    .filter(p => search === "" || p.question.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "highest") return b.confidence - a.confidence;
      if (sort === "lowest") return a.confidence - b.confidence;
      if (sort === "ending") return new Date(a.resolution_date).getTime() - new Date(b.resolution_date).getTime();
      return 0;
    });

  const timeAgo = (date: string) => {
    const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const daysLeft = (date: string) => {
    const d = Math.floor((new Date(date).getTime() - Date.now()) / 86400000);
    if (d < 0) return { text: "Expired", urgent: true, color: "#ff4444" };
    if (d === 0) return { text: "Today", urgent: true, color: "#ff4444" };
    if (d <= 3) return { text: `${d}d left`, urgent: true, color: "#ffd700" };
    return { text: `${d}d left`, urgent: false, color: "#3a5070" };
  };

  return (
    <div style={{ backgroundColor: "#070e1a", minHeight: "100vh" }}>

      {/* TOP BANNER */}
      <div style={{ background: "linear-gradient(180deg, #0a1628 0%, #070e1a 100%)", borderBottom: "1px solid #0f2040", padding: "36px 32px 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Title row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px", color: "#ffffff" }}>
                  Predictions Feed
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#00ff8812", border: "1px solid #00ff8835", color: "#00ff88", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "1px" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00ff88", animation: "pulse 2s infinite" }}/>
                  LIVE
                </div>
              </div>
              <p style={{ color: "#3a5070", fontSize: "13px", margin: 0 }}>
                <span style={{ color: "#00B4D8", fontWeight: 700 }}>{filtered.length}</span> active markets · click any to forecast
              </p>
            </div>

            {/* Search */}
            <div style={{ position: "relative", width: "280px" }}>
              <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a5070" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search markets..."
                style={{ width: "100%", background: "#0a1628", border: "1px solid #0f2040", borderRadius: "10px", padding: "10px 14px 10px 36px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#00B4D840"}
                onBlur={e => e.target.style.borderColor = "#0f2040"}
              />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#3a5070", cursor: "pointer", fontSize: "16px" }}>×</button>}
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none", marginBottom: "14px" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                background: category === cat ? "#00B4D8" : "transparent",
                border: `1px solid ${category === cat ? "#00B4D8" : "#0f2040"}`,
                color: category === cat ? "#000" : "#6b7f99",
                padding: "6px 16px", borderRadius: "20px", fontSize: "12px",
                fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s"
              }}>{cat}</button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: "#1a3050", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginRight: "6px" }}>Sort</span>
            {[
              { key: "newest", label: "Recent" },
              { key: "highest", label: "Highest %" },
              { key: "lowest", label: "Lowest %" },
              { key: "ending", label: "Ending Soon" },
            ].map(s => (
              <button key={s.key} onClick={() => setSort(s.key)} style={{
                background: sort === s.key ? "#00B4D815" : "transparent",
                border: `1px solid ${sort === s.key ? "#00B4D840" : "#0f2040"}`,
                color: sort === s.key ? "#00B4D8" : "#3a5070",
                padding: "4px 12px", borderRadius: "6px", fontSize: "12px",
                fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
              }}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 32px 80px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "#0a1628", borderRadius: "16px", height: "280px", opacity: 0.4, animation: "pulse 1.5s ease-in-out infinite" }}/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#3a5070", fontSize: "15px" }}>
            No predictions found
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {filtered.map(p => {
              const theme = getTheme(p.question, p.category);
              const dl = daysLeft(p.resolution_date);
              const confColor = p.confidence >= 65 ? "#00ff88" : p.confidence >= 45 ? "#00B4D8" : "#ff6b6b";

              return (
                <div key={p.id} onClick={() => navigate(`/market/${p.id}`)}
                  style={{
                    cursor: "pointer",
                    background: "linear-gradient(145deg, #0c1e36 0%, #08152a 100%)",
                    border: "1px solid #0f2040",
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.borderColor = "#00ff8850";
                    e.currentTarget.style.boxShadow = "0 0 0 1px #00ff8820, 0 8px 32px #00ff8818, 0 24px 80px #00B4D810";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#0f2040";
                    e.currentTarget.style.boxShadow = "none";
                  }}>

                  {/* Image or icon header */}
                  {p.image_url ? (
                    <div style={{ position: "relative", height: "160px", overflow: "hidden" }}>
                      <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(8,21,42,0.95) 100%)" }}/>
                      <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                        <span style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", color: theme.color, padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, border: `1px solid ${theme.color}30` }}>{p.category}</span>
                      </div>
                      <div style={{ position: "absolute", bottom: "14px", right: "14px" }}>
                        <div style={{ fontSize: "44px", fontWeight: 900, lineHeight: 1, color: confColor, textShadow: `0 0 30px ${confColor}50` }}>{p.confidence}%</div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "2px", textAlign: "right" }}>YES PROB</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: `linear-gradient(135deg, ${theme.color}12, ${theme.color}05)`, borderBottom: `1px solid ${theme.color}15`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${theme.color}15`, border: `1px solid ${theme.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: theme.svg }}/>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "44px", fontWeight: 900, lineHeight: 1, color: confColor }}>{p.confidence}%</div>
                        <div style={{ fontSize: "9px", color: "#3a5070", fontWeight: 700, letterSpacing: "2px" }}>YES PROB</div>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: "16px 18px 14px" }}>
                    {/* Question */}
                    <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "14px", lineHeight: 1.55, margin: "0 0 14px", minHeight: "42px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {p.question}
                    </p>

                    {/* Mini bar */}
                    <div style={{ background: "#0a1628", borderRadius: "3px", height: "3px", marginBottom: "14px", overflow: "hidden" }}>
                      <div style={{ background: `linear-gradient(90deg, ${confColor}, ${confColor}80)`, width: `${p.confidence}%`, height: "100%", borderRadius: "3px" }}/>
                    </div>

                    {/* YES / NO visual bar */}
                    <div style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", height: "36px", gap: "2px" }}>
                        <div style={{ flex: p.confidence, background: "linear-gradient(135deg, #00ff8830, #00ff8818)", border: "1px solid #00ff8840", borderRadius: "6px 0 0 6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s" }}>
                          <span style={{ fontSize: "11px", fontWeight: 900, color: "#00ff88", letterSpacing: "0.5px" }}>YES</span>
                          <span style={{ fontSize: "13px", fontWeight: 900, color: "#00ff88" }}>{p.confidence}%</span>
                        </div>
                        <div style={{ flex: 100 - p.confidence, background: "linear-gradient(135deg, #ff444820, #ff444812)", border: "1px solid #ff444835", borderRadius: "0 6px 6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s" }}>
                          <span style={{ fontSize: "11px", fontWeight: 900, color: "#ff6b6b", letterSpacing: "0.5px" }}>NO</span>
                          <span style={{ fontSize: "13px", fontWeight: 900, color: "#ff6b6b" }}>{100 - p.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #0f2040", paddingTop: "10px" }}>
                      <span style={{ fontSize: "11px", color: "#1a3050" }}>{timeAgo(p.created_at)}</span>
                      <span style={{ fontSize: "11px", color: dl.color, fontWeight: dl.urgent ? 700 : 400 }}>{dl.text}</span>
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
