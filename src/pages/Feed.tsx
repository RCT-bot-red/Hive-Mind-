import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

type IconData = { icon: React.ReactNode; color: string; bg: string };

const getPredictionIcon = (question: string, category: string): IconData => {
  const q = question.toLowerCase();
  const t = "#00B4D8", g = "#00ff88", gold = "#ffd700", r = "#ff6b6b", p = "#a855f7", o = "#f97316", pink = "#ec4899";

  const ico = (path: string, c: string) => ({
    color: c, bg: c + "15",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: path}}/>
  });

  if (q.includes("bitcoin") || q.includes("crypto") || q.includes("ethereum") || q.includes("btc"))
    return ico('<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', "#f7931a");
  if (q.includes("stock") || q.includes("s&p") || q.includes("nasdaq") || q.includes("dow") || q.includes("market cap"))
    return ico('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>', g);
  if (q.includes("fed") || q.includes("interest rate") || q.includes("inflation") || q.includes("fomc"))
    return ico('<rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>', t);
  if (q.includes("oil") || q.includes("energy") || q.includes("gas") || q.includes("opec"))
    return ico('<path d="M12 2v6l3 3-3 3v6"/><path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/>', o);
  if (q.includes("election") || q.includes("vote") || q.includes("poll") || q.includes("president") || q.includes("trump") || q.includes("congress") || q.includes("senate"))
    return ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', r);
  if (q.includes("war") || q.includes("ukraine") || q.includes("russia") || q.includes("military") || q.includes("nato") || q.includes("conflict"))
    return ico('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', r);
  if (q.includes("ai") || q.includes("artificial intelligence") || q.includes("openai") || q.includes("chatgpt") || q.includes("llm") || q.includes("gpt") || q.includes("claude"))
    return ico('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="12" cy="10" r="3"/>', p);
  if (q.includes("apple") || q.includes("iphone") || q.includes("microsoft") || q.includes("google") || q.includes("meta") || q.includes("amazon") || q.includes("nvidia") || q.includes("tech"))
    return ico('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>', t);
  if (q.includes("tesla") || q.includes("electric car") || q.includes("ev "))
    return ico('<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="9" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>', t);
  if (q.includes("space") || q.includes("nasa") || q.includes("rocket") || q.includes("moon") || q.includes("mars") || q.includes("spacex"))
    return ico('<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>', p);
  if (q.includes("nba") || q.includes("basketball"))
    return ico('<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/><path d="M12 2a10 10 0 0 1 10 10"/>', gold);
  if (q.includes("nfl") || q.includes("super bowl"))
    return ico('<path d="M21.73 2.27a1 1 0 0 0-1.41 0L18 4.59 15.41 2 14 3.41 16.59 6 14 8.59l1.41 1.41L18 7.41l2.59 2.59L22 8.59 19.41 6 22 3.41z"/><path d="M2 22l10-10"/>', gold);
  if (q.includes("soccer") || q.includes("world cup") || q.includes("fifa") || q.includes("champions league") || q.includes("premier league"))
    return ico('<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/><path d="M19.07 4.93L4.93 19.07"/>', gold);
  if (q.includes("sport") || q.includes("olympic") || q.includes("champion") || q.includes("tournament"))
    return ico('<polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a2 2 0 0 0-2 2v2c0 3.31 2.69 6 6 6h8c3.31 0 6-2.69 6-6V6a2 2 0 0 0-2-2h-3"/><rect x="7" y="2" width="10" height="9" rx="2"/>', gold);
  if (q.includes("climate") || q.includes("temperature") || q.includes("carbon") || q.includes("emission") || q.includes("warming"))
    return ico('<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>', g);
  if (q.includes("health") || q.includes("covid") || q.includes("vaccine") || q.includes("hospital") || q.includes("drug") || q.includes("cancer"))
    return ico('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', pink);
  if (q.includes("gold") || q.includes("dollar") || q.includes("currency") || q.includes("euro") || q.includes("recession") || q.includes("gdp"))
    return ico('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', gold);
  if (q.includes("movie") || q.includes("oscar") || q.includes("film") || q.includes("box office") || q.includes("grammy"))
    return ico('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>', o);

  const fallbacks: Record<string, IconData> = {
    Politics: ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', r),
    Economics: ico('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>', g),
    Sports: ico('<polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><rect x="7" y="2" width="10" height="9" rx="2"/>', gold),
    Technology: ico('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>', t),
    "World Events": ico('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', p),
    Science: ico('<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11"/><circle cx="12" cy="16" r="3"/>', t),
    Climate: ico('<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>', g),
    Health: ico('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', pink),
  };
  return fallbacks[category] || ico('<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>', t);
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
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const daysLeft = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.floor(diff / 86400000);
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    return `${days}d left`;
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
            <button key={cat} onClick={() => setCategory(cat)} style={{ background: category === cat ? "#00B4D8" : "#0d1f35", border: `1px solid ${category === cat ? "#00B4D8" : "#1a3050"}`, color: category === cat ? "#000" : "#8899aa", padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              {cat}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "80px" }}>Loading...</div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050", color: "#6b7f99" }}>No predictions in this category yet</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {predictions.map(p => {
              const pi = getPredictionIcon(p.question, p.category);
              const days = daysLeft(p.resolution_date);
              const expired = days === "Expired";
              const confColor = p.confidence >= 65 ? "#00ff88" : p.confidence >= 45 ? "#00B4D8" : "#ff6b6b";
              return (
                <div key={p.id} onClick={() => navigate(`/market/${p.id}`)}
                  style={{ cursor: "pointer", background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "16px", overflow: "hidden", transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = pi.color + "50"; e.currentTarget.style.boxShadow = `0 8px 32px ${pi.color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1a3050"; e.currentTarget.style.boxShadow = "none"; }}>

                  {/* Icon header */}
                  <div style={{ background: pi.bg, padding: "24px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `1px solid ${pi.color}20` }}>
                    {pi.icon}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <div style={{ fontSize: "32px", fontWeight: 900, color: confColor, lineHeight: 1 }}>{p.confidence}%</div>
                      <span style={{ background: expired ? "#ff444420" : pi.bg, border: `1px solid ${expired ? "#ff4444" : pi.color}40`, color: expired ? "#ff4444" : pi.color, padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 }}>
                        {days}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ background: pi.bg, border: `1px solid ${pi.color}40`, color: pi.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>{p.category}</span>
                    </div>
                    <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "14px", lineHeight: 1.5, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {p.question}
                    </p>
                    <div style={{ background: "#ff444430", borderRadius: "4px", height: "4px", marginBottom: "12px", overflow: "hidden" }}>
                      <div style={{ background: `linear-gradient(90deg, ${pi.color}, ${pi.color}aa)`, width: `${p.confidence}%`, height: "100%", borderRadius: "4px" }}/>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#3a5070" }}>{timeAgo(p.created_at)}</span>
                      <span style={{ fontSize: "12px", color: pi.color, fontWeight: 700 }}>Vote →</span>
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
