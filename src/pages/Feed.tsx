import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

// Curated Unsplash photo IDs per topic
const getImageUrl = (question: string, category: string): string => {
  const q = question.toLowerCase();
  
  // Specific topics - using direct Unsplash photo IDs
  if (q.includes("bitcoin") || q.includes("crypto") || q.includes("ethereum"))
    return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80";
  if (q.includes("stock") || q.includes("s&p") || q.includes("nasdaq") || q.includes("dow"))
    return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80";
  if (q.includes("fed") || q.includes("interest rate") || q.includes("inflation"))
    return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80";
  if (q.includes("oil") || q.includes("energy") || q.includes("gas") || q.includes("opec"))
    return "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80";
  if (q.includes("gold") || q.includes("silver") || q.includes("commodity"))
    return "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&q=80";
  if (q.includes("trump") || q.includes("president") || q.includes("white house"))
    return "https://images.unsplash.com/photo-1546795708-c962dc089798?w=600&q=80";
  if (q.includes("election") || q.includes("vote") || q.includes("ballot"))
    return "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&q=80";
  if (q.includes("ukraine") || q.includes("russia") || q.includes("war") || q.includes("military"))
    return "https://images.unsplash.com/photo-1579486175395-eb44a0f0ebfd?w=600&q=80";
  if (q.includes("china") || q.includes("taiwan") || q.includes("beijing"))
    return "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=600&q=80";
  if (q.includes("ai") || q.includes("artificial intelligence") || q.includes("openai") || q.includes("chatgpt") || q.includes("llm"))
    return "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80";
  if (q.includes("apple") || q.includes("iphone") || q.includes("ipad") || q.includes("mac"))
    return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80";
  if (q.includes("tesla") || q.includes("electric") || q.includes("ev"))
    return "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80";
  if (q.includes("elon") || q.includes("musk") || q.includes("spacex") || q.includes("x.com"))
    return "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=600&q=80";
  if (q.includes("space") || q.includes("nasa") || q.includes("rocket") || q.includes("moon") || q.includes("mars"))
    return "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80";
  if (q.includes("nba") || q.includes("basketball"))
    return "https://images.unsplash.com/photo-1546519638405-a9d1b34b2d09?w=600&q=80";
  if (q.includes("nfl") || q.includes("super bowl") || q.includes("football"))
    return "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80";
  if (q.includes("soccer") || q.includes("world cup") || q.includes("fifa") || q.includes("champions league"))
    return "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80";
  if (q.includes("climate") || q.includes("global warming") || q.includes("carbon") || q.includes("emission"))
    return "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=600&q=80";
  if (q.includes("covid") || q.includes("pandemic") || q.includes("vaccine") || q.includes("virus"))
    return "https://images.unsplash.com/photo-1584118624012-df056829fbd0?w=600&q=80";
  if (q.includes("recession") || q.includes("gdp") || q.includes("economy"))
    return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80";
  if (q.includes("real estate") || q.includes("housing") || q.includes("mortgage"))
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";
  if (q.includes("dollar") || q.includes("currency") || q.includes("euro") || q.includes("exchange rate"))
    return "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&q=80";
  if (q.includes("movie") || q.includes("oscar") || q.includes("film") || q.includes("box office"))
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80";
  if (q.includes("google") || q.includes("alphabet") || q.includes("search"))
    return "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=600&q=80";
  if (q.includes("meta") || q.includes("facebook") || q.includes("instagram"))
    return "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&q=80";
  if (q.includes("microsoft") || q.includes("windows") || q.includes("azure"))
    return "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=600&q=80";
  if (q.includes("amazon") || q.includes("aws") || q.includes("bezos"))
    return "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=600&q=80";
  if (q.includes("nuclear") || q.includes("weapon") || q.includes("missile"))
    return "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80";
  if (q.includes("bank") || q.includes("financial") || q.includes("wall street"))
    return "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=600&q=80";

  // Category fallbacks with specific curated photos
  const fallbacks: Record<string, string> = {
    Politics: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80",
    Economics: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
    Technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "World Events": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
    Science: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&q=80",
    Climate: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    Health: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
  };
  return fallbacks[category] || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80";
};

const CATEGORY_COLORS: Record<string, string> = {
  Politics: "#ff6b6b", Economics: "#00ff88", Sports: "#ffd700",
  Technology: "#00B4D8", "World Events": "#a855f7", Science: "#22d3ee",
  Climate: "#4ade80", Health: "#f472b6",
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
        .select("id, question, category, confidence, resolution_date, status, created_at, user_id")
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

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "6px", letterSpacing: "-0.5px" }}>
            Predictions Feed
          </h1>
          <p style={{ color: "#6b7f99", fontSize: "15px", margin: 0 }}>
            {predictions.length} active predictions — click to vote and see community probabilities
          </p>
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              background: category === cat ? "#00B4D8" : "#0d1f35",
              border: `1px solid ${category === cat ? "#00B4D8" : "#1a3050"}`,
              color: category === cat ? "#000" : "#8899aa",
              padding: "8px 18px", borderRadius: "20px", fontSize: "13px",
              fontWeight: 700, cursor: "pointer", transition: "all 0.15s"
            }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "#0d1f35", borderRadius: "16px", height: "320px", opacity: 0.5, animation: "pulse 1.5s infinite" }}/>
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050", color: "#6b7f99" }}>
            No predictions in this category yet
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {predictions.map(p => {
              const color = CATEGORY_COLORS[p.category] || "#00B4D8";
              const img = getImageUrl(p.question, p.category);
              const days = daysLeft(p.resolution_date);
              const expired = days === "Expired";

              return (
                <div key={p.id} onClick={() => navigate(`/market/${p.id}`)} style={{ cursor: "pointer", background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "16px", overflow: "hidden", transition: "transform 0.2s, border-color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${color}50`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1a3050"; }}>

                  {/* Image */}
                  <div style={{ position: "relative", height: "160px", overflow: "hidden" }}>
                    <img src={img} alt={p.category} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy"/>
                    {/* Gradient overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, #0d1f35 100%)" }}/>
                    {/* Category badge */}
                    <div style={{ position: "absolute", top: "12px", left: "12px", background: `${color}20`, border: `1px solid ${color}60`, backdropFilter: "blur(8px)", color: color, padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
                      {p.category}
                    </div>
                    {/* Days left badge */}
                    <div style={{ position: "absolute", top: "12px", right: "12px", background: expired ? "#ff444420" : "#0a162880", border: `1px solid ${expired ? "#ff4444" : "#ffffff20"}`, backdropFilter: "blur(8px)", color: expired ? "#ff4444" : "#ffffff", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
                      {days}
                    </div>
                    {/* Confidence overlay on image bottom */}
                    <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
                      <div style={{ fontSize: "32px", fontWeight: 900, color: p.confidence >= 65 ? "#00ff88" : p.confidence >= 45 ? "#00B4D8" : "#ff6b6b", lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                        {p.confidence}%
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "16px" }}>
                    <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px", lineHeight: 1.5, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.question}
                    </p>

                    {/* Progress bar */}
                    <div style={{ background: "#ff444430", borderRadius: "4px", height: "6px", marginBottom: "12px", overflow: "hidden" }}>
                      <div style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)`, width: `${p.confidence}%`, height: "100%", borderRadius: "4px", transition: "width 0.6s ease" }}/>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#3a5070" }}>{timeAgo(p.created_at)}</span>
                      <span style={{ fontSize: "12px", color: color, fontWeight: 700 }}>Vote →</span>
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
