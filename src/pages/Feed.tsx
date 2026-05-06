import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

// Unsplash images per category
const CATEGORY_IMAGES: Record<string, string[]> = {
  Politics: [
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80",
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&q=80",
    "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=600&q=80",
  ],
  Economics: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
  ],
  Sports: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
  ],
  Technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
    "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&q=80",
  ],
  "World Events": [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
    "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=600&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
  ],
  Science: [
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&q=80",
    "https://images.unsplash.com/photo-1532094349884-543559059a2c?w=600&q=80",
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80",
  ],
  Climate: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=600&q=80",
    "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=80",
  ],
  Health: [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  ],
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
];

const getImage = (category: string, id: string) => {
  const images = CATEGORY_IMAGES[category] || DEFAULT_IMAGES;
  const idx = id.charCodeAt(0) % images.length;
  return images[idx];
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
              const img = getImage(p.category, p.id);
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
