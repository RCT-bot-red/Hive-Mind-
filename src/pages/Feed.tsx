import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

type IconData = { icon: React.ReactNode; color: string; gradient: string };

const getPredictionIcon = (question: string, category: string): IconData => {
  const q = question.toLowerCase();

  const mk = (paths: string, color: string, gradient: string): IconData => ({
    color, gradient,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <g dangerouslySetInnerHTML={{ __html: paths }}/>
      </svg>
    )
  });

  if (q.includes("bitcoin") || q.includes("crypto") || q.includes("ethereum") || q.includes("btc"))
    return mk('<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', "#f7931a", "135deg, #f7931a20, #f7931a05");
  if (q.includes("stock") || q.includes("s&p") || q.includes("nasdaq") || q.includes("dow") || q.includes("index"))
    return mk('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>', "#00ff88", "135deg, #00ff8820, #00ff8805");
  if (q.includes("fed") || q.includes("interest rate") || q.includes("inflation") || q.includes("fomc"))
    return mk('<rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>', "#00B4D8", "135deg, #00B4D820, #00B4D805");
  if (q.includes("oil") || q.includes("energy") || q.includes("gas") || q.includes("opec"))
    return mk('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>', "#f97316", "135deg, #f9731620, #f9731605");
  if (q.includes("election") || q.includes("vote") || q.includes("poll") || q.includes("president") || q.includes("trump") || q.includes("congress") || q.includes("senate") || q.includes("political"))
    return mk('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', "#ff6b6b", "135deg, #ff6b6b20, #ff6b6b05");
  if (q.includes("war") || q.includes("ukraine") || q.includes("russia") || q.includes("military") || q.includes("nato") || q.includes("conflict") || q.includes("attack"))
    return mk('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', "#ff6b6b", "135deg, #ff6b6b20, #ff6b6b05");
  if (q.includes("ai") || q.includes("artificial intelligence") || q.includes("openai") || q.includes("chatgpt") || q.includes("llm") || q.includes("gpt") || q.includes("claude") || q.includes("gemini"))
    return mk('<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>', "#a855f7", "135deg, #a855f720, #a855f705");
  if (q.includes("apple") || q.includes("iphone") || q.includes("mac"))
    return mk('<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/>', "#6b7f99", "135deg, #6b7f9920, #6b7f9905");
  if (q.includes("tesla") || q.includes("electric car") || q.includes(" ev "))
    return mk('<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="9" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>', "#e82127", "135deg, #e8212720, #e8212705");
  if (q.includes("microsoft") || q.includes("windows") || q.includes("azure"))
    return mk('<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>', "#00B4D8", "135deg, #00B4D820, #00B4D805");
  if (q.includes("google") || q.includes("alphabet") || q.includes("youtube"))
    return mk('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', "#4285f4", "135deg, #4285f420, #4285f405");
  if (q.includes("amazon") || q.includes("aws"))
    return mk('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>', "#ff9900", "135deg, #ff990020, #ff990005");
  if (q.includes("nvidia") || q.includes("chip") || q.includes("semiconductor"))
    return mk('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>', "#76b900", "135deg, #76b90020, #76b90005");
  if (q.includes("space") || q.includes("nasa") || q.includes("rocket") || q.includes("moon") || q.includes("mars") || q.includes("spacex") || q.includes("satellite"))
    return mk('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>', "#a855f7", "135deg, #a855f720, #a855f705");
  if (q.includes("nba") || q.includes("basketball"))
    return mk('<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93c4.69 4.69 4.69 12.28 0 16.97"/><path d="M19.07 4.93c-4.69 4.69-4.69 12.28 0 16.97"/><line x1="2" y1="12" x2="22" y2="12"/>', "#ff6b35", "135deg, #ff6b3520, #ff6b3505");
  if (q.includes("nfl") || q.includes("super bowl") || q.includes("quarterback"))
    return mk('<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12h8M12 8v8"/>', "#013369", "135deg, #00B4D820, #00B4D805");
  if (q.includes("soccer") || q.includes("world cup") || q.includes("fifa") || q.includes("champions league") || q.includes("premier league") || q.includes("football") && q.includes("european"))
    return mk('<circle cx="12" cy="12" r="10"/><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>', "#00ff88", "135deg, #00ff8820, #00ff8805");
  if (q.includes("climate") || q.includes("temperature") || q.includes("carbon") || q.includes("emission") || q.includes("warming") || q.includes("weather"))
    return mk('<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>', "#00ff88", "135deg, #00ff8820, #00ff8805");
  if (q.includes("health") || q.includes("covid") || q.includes("vaccine") || q.includes("hospital") || q.includes("drug") || q.includes("cancer") || q.includes("disease"))
    return mk('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', "#ec4899", "135deg, #ec489920, #ec489905");
  if (q.includes("gold") || q.includes("recession") || q.includes("gdp") || q.includes("economy") || q.includes("dollar") || q.includes("currency"))
    return mk('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', "#ffd700", "135deg, #ffd70020, #ffd70005");
  if (q.includes("movie") || q.includes("oscar") || q.includes("film") || q.includes("grammy") || q.includes("music") || q.includes("award"))
    return mk('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>', "#f97316", "135deg, #f9731620, #f9731605");
  if (q.includes("china") || q.includes("taiwan") || q.includes("beijing") || q.includes("xi jinping"))
    return mk('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', "#ff6b6b", "135deg, #ff6b6b20, #ff6b6b05");
  if (q.includes("real estate") || q.includes("housing") || q.includes("mortgage") || q.includes("home price"))
    return mk('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', "#ffd700", "135deg, #ffd70020, #ffd70005");

  // Category fallbacks
  const fallbacks: Record<string, IconData> = {
    Politics: mk('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', "#ff6b6b", "135deg, #ff6b6b20, #ff6b6b05"),
    Economics: mk('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>', "#00ff88", "135deg, #00ff8820, #00ff8805"),
    Sports: mk('<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/>', "#ffd700", "135deg, #ffd70020, #ffd70005"),
    Technology: mk('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>', "#00B4D8", "135deg, #00B4D820, #00B4D805"),
    "World Events": mk('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', "#a855f7", "135deg, #a855f720, #a855f705"),
    Science: mk('<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/>', "#00B4D8", "135deg, #00B4D820, #00B4D805"),
    Climate: mk('<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>', "#00ff88", "135deg, #00ff8820, #00ff8805"),
    Health: mk('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', "#ec4899", "135deg, #ec489920, #ec489905"),
  };
  return fallbacks[category] || mk('<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>', "#00B4D8", "135deg, #00B4D820, #00B4D805");
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const daysLeft = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    const d = Math.floor(diff / 86400000);
    if (d < 0) return { text: "Expired", urgent: true };
    if (d === 0) return { text: "Today", urgent: true };
    if (d <= 3) return { text: `${d}d left`, urgent: true };
    return { text: `${d}d left`, urgent: false };
  };

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "6px", letterSpacing: "-0.5px" }}>Predictions Feed</h1>
          <p style={{ color: "#6b7f99", fontSize: "15px", margin: 0 }}>{predictions.length} active predictions — click to vote</p>
        </div>

        {/* Filters */}
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
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "#0d1f35", borderRadius: "16px", height: "200px", opacity: 0.4 }}/>
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050", color: "#6b7f99" }}>
            No predictions in this category yet
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {predictions.map(p => {
              const pi = getPredictionIcon(p.question, p.category);
              const dl = daysLeft(p.resolution_date);
              const confColor = p.confidence >= 65 ? "#00ff88" : p.confidence >= 45 ? "#00B4D8" : "#ff6b6b";

              return (
                <div key={p.id} onClick={() => navigate(`/market/${p.id}`)}
                  style={{ cursor: "pointer", background: "#0d1f35", border: `1px solid #1a3050`, borderRadius: "18px", overflow: "hidden", transition: "all 0.2s ease", position: "relative" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = pi.color + "60"; e.currentTarget.style.boxShadow = `0 12px 40px ${pi.color}12`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1a3050"; e.currentTarget.style.boxShadow = "none"; }}>

                  {/* Colored accent bar top */}
                  <div style={{ height: "3px", background: `linear-gradient(90deg, ${pi.color}, ${pi.color}40)` }}/>

                  <div style={{ padding: "20px" }}>
                    {/* Top row: icon + confidence */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      {/* Icon in circle */}
                      <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `linear-gradient(${pi.gradient})`, border: `1px solid ${pi.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {pi.icon}
                      </div>

                      {/* Confidence + days */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "36px", fontWeight: 900, color: confColor, lineHeight: 1 }}>
                          {p.confidence}%
                        </div>
                        <div style={{ fontSize: "11px", color: confColor + "aa", fontWeight: 600, marginTop: "2px" }}>
                          YES probability
                        </div>
                      </div>
                    </div>

                    {/* Question */}
                    <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px", lineHeight: 1.5, margin: "0 0 16px", minHeight: "46px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {p.question}
                    </p>

                    {/* Progress bar */}
                    <div style={{ background: "#0a1628", borderRadius: "6px", height: "6px", marginBottom: "14px", overflow: "hidden" }}>
                      <div style={{ background: `linear-gradient(90deg, ${pi.color}, ${pi.color}80)`, width: `${p.confidence}%`, height: "100%", borderRadius: "6px", transition: "width 0.8s ease" }}/>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ background: `${pi.color}15`, border: `1px solid ${pi.color}30`, color: pi.color, padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 }}>
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
