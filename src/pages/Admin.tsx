import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const ADMIN_EMAIL = "remichictremblay@gmail.com"; // Change to your email

export default function Admin() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [saving, setSaving] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate("/");
      return;
    }
    setIsAdmin(true);
    fetchPredictions();
  };

  const fetchPredictions = async () => {
    setLoading(true);
    const query = supabase
      .from("predictions")
      .select("*, users(username)")
      .order("resolution_date", { ascending: true });

    if (filter !== "all") {
      query.eq("status", filter);
    }

    const { data } = await query;
    setPredictions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchPredictions();
  }, [filter, isAdmin]);

  const resolve = async (predId: string, newStatus: "correct" | "incorrect") => {
    setSaving(predId);
    const { error } = await supabase
      .from("predictions")
      .update({ status: newStatus, resolved_at: new Date().toISOString() })
      .eq("id", predId);

    if (!error) {
      setPredictions(prev => prev.map(p => p.id === predId ? { ...p, status: newStatus } : p));
    }
    setSaving(null);
  };

  const reopen = async (predId: string) => {
    setSaving(predId);
    await supabase.from("predictions").update({ status: "open", resolved_at: null }).eq("id", predId);
    setPredictions(prev => prev.map(p => p.id === predId ? { ...p, status: "open" } : p));
    setSaving(null);
  };

  const isPastDeadline = (date: string) => new Date(date) < new Date();

  if (!isAdmin) return null;

  const overdueCount = predictions.filter(p => p.status === "open" && isPastDeadline(p.resolution_date)).length;

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ background: "#ff444420", border: "1px solid #ff4444", color: "#ff4444", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
              🔒 ADMIN
            </span>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0 }}>Resolve Predictions</h1>
          </div>
          {overdueCount > 0 && (
            <div style={{ background: "#ff444415", border: "1px solid #ff444440", borderRadius: "10px", padding: "12px 16px", color: "#ff8888", fontSize: "14px" }}>
              ⚠️ {overdueCount} prediction{overdueCount > 1 ? "s" : ""} past deadline and still open
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[
            { key: "open", label: "Open" },
            { key: "correct", label: "✓ Correct" },
            { key: "incorrect", label: "✗ Incorrect" },
            { key: "all", label: "All" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              background: filter === f.key ? "#00B4D8" : "#0d1f35",
              border: `1px solid ${filter === f.key ? "#00B4D8" : "#1a3050"}`,
              color: filter === f.key ? "#000" : "#8899aa",
              padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, cursor: "pointer"
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "60px" }}>Loading...</div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "60px", background: "#0d1f35", borderRadius: "16px" }}>
            No predictions in this category
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {predictions.map(p => {
              const overdue = p.status === "open" && isPastDeadline(p.resolution_date);
              return (
                <div key={p.id} style={{
                  background: "#0d1f35",
                  border: `1px solid ${overdue ? "#ff444440" : p.status === "correct" ? "#00ff8830" : p.status === "incorrect" ? "#ff444430" : "#1a3050"}`,
                  borderRadius: "14px", padding: "20px 22px"
                }}>
                  {/* Category + deadline */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: "#0a1f35", border: "1px solid #1a3a5c", color: "#00B4D8", padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 700 }}>
                      {p.category}
                    </span>
                    <span style={{ fontSize: "12px", color: overdue ? "#ff8888" : "#6b7f99" }}>
                      {overdue ? "⚠️ OVERDUE — " : ""}Resolves {new Date(p.resolution_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {p.users?.username && (
                      <span style={{ fontSize: "12px", color: "#6b7f99", marginLeft: "auto" }}>by {p.users.username}</span>
                    )}
                  </div>

                  {/* Question */}
                  <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "15px", lineHeight: 1.5, margin: "0 0 16px" }}>
                    {p.question}
                  </p>

                  {/* Confidence + Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: "#6b7f99" }}>
                      Confidence: <strong style={{ color: "#00B4D8" }}>{p.confidence}%</strong>
                    </span>

                    {p.status === "open" ? (
                      <>
                        <button
                          onClick={() => resolve(p.id, "correct")}
                          disabled={saving === p.id}
                          style={{ background: "#00ff8820", border: "1px solid #00ff88", color: "#00ff88", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                        >
                          {saving === p.id ? "..." : "✓ Mark Correct"}
                        </button>
                        <button
                          onClick={() => resolve(p.id, "incorrect")}
                          disabled={saving === p.id}
                          style={{ background: "#ff444420", border: "1px solid #ff4444", color: "#ff4444", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                        >
                          {saving === p.id ? "..." : "✗ Mark Incorrect"}
                        </button>
                      </>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: p.status === "correct" ? "#00ff88" : "#ff4444" }}>
                          {p.status === "correct" ? "✓ CORRECT" : "✗ INCORRECT"}
                        </span>
                        <button
                          onClick={() => reopen(p.id)}
                          disabled={saving === p.id}
                          style={{ background: "none", border: "1px solid #1a3050", color: "#6b7f99", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}
                        >
                          ↩ Reopen
                        </button>
                      </div>
                    )}
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
