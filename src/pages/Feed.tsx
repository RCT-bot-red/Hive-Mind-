import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

// Gradient colors from the app
const TEAL = "#00B4D8";
const GREEN = "#00ff88";

const GradientDefs = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={TEAL} />
      <stop offset="100%" stopColor={GREEN} />
    </linearGradient>
  </defs>
);

// Each icon component gets the gradient stroke
const Icon = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${TEAL}50)` }}>
    <GradientDefs id={id} />
    <g stroke={`url(#${id})`}>{children}</g>
  </svg>
);

const getIcon = (question: string, category: string, id: string) => {
  const q = question.toLowerCase();
  const gid = `g${id.slice(0, 8)}`;

  if (q.includes("bitcoin") || q.includes("crypto") || q.includes("ethereum") || q.includes("btc"))
    return <Icon id={gid}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>;
  if (q.includes("stock") || q.includes("s&p") || q.includes("nasdaq") || q.includes("dow") || q.includes("index") || q.includes("market cap"))
    return <Icon id={gid}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>;
  if (q.includes("gold") || q.includes("silver") || q.includes("commodity"))
    return <Icon id={gid}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>;
  if (q.includes("fed") || q.includes("interest rate") || q.includes("inflation") || q.includes("fomc"))
    return <Icon id={gid}><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></Icon>;
  if (q.includes("oil") || q.includes("energy") || q.includes("opec") || q.includes("gas price"))
    return <Icon id={gid}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></Icon>;
  if (q.includes("election") || q.includes("vote") || q.includes("ballot") || q.includes("president") || q.includes("trump") || q.includes("congress") || q.includes("senate") || q.includes("primary"))
    return <Icon id={gid}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>;
  if (q.includes("war") || q.includes("ukraine") || q.includes("russia") || q.includes("nato") || q.includes("military") || q.includes("conflict") || q.includes("ceasefire"))
    return <Icon id={gid}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>;
  if (q.includes("ai") || q.includes("artificial intelligence") || q.includes("openai") || q.includes("chatgpt") || q.includes("gpt") || q.includes("llm") || q.includes("claude") || q.includes("gemini") || q.includes("deepseek"))
    return <Icon id={gid}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="9" cy="10" r="2"/><circle cx="15" cy="10" r="2"/><path d="M9 13s1 1 3 1 3-1 3-1"/></Icon>;
  if (q.includes("apple") || q.includes("iphone") || q.includes("mac") || q.includes("ipad"))
    return <Icon id={gid}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></Icon>;
  if (q.includes("tesla") || q.includes("electric car") || q.includes("ev ") || q.includes("elon"))
    return <Icon id={gid}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="9" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></Icon>;
  if (q.includes("nvidia") || q.includes("chip") || q.includes("semiconductor"))
    return <Icon id={gid}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></Icon>;
  if (q.includes("microsoft") || q.includes("windows") || q.includes("azure"))
    return <Icon id={gid}><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></Icon>;
  if (q.includes("google") || q.includes("alphabet") || q.includes("youtube") || q.includes("search engine"))
    return <Icon id={gid}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
  if (q.includes("amazon") || q.includes("aws") || q.includes("bezos"))
    return <Icon id={gid}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Icon>;
  if (q.includes("space") || q.includes("nasa") || q.includes("rocket") || q.includes("moon") || q.includes("mars") || q.includes("spacex") || q.includes("satellite"))
    return <Icon id={gid}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></Icon>;
  if (q.includes("nba") || q.includes("basketball"))
    return <Icon id={gid}><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93c4.69 4.69 4.69 12.28 0 16.97"/><path d="M19.07 4.93c-4.69 4.69-4.69 12.28 0 16.97"/><line x1="2" y1="12" x2="22" y2="12"/></Icon>;
  if (q.includes("nfl") || q.includes("super bowl") || q.includes("quarterback") || q.includes("touchdown"))
    return <Icon id={gid}><ellipse cx="12" cy="12" rx="10" ry="6" transform="rotate(-45 12 12)"/><line x1="5" y1="5" x2="19" y2="19"/></Icon>;
  if (q.includes("soccer") || q.includes("world cup") || q.includes("fifa") || q.includes("premier league") || q.includes("champions league") || q.includes("mls"))
    return <Icon id={gid}><circle cx="12" cy="12" r="10"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
  if (q.includes("climate") || q.includes("temperature") || q.includes("carbon") || q.includes("emission") || q.includes("warming") || q.includes("sea level"))
    return <Icon id={gid}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></Icon>;
  if (q.includes("health") || q.includes("covid") || q.includes("vaccine") || q.includes("hospital") || q.includes("fda") || q.includes("drug") || q.includes("cancer") || q.includes("disease"))
    return <Icon id={gid}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></Icon>;
  if (q.includes("recession") || q.includes("gdp") || q.includes("economy") || q.includes("dollar") || q.includes("currency") || q.includes("euro") || q.includes("yen"))
    return <Icon id={gid}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>;
  if (q.includes("real estate") || q.includes("housing") || q.includes("mortgage") || q.includes("home price") || q.includes("rent"))
    return <Icon id={gid}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>;
  if (q.includes("movie") || q.includes("oscar") || q.includes("film") || q.includes("box office") || q.includes("grammy") || q.includes("music"))
    return <Icon id={gid}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></Icon>;
  if (q.includes("china") || q.includes("taiwan") || q.includes("beijing") || q.includes("xi jinping") || q.includes("trade war"))
    return <Icon id={gid}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>;

  // Category fallbacks
  const fallback: Record<string, React.ReactNode> = {
    Politics: <Icon id={gid}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Icon>,
    Economics: <Icon id={gid}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>,
    Sports: <Icon id={gid}><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></Icon>,
    Technology: <Icon id={gid}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></Icon>,
    "World Events": <Icon id={gid}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Icon>,
    Science: <Icon id={gid}><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><circle cx="12" cy="16" r="2"/></Icon>,
    Climate: <Icon id={gid}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></Icon>,
    Health: <Icon id={gid}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></Icon>,
  };
  return fallback[category] || <Icon id={gid}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></Icon>;
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
              const dl = daysLeft(p.resolution_date);
              return (
                <div key={p.id} onClick={() => navigate(`/market/${p.id}`)}
                  style={{ cursor: "pointer", background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "18px", overflow: "hidden", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#00B4D840"; e.currentTarget.style.boxShadow = "0 12px 40px #00B4D812"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1a3050"; e.currentTarget.style.boxShadow = "none"; }}>

                  {/* Gradient header */}
                  <div style={{ background: "linear-gradient(135deg, #00B4D812, #00ff8808)", borderBottom: "1px solid #00B4D818", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
                    {/* Decorative bg circle */}
                    <div style={{ position: "absolute", right: "-15px", top: "-15px", width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #00B4D810, #00ff8808)", border: "1px solid #00B4D815" }}/>

                    {/* Icon */}
                    <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "linear-gradient(135deg, #00B4D820, #00ff8810)", border: "1px solid #00B4D830", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
                      {getIcon(p.question, p.category, p.id)}
                    </div>

                    {/* Confidence */}
                    <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
                      <div style={{ fontSize: "42px", fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #00B4D8, #00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
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
                      <div style={{ background: "linear-gradient(90deg, #00B4D8, #00ff88)", width: `${p.confidence}%`, height: "100%", borderRadius: "4px" }}/>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ background: "#00B4D815", border: "1px solid #00B4D830", color: "#00B4D8", padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 }}>
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
