import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("open");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => { fetchProfile(); }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: userData } = await supabase.from("users").select("*").eq("username", username).single();
    if (!userData) { navigate("/leaderboard"); return; }
    setUser(userData);
    const { data: preds } = await supabase.from("predictions").select("*").eq("user_id", userData.id).order("created_at", { ascending: false });
    setPredictions(preds || []);
    setFollowersCount(userData.followers_count || 0);

    // Check if current user follows this profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: cu } = await supabase.from("users").select("id").eq("email", user.email).single();
      if (cu) {
        setCurrentUserId(cu.id);
        const { data: followData } = await supabase.from("follows").select("id").eq("follower_id", cu.id).eq("following_id", userData.id).single();
        setIsFollowing(!!followData);
      }
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!currentUserId) return;
    setFollowLoading(true);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", user.id);
      await supabase.from("users").update({ followers_count: Math.max(0, followersCount - 1) }).eq("id", user.id);
      setIsFollowing(false);
      setFollowersCount(p => Math.max(0, p - 1));
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: user.id });
      await supabase.from("users").update({ followers_count: followersCount + 1 }).eq("id", user.id);
      setIsFollowing(true);
      setFollowersCount(p => p + 1);
    }
    setFollowLoading(false);
  };

  const open = predictions.filter(p => p.status === "open");
  const resolved = predictions.filter(p => p.status !== "open");
  const correct = predictions.filter(p => p.status === "correct").length;
  const accuracy = resolved.length > 0 ? Math.round((correct / resolved.length) * 100) : 0;

  if (loading) return <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7f99" }}>Loading...</div>;
  if (!user) return null;

  const displayed = tab === "open" ? open : resolved;

  return (
    <div style={{ backgroundColor: "#0a1628", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#6b7f99", cursor: "pointer", fontSize: "14px", marginBottom: "24px" }}>← Back</button>
        <div style={{ background: "linear-gradient(135deg, #0d1f35, #091525)", border: "1px solid #1a3a5c", borderRadius: "20px", padding: "36px", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #00B4D8, #0077B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 900, color: "#fff" }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0 }}>{user.username}</h1>
                {currentUserId && currentUserId !== user.id && (
                  <button onClick={handleFollow} disabled={followLoading} style={{ background: isFollowing ? "#0d1f35" : "#00B4D8", border: isFollowing ? "1px solid #1a3050" : "none", color: isFollowing ? "#8899aa" : "#000", padding: "8px 20px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                    {followLoading ? "..." : isFollowing ? "Following" : "+ Follow"}
                  </button>
                )}
              </div>
              <p style={{ color: "#6b7f99", margin: "4px 0 0", fontSize: "14px" }}>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>{followersCount}</span> followers · Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {[{ label: "Accuracy", value: `${accuracy}%`, color: accuracy >= 70 ? "#00ff88" : "#00B4D8" }, { label: "Predictions", value: predictions.length, color: "#fff" }, { label: "Correct", value: correct, color: "#00ff88" }, { label: "Resolved", value: resolved.length, color: "#00B4D8" }].map(s => (
              <div key={s.label} style={{ background: "#0a1628", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#6b7f99", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          {[{ key: "open", label: `Open (${open.length})` }, { key: "resolved", label: `Resolved (${resolved.length})` }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ background: tab === t.key ? "#00B4D8" : "#0d1f35", border: `1px solid ${tab === t.key ? "#00B4D8" : "#1a3050"}`, color: tab === t.key ? "#000" : "#8899aa", padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {displayed.map(p => (
            <Link to={`/market/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
              <div style={{ background: "#0d1f35", border: "1px solid #1a3050", borderRadius: "14px", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <div>
                  <span style={{ background: "#0a1f35", border: "1px solid #1a3a5c", color: "#00B4D8", padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, marginBottom: "8px", display: "inline-block" }}>{p.category}</span>
                  <p style={{ color: "#fff", fontWeight: 600, margin: 0, fontSize: "15px" }}>{p.question}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: p.status === "correct" ? "#00ff88" : p.status === "incorrect" ? "#ff4444" : "#00B4D8" }}>{p.confidence}%</div>
                  {p.status !== "open" && <span style={{ fontSize: "11px", fontWeight: 700, color: p.status === "correct" ? "#00ff88" : "#ff4444" }}>{p.status === "correct" ? "✓ CORRECT" : "✗ WRONG"}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
