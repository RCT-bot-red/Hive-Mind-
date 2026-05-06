import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const CATEGORIES = ["All", "Politics", "Economics", "Sports", "Technology", "World Events", "Science", "Climate", "Health"];

type PredTheme = { color: string; bg: string; label: string; svg: string };

const getTheme = (question: string, category: string): PredTheme => {
  const q = question.toLowerCase();

  // ── CRYPTO ──────────────────────────────────────────────────────
  if (q.includes("bitcoin") || q.includes("btc"))
    // Bitcoin ₿ symbol
    return { color: "#f7931a", bg: "#f7931a", label: "₿",
      svg: '<text x="12" y="17" text-anchor="middle" font-size="18" font-weight="900" font-family="Arial" fill="#f7931a">₿</text>' };

  if (q.includes("ethereum") || q.includes("eth") || q.includes("crypto"))
    // Ethereum diamond/prism shape
    return { color: "#627eea", bg: "#627eea", label: "Ξ",
      svg: '<polygon points="12,2 20,12 12,16 4,12" fill="#627eea" opacity="0.8"/><polygon points="12,16 20,12 12,22 4,12" fill="#627eea" opacity="0.5"/>' };

  // ── FINANCE ─────────────────────────────────────────────────────
  if (q.includes("stock") || q.includes("s&p") || q.includes("nasdaq") || q.includes("dow") || q.includes("index"))
    // Candlestick chart
    return { color: "#00ff88", bg: "#00ff88", label: "📊",
      svg: '<line x1="6" y1="4" x2="6" y2="20" stroke-width="1"/><rect x="4" y="8" width="4" height="7" rx="0.5"/><line x1="12" y1="2" x2="12" y2="20" stroke-width="1"/><rect x="10" y="6" width="4" height="9" rx="0.5"/><line x1="18" y1="6" x2="18" y2="20" stroke-width="1"/><rect x="16" y="10" width="4" height="6" rx="0.5"/>' };

  if (q.includes("gold") || q.includes("silver") || q.includes("precious metal"))
    // Gold bar shape
    return { color: "#ffd700", bg: "#ffd700", label: "Au",
      svg: '<rect x="3" y="8" width="18" height="10" rx="2" fill="#ffd700" opacity="0.3"/><rect x="3" y="8" width="18" height="10" rx="2"/><line x1="7" y1="8" x2="7" y2="18"/><line x1="12" y1="8" x2="12" y2="18"/><line x1="17" y1="8" x2="17" y2="18"/><text x="12" y="16" text-anchor="middle" font-size="5" font-weight="900" fill="#ffd700">AU</text>' };

  if (q.includes("oil") || q.includes("opec") || q.includes("crude"))
    // Oil barrel
    return { color: "#f97316", bg: "#f97316", label: "🛢",
      svg: '<ellipse cx="12" cy="7" rx="7" ry="3" fill="none"/><rect x="5" y="7" width="14" height="12"/><ellipse cx="12" cy="19" rx="7" ry="3" fill="none"/><line x1="5" y1="11" x2="19" y2="11"/><line x1="5" y1="15" x2="19" y2="15"/>' };

  if (q.includes("fed") || q.includes("interest rate") || q.includes("inflation") || q.includes("fomc"))
    // Federal building columns
    return { color: "#00B4D8", bg: "#00B4D8", label: "🏦",
      svg: '<rect x="2" y="18" width="20" height="2"/><rect x="4" y="10" width="2" height="8"/><rect x="8" y="10" width="2" height="8"/><rect x="12" y="10" width="2" height="8"/><rect x="16" y="10" width="2" height="8"/><polygon points="12,2 2,10 22,10"/>' };

  if (q.includes("dollar") || q.includes("currency") || q.includes("euro") || q.includes("yen") || q.includes("forex"))
    // Dollar sign
    return { color: "#4ade80", bg: "#4ade80", label: "$",
      svg: '<text x="12" y="17" text-anchor="middle" font-size="20" font-weight="900" font-family="Arial" fill="#4ade80">$</text><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>' };

  if (q.includes("recession") || q.includes("gdp") || q.includes("economy"))
    // Arrow down (recession)
    return { color: "#ef4444", bg: "#ef4444", label: "📉",
      svg: '<polyline points="2,5 9,12 13,8 22,17"/><polyline points="16,17 22,17 22,11"/>' };

  if (q.includes("real estate") || q.includes("housing") || q.includes("mortgage"))
    // House shape
    return { color: "#eab308", bg: "#eab308", label: "🏠",
      svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect x="9" y="14" width="6" height="8"/>' };

  // ── POLITICS ─────────────────────────────────────────────────────
  if (q.includes("trump") || q.includes("election") || q.includes("president") || q.includes("vote") || q.includes("congress") || q.includes("senate") || q.includes("ballot") || q.includes("democrat") || q.includes("republican"))
    // Ballot box with checkmark
    return { color: "#ff4444", bg: "#ff4444", label: "🗳",
      svg: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M7 7V5a5 5 0 0 1 10 0v2"/><polyline points="9 13 11 15 15 11"/>' };

  // ── WAR & GEOPOLITICS ────────────────────────────────────────────
  if (q.includes("ukraine") || q.includes("russia") || q.includes("war") || q.includes("nato") || q.includes("military") || q.includes("conflict") || q.includes("missile") || q.includes("ceasefire"))
    // Shield / crossed swords
    return { color: "#ef4444", bg: "#ef4444", label: "⚔",
      svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' };

  if (q.includes("china") || q.includes("taiwan") || q.includes("beijing") || q.includes("xi"))
    // Globe focused on Asia
    return { color: "#dc2626", bg: "#dc2626", label: "🌏",
      svg: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M12 2a15 15 0 0 0 0 20"/>' };

  // ── AI & TECH ────────────────────────────────────────────────────
  if (q.includes("openai") || q.includes("chatgpt") || q.includes("gpt") || q.includes("llm") || q.includes(" ai ") || q.includes("artificial intelligence") || q.includes("claude") || q.includes("gemini") || q.includes("deepseek"))
    // Circuit brain
    return { color: "#a855f7", bg: "#a855f7", label: "AI",
      svg: '<rect x="4" y="4" width="16" height="16" rx="8"/><circle cx="9" cy="10" r="1.5" fill="#a855f7"/><circle cx="15" cy="10" r="1.5" fill="#a855f7"/><path d="M9 14s1 2 3 2 3-2 3-2"/><line x1="4" y1="8" x2="1" y2="8"/><line x1="4" y1="12" x2="1" y2="12"/><line x1="4" y1="16" x2="1" y2="16"/><line x1="20" y1="8" x2="23" y2="8"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="20" y1="16" x2="23" y2="16"/>' };

  if (q.includes("nvidia") || q.includes("chip") || q.includes("semiconductor") || q.includes("gpu"))
    // Microchip
    return { color: "#76b900", bg: "#76b900", label: "💾",
      svg: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><line x1="9" y1="2" x2="9" y2="6"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="15" y1="2" x2="15" y2="6"/><line x1="9" y1="18" x2="9" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="15" y1="18" x2="15" y2="22"/><line x1="2" y1="9" x2="6" y2="9"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="18" y1="9" x2="22" y2="9"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="18" y1="15" x2="22" y2="15"/>' };

  if (q.includes("apple") || q.includes("iphone") || q.includes("ipad") || q.includes("mac"))
    // Apple-like bitten circle
    return { color: "#6b7280", bg: "#6b7280", label: "",
      svg: '<path d="M12 3c-1.5 0-3 .5-4 1.5C6 1 4 1 4 1s0 2 1.5 3.5C4 6 3 8 3 10c0 5 4 9 9 9s9-4 9-9c0-4-3-7-6-8-1-.3-2-.7-3-1z"/>' };

  if (q.includes("tesla") || q.includes("elon musk") || q.includes("electric car") || q.includes(" ev "))
    // Electric car / lightning bolt
    return { color: "#cc0000", bg: "#cc0000", label: "⚡",
      svg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' };

  if (q.includes("microsoft") || q.includes("windows") || q.includes("azure") || q.includes("bing"))
    // 4-square Windows logo
    return { color: "#0078d4", bg: "#0078d4", label: "",
      svg: '<rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/>' };

  if (q.includes("google") || q.includes("alphabet") || q.includes("youtube") || q.includes("search"))
    // Magnifying glass
    return { color: "#4285f4", bg: "#4285f4", label: "G",
      svg: '<circle cx="10" cy="10" r="7"/><line x1="15.5" y1="15.5" x2="22" y2="22" stroke-width="2.5"/>' };

  if (q.includes("amazon") || q.includes("aws") || q.includes("bezos"))
    // Shopping cart / box
    return { color: "#ff9900", bg: "#ff9900", label: "A",
      svg: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>' };

  if (q.includes("meta") || q.includes("facebook") || q.includes("instagram") || q.includes("zuckerberg"))
    // Infinity / Meta logo shape
    return { color: "#0081fb", bg: "#0081fb", label: "∞",
      svg: '<path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z"/><path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/>' };

  // ── SPACE ────────────────────────────────────────────────────────
  if (q.includes("space") || q.includes("nasa") || q.includes("rocket") || q.includes("spacex") || q.includes("starship"))
    // Rocket shape
    return { color: "#818cf8", bg: "#818cf8", label: "🚀",
      svg: '<path d="M12 2c0 0-7 5-7 11v2l3 3h8l3-3v-2c0-6-7-11-7-11z"/><circle cx="12" cy="11" r="2" fill="#818cf8"/><path d="M9 17l-3 4h12l-3-4"/>' };

  if (q.includes("moon") || q.includes("mars") || q.includes("satellite") || q.includes("planet"))
    // Planet with ring
    return { color: "#818cf8", bg: "#818cf8", label: "🪐",
      svg: '<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="4" fill="none" transform="rotate(-20 12 12)"/>' };

  // ── SPORTS ───────────────────────────────────────────────────────
  if (q.includes("nba") || q.includes("basketball") || q.includes("lakers") || q.includes("celtics") || q.includes("warriors") || q.includes("heat") || q.includes("knicks") || q.includes("nets"))
    // Basketball - circle with 3 seam lines
    return { color: "#ff6b35", bg: "#ff6b35", label: "🏀",
      svg: '<circle cx="12" cy="12" r="9"/><path d="M3.5 7 Q12 10 20.5 7" fill="none"/><path d="M3.5 17 Q12 14 20.5 17" fill="none"/><line x1="12" y1="3" x2="12" y2="21"/>' };

  if (q.includes("nfl") || q.includes("super bowl") || q.includes("quarterback") || q.includes("touchdown") || q.includes("american football"))
    // Football with proper laces
    return { color: "#5b4fcf", bg: "#5b4fcf", label: "🏈",
      svg: '<ellipse cx="12" cy="12" rx="9" ry="5.5" transform="rotate(-30 12 12)"/><line x1="8" y1="9" x2="15" y2="15" stroke-width="2"/><line x1="9.5" y1="8" x2="10.5" y2="10.5" stroke-width="1.2"/><line x1="11.5" y1="10" x2="12.5" y2="12.5" stroke-width="1.2"/><line x1="13.5" y1="12" x2="14.5" y2="14.5" stroke-width="1.2"/>' };

  if (q.includes("soccer") || q.includes("world cup") || q.includes("fifa") || q.includes("premier league") || q.includes("champions league") || q.includes("mls") || (q.includes("football") && (q.includes("european") || q.includes("league") || q.includes("cup"))))
    // Soccer ball - hexagon pattern
    return { color: "#16a34a", bg: "#16a34a", label: "⚽",
      svg: '<circle cx="12" cy="12" r="9"/><polygon points="12,7 14.5,9 13.5,12 10.5,12 9.5,9" fill="none" stroke-width="1.2"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="3.5" y1="7.5" x2="9.5" y2="9"/><line x1="20.5" y1="7.5" x2="14.5" y2="9"/><line x1="6" y1="18.5" x2="10.5" y2="12"/><line x1="18" y1="18.5" x2="13.5" y2="12"/><line x1="6" y1="18.5" x2="18" y2="18.5"/>' };

  if (q.includes("hockey") || q.includes("nhl") || q.includes("puck") || q.includes("zamboni") || q.includes("oilers") || q.includes("canadiens") || q.includes("sabres") || q.includes("hurricanes") || q.includes("flyers") || q.includes("avalanche") || q.includes("wild") || q.includes("golden knights") || q.includes("ducks") || q.includes("stanley cup") || q.includes("conn smythe") || q.includes("playoff") && q.includes("game"))
    // Hockey stick (curved) + puck
    return { color: "#60a5fa", bg: "#60a5fa", label: "🏒",
      svg: '<path d="M5 3 C5 3 5 14 5 16 C5 18 7 20 9 20 L19 20" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="13" cy="20" rx="5" ry="2.5" fill="none" stroke-width="1.5"/>' };

  if (q.includes("baseball") || q.includes("mlb") || q.includes("world series") || q.includes("pitcher") || q.includes("blue jays") || q.includes("yankees") || q.includes("red sox") || q.includes("dodgers"))
    // Baseball with curved stitches
    return { color: "#dc2626", bg: "#dc2626", label: "⚾",
      svg: '<circle cx="12" cy="12" r="9"/><path d="M8.5 4 Q11 8 11 12 Q11 16 8.5 20" fill="none" stroke-width="1.5"/><path d="M15.5 4 Q13 8 13 12 Q13 16 15.5 20" fill="none" stroke-width="1.5"/><line x1="9" y1="7" x2="11" y2="7.5" stroke-width="1"/><line x1="9" y1="10" x2="11" y2="10.5" stroke-width="1"/><line x1="9" y1="13" x2="11" y2="13.5" stroke-width="1"/><line x1="13" y1="7.5" x2="15" y2="7" stroke-width="1"/><line x1="13" y1="10.5" x2="15" y2="10" stroke-width="1"/><line x1="13" y1="13.5" x2="15" y2="13" stroke-width="1"/>' };

  if (q.includes("tennis") || q.includes("wimbledon") || q.includes("us open") || q.includes("grand slam") || q.includes("roland garros") || q.includes("australian open") || q.includes("djokovic") || q.includes("federer") || q.includes("nadal") || q.includes("sinner") || q.includes("alcaraz"))
    // Tennis racket - oval head with strings + handle
    return { color: "#84cc16", bg: "#84cc16", label: "🎾",
      svg: '<ellipse cx="10" cy="9" rx="6" ry="7" fill="none" stroke-width="1.8"/><line x1="4" y1="9" x2="16" y2="9" stroke-width="1"/><line x1="4" y1="6" x2="16" y2="6" stroke-width="1"/><line x1="4" y1="12" x2="16" y2="12" stroke-width="1"/><line x1="10" y1="2" x2="10" y2="16" stroke-width="1"/><line x1="7" y1="2.5" x2="7" y2="15.5" stroke-width="1"/><line x1="13" y1="2.5" x2="13" y2="15.5" stroke-width="1"/><line x1="10" y1="16" x2="14" y2="22" stroke-width="2.5" stroke-linecap="round"/>' };

  if (q.includes("golf") || q.includes("masters") || q.includes("pga") || q.includes("tiger") || q.includes("rory") || q.includes("scottie scheffler") || q.includes("lpga") || q.includes("augusta"))
    // Golf club + ball on tee
    return { color: "#15803d", bg: "#15803d", label: "⛳",
      svg: '<line x1="18" y1="2" x2="7" y2="17" stroke-width="2" stroke-linecap="round"/><path d="M7 17 L4 20 L9 20 Z" fill="#15803d"/><circle cx="9" cy="21" r="2" fill="none" stroke-width="1.5"/><line x1="9" y1="19" x2="9" y2="16" stroke-width="1"/>' };

  if (q.includes("formula") || q.includes("f1") || q.includes("nascar") || q.includes("racing") || q.includes("car race") || q.includes("verstappen") || q.includes("hamilton") || q.includes("grand prix"))
    // F1 car - low profile with spoiler
    return { color: "#ef4444", bg: "#ef4444", label: "🏎",
      svg: '<path d="M2 13 L5 10 L8 9 L14 9 L18 10 L22 11 L22 14 L18 15 L5 15 Z"/><circle cx="7" cy="15.5" r="2" fill="none" stroke-width="1.8"/><circle cx="17" cy="15.5" r="2" fill="none" stroke-width="1.8"/><path d="M14 9 L16 6 L18 9"/><line x1="8" y1="9" x2="8" y2="7"/>' };

  if (q.includes("olympic") || q.includes("olympics") || q.includes("paris 2024") || q.includes("los angeles 2028"))
    // 5 Olympic rings properly colored
    return { color: "#0081C8", bg: "#0081C8", label: "🏅",
      svg: '<circle cx="6" cy="11" r="3.5" fill="none" stroke="#0081C8" stroke-width="2"/><circle cx="12" cy="11" r="3.5" fill="none" stroke="#FCB131" stroke-width="2"/><circle cx="18" cy="11" r="3.5" fill="none" stroke="#000" stroke-width="2"/><circle cx="9" cy="15" r="3.5" fill="none" stroke="#00A651" stroke-width="2"/><circle cx="15" cy="15" r="3.5" fill="none" stroke="#EE334E" stroke-width="2"/>' };

  if (q.includes("sport") || q.includes("champion") || q.includes("trophy") || q.includes("medal"))
    // Trophy
    return { color: "#ffd700", bg: "#ffd700", label: "🏆",
      svg: '<path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 5h12v4a6 6 0 0 1-12 0V5z"/><line x1="12" y1="15" x2="12" y2="19"/><rect x="8" y="19" width="8" height="2" rx="1"/>' };

  // ── CLIMATE & SCIENCE ────────────────────────────────────────────
  if (q.includes("climate") || q.includes("carbon") || q.includes("emission") || q.includes("warming") || q.includes("temperature") || q.includes("sea level"))
    // Thermometer rising
    return { color: "#22c55e", bg: "#22c55e", label: "🌡",
      svg: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>' };

  if (q.includes("health") || q.includes("covid") || q.includes("vaccine") || q.includes("fda") || q.includes("drug") || q.includes("cancer") || q.includes("disease") || q.includes("hospital"))
    // Medical cross / pulse
    return { color: "#ec4899", bg: "#ec4899", label: "🏥",
      svg: '<rect x="8" y="2" width="8" height="20" rx="1"/><rect x="2" y="8" width="20" height="8" rx="1"/>' };

  if (q.includes("science") || q.includes("research") || q.includes("study") || q.includes("quantum"))
    // Flask / beaker
    return { color: "#06b6d4", bg: "#06b6d4", label: "🔬",
      svg: '<path d="M9 3h6v8l4 7H5l4-7V3z"/><line x1="9" y1="3" x2="15" y2="3"/><circle cx="10" cy="16" r="1" fill="#06b6d4"/><circle cx="13" cy="14" r="1" fill="#06b6d4"/>' };

  // Category fallbacks
  const cats: Record<string, PredTheme> = {
    Politics: { color: "#ff4444", bg: "#ff4444", label: "🏛", svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    Economics: { color: "#00ff88", bg: "#00ff88", label: "$", svg: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' },
    Sports: { color: "#ff6b35", bg: "#ff6b35", label: "⚽", svg: '<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/>' },
    Technology: { color: "#00B4D8", bg: "#00B4D8", label: "💻", svg: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
    "World Events": { color: "#a855f7", bg: "#a855f7", label: "🌍", svg: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
    Science: { color: "#06b6d4", bg: "#06b6d4", label: "🔬", svg: '<path d="M9 3h6v8l4 7H5l4-7V3z"/><line x1="9" y1="3" x2="15" y2="3"/>' },
    Climate: { color: "#22c55e", bg: "#22c55e", label: "🌿", svg: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>' },
    Health: { color: "#ec4899", bg: "#ec4899", label: "♥", svg: '<rect x="8" y="2" width="8" height="20" rx="1"/><rect x="2" y="8" width="20" height="8" rx="1"/>' },
  };
  return cats[category] || { color: "#00B4D8", bg: "#00B4D8", label: "?", svg: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>' };
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
        .select("id, question, category, confidence, resolution_date, status, created_at, image_url")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (category !== "All") query = query.eq("category", category);
      const { data } = await query;
      setPredictions(data || []);
    } finally { setLoading(false); }
  };

  const timeAgo = (date: string) => {
    const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const daysLeft = (date: string) => {
    const d = Math.floor((new Date(date).getTime() - Date.now()) / 86400000);
    if (d < 0) return { text: "Expired", urgent: true };
    if (d === 0) return { text: "Today", urgent: true };
    if (d <= 3) return { text: `${d}d left`, urgent: true };
    return { text: `${d}d left`, urgent: false };
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
            {[...Array(6)].map((_, i) => <div key={i} style={{ background: "#0d1f35", borderRadius: "18px", height: "220px", opacity: 0.4 }}/>)}
          </div>
        ) : predictions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", background: "#0d1f35", borderRadius: "16px", border: "1px solid #1a3050", color: "#6b7f99" }}>No predictions in this category yet</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {predictions.map(p => {
              const theme = getTheme(p.question, p.category);
              const dl = daysLeft(p.resolution_date);
              const confColor = p.confidence >= 65 ? "#00ff88" : p.confidence >= 45 ? "#00B4D8" : "#ff6b6b";

              return (
                <div key={p.id} onClick={() => navigate(`/market/${p.id}`)}
                  style={{ cursor: "pointer", background: "#0d1f35", border: `1px solid #1a3050`, borderRadius: "18px", overflow: "hidden", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = theme.color + "50"; e.currentTarget.style.boxShadow = `0 12px 40px ${theme.color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#1a3050"; e.currentTarget.style.boxShadow = "none"; }}>

                  {/* Header — image if available, else colored icon */}
                  {p.image_url ? (
                    <div style={{ position: "relative", height: "140px", overflow: "hidden" }}>
                      <img src={p.image_url} alt={p.category} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, #0d1f35 100%)" }}/>
                      <div style={{ position: "absolute", top: "12px", left: "12px", background: `${theme.color}90`, border: `1px solid ${theme.color}`, backdropFilter: "blur(4px)", color: "#fff", padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 }}>
                        {p.category}
                      </div>
                      <div style={{ position: "absolute", bottom: "12px", right: "12px", textAlign: "right" }}>
                        <div style={{ fontSize: "38px", fontWeight: 900, lineHeight: 1, color: confColor, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{p.confidence}%</div>
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "1px" }}>YES PROB</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: `${theme.color}14`, borderBottom: `1px solid ${theme.color}20`, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: `${theme.color}10`, border: `1px solid ${theme.color}15` }}/>
                      <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: `${theme.color}22`, border: `1.5px solid ${theme.color}45`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, flexShrink: 0 }}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: theme.svg }}/>
                      </div>
                      <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "42px", fontWeight: 900, lineHeight: 1, color: confColor }}>{p.confidence}%</div>
                        <div style={{ fontSize: "10px", color: "#6b7f99", fontWeight: 600, marginTop: "3px", letterSpacing: "1px" }}>YES PROB</div>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "14px", lineHeight: 1.6, margin: "0 0 14px", minHeight: "44px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                      {p.question}
                    </p>

                    {/* Progress */}
                    <div style={{ background: "#0a1628", borderRadius: "4px", height: "4px", marginBottom: "14px", overflow: "hidden" }}>
                      <div style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}80)`, width: `${p.confidence}%`, height: "100%", borderRadius: "4px" }}/>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ background: `${theme.color}18`, border: `1px solid ${theme.color}35`, color: theme.color, padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 }}>
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
