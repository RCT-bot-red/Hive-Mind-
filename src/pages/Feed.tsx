import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events"];

export default function Feed() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, [category]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("predictions")
        .select("id, question, category, confidence, resolution_date, status, created_at, user_id")
        .order("created_at", { ascending: false });
      if (category !== "All") {
        query = query.eq("category", category);
      }
      const { data, error } = await query;
      if (error) throw error;
      setPredictions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "48px 32px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Predictions Feed
          </h1>
          <p style={{ color: "#6b7f99", fontSize: "15px" }}>
            Click any prediction to vote and see community probabilities
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "32px", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                background: category === cat ? "#00B4D8" : "#0d1f35",
                border: `1px solid ${category === cat ? "#00B4D8" : "#1a3050"}`,
                color: category === cat ? "#000000" : "#8899aa",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "60px 0", fontSize: "16px" }}>
            Loading predictions...
          </div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "80px 0", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔮</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>No predictions yet</div>
          </div>
        ) : (
          predictions.map((pred) => (
            <div
              key={pred.id}
              onClick={() => navigate(`/market/${pred.id}`)}
              style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "14px", padding: "22px 24px", marginBottom: "14px", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#00B4D8")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a3050")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ background: "#0a1f35", border: "1px solid #1a3a5c", color: "#00B4D8", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>
                  {pred.category}
                </span>
                <span style={{ color: "#6b7f99", fontSize: "13px" }}>{timeAgo(pred.created_at)}</span>
              </div>

              <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "16px", lineHeight: 1.4, color: "#ffffff" }}>
                {pred.question}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7f99" }}>Confidence</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#00B4D8" }}>{pred.confidence}%</span>
                </div>
                <div style={{ background: "#1a3050", borderRadius: "4px", height: "6px" }}>
                  <div style={{ background: "linear-gradient(90deg, #00B4D8, #00ff88)", width: `${pred.confidence}%`, height: "100%", borderRadius: "4px" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#00B4D8", fontWeight: 700 }}>Click to vote →</span>
                <div style={{ fontSize: "12px", color: "#6b7f99" }}>
                  Resolves {new Date(pred.resolution_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}