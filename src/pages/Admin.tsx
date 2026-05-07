import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const ADMIN_EMAIL = "remichictremblay@gmail.com";

export default function Admin() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) { navigate("/"); return; }
    setIsAdmin(true);
    fetchPredictions("open");
  };

  const fetchPredictions = async (f: string) => {
    setLoading(true);
    const query = supabase.from("predictions").select("*, users(username)").order("resolution_date", { ascending: true });
    if (f !== "all") query.eq("status", f);
    const { data } = await query;
    setPredictions(data || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchPredictions(filter); }, [filter, isAdmin]);

  const resolve = async (predId: string, status: "correct" | "incorrect") => {
    setSaving(predId);
    const pred = predictions.find(p => p.id === predId);
    await supabase.from("predictions").update({ status, resolved_at: new Date().toISOString() }).eq("id", predId);
    
    // Get all users who voted on this prediction
    const { data: voters } = await supabase.from("votes").select("user_id, probability").eq("prediction_id", predId);
    if (voters && voters.length > 0 && pred) {
      const emoji = status === "correct" ? "✅" : "❌";
      const notifs = voters.map((v: any) => ({
        user_id: v.user_id,
        prediction_id: predId,
        type: "resolved",
        message: `${emoji} "${pred.question.slice(0, 60)}${pred.question.length > 60 ? "..." : ""}" was resolved ${status.toUpperCase()}`,
        read: false,
      }));
      await supabase.from("notifications").insert(notifs);
    }
    
    setPredictions(prev => prev.map(p => p.id === predId ? { ...p, status } : p));
    setSaving(null);
  };

  const reopen = async (predId: string) => {
    setSaving(predId);
    await supabase.from("predictions").update({ status: "open", resolved_at: null }).eq("id", predId);
    setPredictions(prev => prev.map(p => p.id === predId ? { ...p, status: "open" } : p));
    setSaving(null);
  };

  const uploadImage = async (predId: string, file: File) => {
    setUploading(predId);
    try {
      const ext = file.name.split(".").pop();
      const path = `${predId}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("predictions").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("predictions").getPublicUrl(path);
      await supabase.from("predictions").update({ image_url: publicUrl }).eq("id", predId);
      setPredictions(prev => prev.map(p => p.id === predId ? { ...p, image_url: publicUrl } : p));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    }
    setUploading(null);
  };

  const removeImage = async (predId: string) => {
    await supabase.from("predictions").update({ image_url: null }).eq("id", predId);
    setPredictions(prev => prev.map(p => p.id === predId ? { ...p, image_url: null } : p));
  };

  const deletePrediction = async (predId: string, imageUrl: string | null) => {
    if (!window.confirm("Delete this prediction permanently? This cannot be undone.")) return;
    setSaving(predId);
    // Delete image from storage if exists
    if (imageUrl) {
      const path = imageUrl.split("/predictions/")[1];
      if (path) await supabase.storage.from("predictions").remove([path]);
    }
    await supabase.from("votes").delete().eq("prediction_id", predId);
    await supabase.from("comments").delete().eq("prediction_id", predId);
    await supabase.from("predictions").delete().eq("id", predId);
    setPredictions(prev => prev.filter(p => p.id !== predId));
    setSaving(null);
  };

  const isPastDeadline = (date: string) => new Date(date) < new Date();

  if (!isAdmin) return null;

  const overdueCount = predictions.filter(p => p.status === "open" && isPastDeadline(p.resolution_date)).length;

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ background: "#ff444420", border: "1px solid #ff4444", color: "#ff4444", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>🔒 ADMIN</span>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0 }}>Admin Panel</h1>
          </div>
          {overdueCount > 0 && (
            <div style={{ background: "#ff444415", border: "1px solid #ff444440", borderRadius: "10px", padding: "12px 16px", color: "#ff8888", fontSize: "14px", marginTop: "12px" }}>
              ⚠️ {overdueCount} prediction{overdueCount > 1 ? "s" : ""} past deadline and still open
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[{ key: "open", label: "Open" }, { key: "correct", label: "✓ Correct" }, { key: "incorrect", label: "✗ Incorrect" }, { key: "all", label: "All" }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ background: filter === f.key ? "#00B4D8" : "#0d1f35", border: `1px solid ${filter === f.key ? "#00B4D8" : "#1a3050"}`, color: filter === f.key ? "#000" : "#8899aa", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "60px" }}>Loading...</div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6b7f99", padding: "60px", background: "#0d1f35", borderRadius: "16px" }}>No predictions</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {predictions.map(p => {
              const overdue = p.status === "open" && isPastDeadline(p.resolution_date);
              return (
                <div key={p.id} style={{ background: "#0d1f35", border: `1px solid ${overdue ? "#ff444440" : p.status === "correct" ? "#00ff8830" : p.status === "incorrect" ? "#ff444430" : "#1a3050"}`, borderRadius: "14px", padding: "20px" }}>

                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

                    {/* Image upload zone */}
                    <div style={{ flexShrink: 0 }}>
                      <div
                        onClick={() => fileRefs.current[p.id]?.click()}
                        style={{ width: "100px", height: "100px", borderRadius: "12px", border: `2px dashed ${p.image_url ? "#00B4D8" : "#1a3050"}`, background: p.image_url ? "transparent" : "#0a1628", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}
                        onMouseEnter={e => { if (p.image_url) (e.currentTarget.querySelector('.overlay') as HTMLElement)!.style.opacity = "1"; }}
                        onMouseLeave={e => { if (p.image_url) (e.currentTarget.querySelector('.overlay') as HTMLElement)!.style.opacity = "0"; }}
                      >
                        {p.image_url ? (
                          <>
                            <img src={p.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt=""/>
                            <div className="overlay" style={{ position: "absolute", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", fontSize: "11px", color: "#fff", fontWeight: 700 }}>
                              Change
                            </div>
                          </>
                        ) : (
                          <div style={{ textAlign: "center", color: "#3a5070" }}>
                            <div style={{ fontSize: "24px", marginBottom: "4px" }}>+</div>
                            <div style={{ fontSize: "10px", fontWeight: 700 }}>Add Image</div>
                          </div>
                        )}
                        {uploading === p.id && (
                          <div style={{ position: "absolute", inset: 0, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px" }}>
                            Uploading...
                          </div>
                        )}
                      </div>
                      <input
                        ref={el => fileRefs.current[p.id] = el}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(p.id, f); }}
                      />
                      {p.image_url && (
                        <button onClick={() => removeImage(p.id)} style={{ marginTop: "4px", width: "100%", background: "none", border: "none", color: "#ff4444", fontSize: "10px", cursor: "pointer", fontWeight: 700 }}>
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ background: "#0a1f35", border: "1px solid #1a3a5c", color: "#00B4D8", padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 700 }}>{p.category}</span>
                        <span style={{ fontSize: "12px", color: overdue ? "#ff8888" : "#6b7f99" }}>
                          {overdue ? "⚠️ OVERDUE — " : ""}Resolves {new Date(p.resolution_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {p.users?.username && <span style={{ fontSize: "12px", color: "#6b7f99", marginLeft: "auto" }}>by {p.users.username}</span>}
                      </div>

                      <p style={{ color: "#fff", fontWeight: 600, fontSize: "15px", lineHeight: 1.5, margin: "0 0 16px" }}>{p.question}</p>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "13px", color: "#6b7f99" }}>Confidence: <strong style={{ color: "#00B4D8" }}>{p.confidence}%</strong></span>
                        {p.status === "open" ? (
                          <>
                            <button onClick={() => resolve(p.id, "correct")} disabled={saving === p.id} style={{ background: "#00ff8820", border: "1px solid #00ff88", color: "#00ff88", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                              {saving === p.id ? "..." : "✓ Correct"}
                            </button>
                            <button onClick={() => resolve(p.id, "incorrect")} disabled={saving === p.id} style={{ background: "#ff444420", border: "1px solid #ff4444", color: "#ff4444", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                              {saving === p.id ? "..." : "✗ Incorrect"}
                            </button>
                          </>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 700, color: p.status === "correct" ? "#00ff88" : "#ff4444" }}>
                              {p.status === "correct" ? "✓ CORRECT" : "✗ INCORRECT"}
                            </span>
                            <button onClick={() => reopen(p.id)} disabled={saving === p.id} style={{ background: "none", border: "1px solid #1a3050", color: "#6b7f99", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
                              ↩ Reopen
                            </button>
                          </div>
                        )}
                        <button onClick={() => deletePrediction(p.id, p.image_url)} disabled={saving === p.id} style={{ background: "#ff444410", border: "1px solid #ff444440", color: "#ff6666", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", marginLeft: "auto" }}>
                          🗑 Delete
                        </button>
                      </div>
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
