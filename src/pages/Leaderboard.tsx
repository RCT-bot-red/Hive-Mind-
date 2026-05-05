import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("accuracy");

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, accuracy_score, total_predictions, correct_predictions, resolved_predictions")
        .gte("resolved_predictions", 1)
        .order(filter === "accuracy" ? "accuracy_score" : "total_predictions", { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankDisplay = (index: number) => {
    if (index === 0) return { symbol: "1", color: "#ffd700" };
    if (index === 1) return { symbol: "2", color: "#c0c0c0" };
    if (index === 2) return { symbol: "3", color: "#cd7f32" };
    return { symbol: `#${index + 1}`, color: "#6b7f99" };
  };

  const getPrize = (index: number) => {
    if (index === 0) return { label: "50% of pool", color: "#00ff88" };
    if (index === 1) return { label: "20% of pool", color: "#00B4D8" };
    if (index === 2) return { label: "10% of pool", color: "#8899aa" };
    return null;
  };

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "48px 32px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Global Leaderboard
          </h1>
          <p style={{ color: "#6b7f99", fontSize: "15px" }}>
            Ranked by accuracy score — minimum 1 resolved prediction to qualify
          </p>
        </div>

        {/* Tournament Prize Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0d1f35 0%, #091525 100%)",
          border: "1px solid #1a3a5c",
          borderTop: "3px solid #00ff88",
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "32px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          textAlign: "center"
        }}>
          {[
            { place: "1st Place", prize: "50% of pool", icon: "1", color: "#ffd700" },
            { place: "2nd Place", prize: "20% of pool", icon: "2", color: "#c0c0c0" },
            { place: "3rd Place", prize: "10% of pool", icon: "3", color: "#cd7f32" }
          ].map((p) => (
            <div key={p.place}>
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>{p.icon}</div>
              <div style={{ fontSize: "13px", color: p.color, fontWeight: 700, marginBottom: "2px" }}>{p.place}</div>
              <div style={{ fontSize: "12px", color: "#6b7f99" }}>{p.prize}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {[
            { key: "accuracy", label: "By Accuracy" },
            { key: "total", label: "By Volume" }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background: filter === f.key ? "#00B4D8" : "#0d1f35",
                border: `1px solid ${filter === f.key ? "#00B4D8" : "#1a3050"}`,
                color: filter === f.key ? "#000" : "#8899aa",
                padding: "8px 18px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "60px 0" }}>
            Loading leaderboard...
          </div>
        ) : users.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            background: "#0d1f35", borderRadius: "16px",
            border: "1px solid #1a3050", color: "#6b7f99"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏆</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
              No forecasters yet
            </div>
            <div>Be the first to make predictions and claim the #1 spot</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {users.map((user, index) => {
              const rank = getRankDisplay(index);
              const prize = getPrize(index);
              return (
                <Link key={user.id} to={`/profile/${user.username}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: index < 3 ? "linear-gradient(135deg, #0d1f35, #091525)" : "#0d1f35",
                  border: `1px solid ${index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#1a3050"}`,
                  borderRadius: "14px",
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}>
                  {/* Rank */}
                  <div style={{
                    minWidth: "44px", textAlign: "center",
                    fontSize: index < 3 ? "24px" : "16px",
                    fontWeight: 900, color: rank.color
                  }}>
                    {rank.symbol}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "#1a3050", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "16px", fontWeight: 900,
                    color: "#00B4D8", flexShrink: 0
                  }}>
                    {user.username?.[0]?.toUpperCase() || "?"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                        {user.username}
                      </span>
                      {index === 0 && (
                        <span style={{
                          background: "#ffd70020", border: "1px solid #ffd700",
                          color: "#ffd700", fontSize: "11px", fontWeight: 700,
                          padding: "2px 8px", borderRadius: "8px"
                        }}>
                          👑 LEADER
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7f99" }}>
                      {user.resolved_predictions || 0} predictions resolved
                    </div>
                  </div>

                  {/* Prize */}
                  {prize && (
                    <div style={{ textAlign: "center", marginRight: "8px" }}>
                      <div style={{ fontSize: "11px", color: "#6b7f99", marginBottom: "2px" }}>PRIZE</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: prize.color }}>{prize.label}</div>
                    </div>
                  )}

                  {/* Accuracy */}
                  <div style={{ textAlign: "right", minWidth: "80px" }}>
                    <div style={{
                      fontSize: "28px", fontWeight: 900,
                      color: user.accuracy_score >= 70 ? "#00ff88" : user.accuracy_score >= 50 ? "#00B4D8" : "#6b7f99"
                    }}>
                      {Math.round(user.accuracy_score || 0)}%
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7f99" }}>accuracy</div>
                  </div>
                </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}