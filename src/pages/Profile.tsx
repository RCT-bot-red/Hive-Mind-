import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("open");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email)
        .single();

      if (!userData) {
        const { data: newUser } = await supabase
          .from("users")
          .insert({ email: authUser.email, username: authUser.email.split("@")[0] })
          .select()
          .single();
        setUser(newUser);
      } else {
        setUser(userData);
      }

      const { data: preds } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", userData?.id || "")
        .order("created_at", { ascending: false });

      setPredictions(preds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPredictions = predictions.filter(p => p.status === "open");
  const resolvedPredictions = predictions.filter(p => p.status !== "open");
  const correctCount = predictions.filter(p => p.status === "correct").length;
  const accuracy = resolvedPredictions.length > 0
    ? Math.round((correctCount / resolvedPredictions.length) * 100)
    : 0;

  if (loading) return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6b7f99", fontSize: "16px" }}>Loading profile...</div>
    </div>
  );

  if (!user) return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6b7f99", fontSize: "16px" }}>Please log in to view your profile.</div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "48px 32px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Profile Header */}
        <div style={{
          background: "linear-gradient(135deg, #0d1f35, #091525)",
          border: "1px solid #1a3a5c",
          borderRadius: "20px",
          padding: "36px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "32px"
        }}>
          {/* Avatar */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, #00B4D8, #0096b5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: 900, color: "#000", flexShrink: 0
          }}>
            {user.username?.[0]?.toUpperCase() || "?"}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 900 }}>{user.username}</h1>
              {accuracy >= 70 && (
                <span style={{
                  background: "#00ff8820", border: "1px solid #00ff88",
                  color: "#00ff88", fontSize: "11px", fontWeight: 700,
                  padding: "3px 10px", borderRadius: "8px"
                }}>
                  ⚡ SHARP
                </span>
              )}
            </div>
            <div style={{ color: "#6b7f99", fontSize: "14px" }}>
              {user.bio || "No bio yet"}
            </div>
          </div>

          {/* Accuracy Score */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "64px", fontWeight: 900, lineHeight: 1,
              color: accuracy >= 70 ? "#00ff88" : accuracy >= 50 ? "#00B4D8" : "#6b7f99"
            }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: "12px", color: "#6b7f99", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 700 }}>
              Accuracy
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px", marginBottom: "32px"
        }}>
          {[
            { label: "Total Predictions", value: predictions.length },
            { label: "Resolved", value: resolvedPredictions.length },
            { label: "Correct", value: correctCount, color: "#00ff88" },
            { label: "Open", value: openPredictions.length, color: "#00B4D8" }
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "#0d1f35", border: "1px solid #1a3050",
              borderRadius: "12px", padding: "20px", textAlign: "center"
            }}>
              <div style={{ fontSize: "32px", fontWeight: 900, color: stat.color || "#ffffff", marginBottom: "4px" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7f99", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {[
            { key: "open", label: `Open (${openPredictions.length})` },
            { key: "resolved", label: `Resolved (${resolvedPredictions.length})` }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: tab === t.key ? "#00B4D8" : "#0d1f35",
                border: `1px solid ${tab === t.key ? "#00B4D8" : "#1a3050"}`,
                color: tab === t.key ? "#000" : "#8899aa",
                padding: "8px 18px", borderRadius: "20px",
                fontSize: "13px", fontWeight: 700, cursor: "pointer"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Predictions List */}
        {(tab === "open" ? openPredictions : resolvedPredictions).length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px",
            background: "#0d1f35", borderRadius: "16px",
            border: "1px solid #1a3050", color: "#6b7f99"
          }}>
            No {tab} predictions yet
          </div>
        ) : (
          (tab === "open" ? openPredictions : resolvedPredictions).map((pred) => (
            <div key={pred.id} style={{
              background: "#0d1f35",
              border: `1px solid ${pred.status === "correct" ? "#00ff88" : pred.status === "incorrect" ? "#ff4444" : "#1a3050"}`,
              borderRadius: "14px", padding: "20px 24px", marginBottom: "12px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{
                  background: "#0a1f35", border: "1px solid #1a3a5c",
                  color: "#00B4D8", padding: "4px 12px", borderRadius: "12px",
                  fontSize: "12px", fontWeight: 700
                }}>
                  {pred.category}
                </span>
                {pred.status !== "open" && (
                  <span style={{
                    background: pred.status === "correct" ? "#00ff8820" : "#ff444420",
                    border: `1px solid ${pred.status === "correct" ? "#00ff88" : "#ff4444"}`,
                    color: pred.status === "correct" ? "#00ff88" : "#ff4444",
                    padding: "4px 12px", borderRadius: "12px",
                    fontSize: "12px", fontWeight: 700
                  }}>
                    {pred.status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                )}
              </div>

              <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px", lineHeight: 1.4, color: "#ffffff" }}>
                {pred.question}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7f99" }}>Confidence:</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#00B4D8" }}>{pred.confidence}%</span>
                </div>
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