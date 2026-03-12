import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const ADMIN_USERS = [
  { username: "admin",  password: "techfest2025" },
  { username: "judge1", password: "judge123" },
  { username: "judge2", password: "judge456" },
];

const GAMES = {
  drone: { label: "Drone Path Control", short: "DRONE", color: "#00f5ff", dark: "#003a3f", glow: "#00f5ff" },
  vr:    { label: "VR Challenge",       short: "VR",    color: "#c084fc", dark: "#2d0050", glow: "#c084fc" },
  robot: { label: "Robot Scissors",     short: "ROBOT", color: "#fb923c", dark: "#3f1500", glow: "#fb923c" },
};

const METRICS = {
  drone: [
    { key: "score",    label: "Score",    unit: "pts", higherIsBetter: true },
    { key: "time",     label: "Time",     unit: "s",   higherIsBetter: false },
    { key: "accuracy", label: "Accuracy", unit: "%",   higherIsBetter: true },
    { key: "crashes",  label: "Crashes",  unit: "",    higherIsBetter: false },
  ],
  vr: [
    { key: "score", label: "Score",  unit: "pts", higherIsBetter: true },
    { key: "level", label: "Level",  unit: "",    higherIsBetter: true },
    { key: "hits",  label: "Hits",   unit: "",    higherIsBetter: true },
    { key: "time",  label: "Time",   unit: "s",   higherIsBetter: false },
  ],
  robot: [
    { key: "score",  label: "Score",  unit: "pts", higherIsBetter: true },
    { key: "wins",   label: "Wins",   unit: "",    higherIsBetter: true },
    { key: "losses", label: "Losses", unit: "",    higherIsBetter: false },
    { key: "time",   label: "Best",   unit: "s",   higherIsBetter: false },
  ],
};

const SAMPLE = [
  { id:"P001", name:"Arjun Sharma",  game:"drone", metrics:{ score:870, time:42, accuracy:94, crashes:1 }, ts: Date.now()-3e6 },
  { id:"P002", name:"Priya Patel",   game:"vr",    metrics:{ score:950, level:8, hits:45, time:120 },       ts: Date.now()-2e6 },
  { id:"P003", name:"Rohan Mehta",   game:"robot", metrics:{ score:720, wins:4, losses:1, time:18 },        ts: Date.now()-1e6 },
  { id:"P004", name:"Sneha Gupta",   game:"drone", metrics:{ score:960, time:38, accuracy:97, crashes:0 },  ts: Date.now()-8e5 },
  { id:"P005", name:"Karan Joshi",   game:"vr",    metrics:{ score:830, level:7, hits:38, time:145 },       ts: Date.now()-5e5 },
  { id:"P006", name:"Aisha Khan",    game:"robot", metrics:{ score:880, wins:5, losses:0, time:15 },        ts: Date.now()-2e5 },
  { id:"P007", name:"Dev Rao",       game:"drone", metrics:{ score:750, time:55, accuracy:88, crashes:3 },  ts: Date.now()-1e5 },
];

/* ═══════════════════════════════════════════════════════
   STORAGE
═══════════════════════════════════════════════════════ */
async function loadPlayers() {
  try { const r = await window.storage.get("tfv2_players", true); return r ? JSON.parse(r.value) : SAMPLE; }
  catch { return SAMPLE; }
}
async function savePlayers(p) {
  try { await window.storage.set("tfv2_players", JSON.stringify(p), true); } catch {}
}
function ranked(players, game) {
  const pm = METRICS[game].find(m => m.key === "score") || METRICS[game][0];
  return [...players.filter(p => p.game === game)].sort((a, b) =>
    pm.higherIsBetter ? (b.metrics[pm.key]??0) - (a.metrics[pm.key]??0) : (a.metrics[pm.key]??0) - (b.metrics[pm.key]??0)
  );
}

/* ═══════════════════════════════════════════════════════
   CSS KEYFRAMES
═══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #02020f; }
::-webkit-scrollbar-thumb { background: #00f5ff44; border-radius: 2px; }

@keyframes droneFloat {
  0%,100% { transform: translateY(0px) rotate(-5deg); }
  50%      { transform: translateY(-18px) rotate(5deg); }
}
@keyframes droneFly {
  0%   { left: -120px; top: 18%; }
  40%  { left: 60%; top: 10%; }
  60%  { left: 65%; top: 22%; }
  100% { left: 110%; top: 14%; }
}
@keyframes propSpin { to { transform: rotate(360deg); } }
@keyframes vrBob {
  0%,100% { transform: translateY(0) rotateX(0deg); }
  50%      { transform: translateY(-12px) rotateX(8deg); }
}
@keyframes vrPulse {
  0%,100% { box-shadow: 0 0 0 0 #c084fc55; }
  50%      { box-shadow: 0 0 0 16px #c084fc00; }
}
@keyframes robotArm {
  0%,100% { transform: rotate(-20deg); }
  50%      { transform: rotate(20deg); }
}
@keyframes scissorSnip {
  0%,100% { transform: rotate(0deg); }
  50%      { transform: rotate(30deg); }
}
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes fadeUp {
  from { opacity:0; transform: translateY(30px) rotateX(-20deg); }
  to   { opacity:1; transform: translateY(0) rotateX(0deg); }
}
@keyframes glitch {
  0%,100% { clip-path: inset(0 0 95% 0); transform: translate(0); }
  10%  { clip-path: inset(10% 0 80% 0); transform: translate(-4px, 2px); }
  20%  { clip-path: inset(50% 0 30% 0); transform: translate(4px, -2px); }
  30%  { clip-path: inset(80% 0 5% 0);  transform: translate(-2px, 1px); }
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes slideIn {
  from { opacity:0; transform: translateX(-50px); }
  to   { opacity:1; transform: translateX(0); }
}
@keyframes countUp {
  from { opacity:0; transform: scale(0.5); }
  to   { opacity:1; transform: scale(1); }
}
@keyframes orbit {
  from { transform: rotate(0deg) translateX(30px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
}
@keyframes bgGrid {
  from { transform: perspective(400px) rotateX(60deg) translateY(0); }
  to   { transform: perspective(400px) rotateX(60deg) translateY(40px); }
}
`;

/* ═══════════════════════════════════════════════════════
   3D DRONE SVG ANIMATION
═══════════════════════════════════════════════════════ */
function DroneAnim({ size = 100 }) {
  return (
    <div style={{ width: size, height: size, position: "relative", animation: "droneFloat 3s ease-in-out infinite" }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Body */}
        <rect x="35" y="40" width="30" height="18" rx="5" fill="#1a2a3a" stroke="#00f5ff" strokeWidth="1.5"/>
        <rect x="42" y="43" width="16" height="6" rx="2" fill="#00f5ff22" stroke="#00f5ff" strokeWidth="1"/>
        {/* Camera */}
        <circle cx="50" cy="55" r="4" fill="#00f5ff44" stroke="#00f5ff" strokeWidth="1"/>
        <circle cx="50" cy="55" r="2" fill="#00f5ff"/>
        {/* Arms */}
        <line x1="35" y1="45" x2="18" y2="35" stroke="#00f5ff66" strokeWidth="2"/>
        <line x1="65" y1="45" x2="82" y2="35" stroke="#00f5ff66" strokeWidth="2"/>
        <line x1="35" y1="52" x2="18" y2="62" stroke="#00f5ff66" strokeWidth="2"/>
        <line x1="65" y1="52" x2="82" y2="62" stroke="#00f5ff66" strokeWidth="2"/>
        {/* Propellers */}
        <g style={{ transformOrigin: "18px 35px", animation: "propSpin 0.2s linear infinite" }}>
          <ellipse cx="18" cy="35" rx="10" ry="3" fill="#00f5ff33" stroke="#00f5ff" strokeWidth="1"/>
        </g>
        <g style={{ transformOrigin: "82px 35px", animation: "propSpin 0.2s linear infinite reverse" }}>
          <ellipse cx="82" cy="35" rx="10" ry="3" fill="#00f5ff33" stroke="#00f5ff" strokeWidth="1"/>
        </g>
        <g style={{ transformOrigin: "18px 62px", animation: "propSpin 0.2s linear infinite reverse" }}>
          <ellipse cx="18" cy="62" rx="10" ry="3" fill="#00f5ff33" stroke="#00f5ff" strokeWidth="1"/>
        </g>
        <g style={{ transformOrigin: "82px 62px", animation: "propSpin 0.2s linear infinite" }}>
          <ellipse cx="82" cy="62" rx="10" ry="3" fill="#00f5ff33" stroke="#00f5ff" strokeWidth="1"/>
        </g>
        {/* LED lights */}
        <circle cx="18" cy="35" r="2.5" fill="#00ff88" style={{ animation: "pulse 1s infinite" }}/>
        <circle cx="82" cy="35" r="2.5" fill="#ff4444" style={{ animation: "pulse 1s infinite 0.5s" }}/>
        <circle cx="18" cy="62" r="2.5" fill="#00ff88" style={{ animation: "pulse 1s infinite 0.3s" }}/>
        <circle cx="82" cy="62" r="2.5" fill="#ff4444" style={{ animation: "pulse 1s infinite 0.8s" }}/>
        {/* Glow rings */}
        <circle cx="50" cy="49" r="22" fill="none" stroke="#00f5ff" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4"/>
      </svg>
      {/* Path trail dots */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", width: 4, height: 4, borderRadius: "50%",
          background: "#00f5ff", left: -10 - i * 12, top: "50%",
          opacity: 0.6 - i * 0.12,
          boxShadow: "0 0 6px #00f5ff",
        }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3D VR HEADSET SVG
═══════════════════════════════════════════════════════ */
function VRAnim({ size = 100 }) {
  return (
    <div style={{ width: size, height: size * 0.8, position: "relative", animation: "vrBob 2.5s ease-in-out infinite" }}>
      <svg viewBox="0 0 120 90" width={size} height={size * 0.8}>
        {/* Strap */}
        <path d="M20 45 Q60 20 100 45" fill="none" stroke="#c084fc66" strokeWidth="3"/>
        <path d="M20 45 Q60 70 100 45" fill="none" stroke="#c084fc66" strokeWidth="3"/>
        {/* Main body */}
        <rect x="18" y="32" width="84" height="28" rx="10" fill="#1a0a2e" stroke="#c084fc" strokeWidth="2"/>
        {/* Lens L */}
        <circle cx="40" cy="46" r="11" fill="#0d0020" stroke="#c084fc" strokeWidth="1.5"/>
        <circle cx="40" cy="46" r="7" fill="#1a0040"/>
        <circle cx="40" cy="46" r="4" fill="#c084fc22"/>
        <circle cx="38" cy="44" r="1.5" fill="#c084fc" opacity="0.8"/>
        {/* Lens R */}
        <circle cx="80" cy="46" r="11" fill="#0d0020" stroke="#c084fc" strokeWidth="1.5"/>
        <circle cx="80" cy="46" r="7" fill="#1a0040"/>
        <circle cx="80" cy="46" r="4" fill="#c084fc22"/>
        <circle cx="78" cy="44" r="1.5" fill="#c084fc" opacity="0.8"/>
        {/* Bridge */}
        <rect x="51" y="43" width="18" height="6" rx="3" fill="#2a0050" stroke="#c084fc44" strokeWidth="1"/>
        {/* Top buttons */}
        <circle cx="30" cy="33" r="2" fill="#c084fc" style={{ animation: "pulse 1.5s infinite" }}/>
        <circle cx="90" cy="33" r="2" fill="#00f5ff" style={{ animation: "pulse 1.5s infinite 0.7s" }}/>
        {/* Scanline inside lens */}
        <rect x="33" y="40" width="14" height="2" rx="1" fill="#c084fc" opacity="0.3" style={{ animation: "pulse 0.8s infinite" }}/>
        <rect x="73" y="40" width="14" height="2" rx="1" fill="#c084fc" opacity="0.3" style={{ animation: "pulse 0.8s infinite 0.4s" }}/>
      </svg>
      {/* Orbit particle */}
      <div style={{ position: "absolute", top: "50%", left: "50%", width: 8, height: 8,
        borderRadius: "50%", background: "#c084fc", boxShadow: "0 0 10px #c084fc",
        animation: "orbit 2s linear infinite", marginTop: -4, marginLeft: -4 }}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3D ROBOT SCISSORS SVG
═══════════════════════════════════════════════════════ */
function RobotAnim({ size = 100 }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg viewBox="0 0 100 110" width={size} height={size}>
        {/* Robot head */}
        <rect x="30" y="5" width="40" height="32" rx="6" fill="#1a1a0a" stroke="#fb923c" strokeWidth="2"/>
        <circle cx="43" cy="18" r="6" fill="#fb923c22" stroke="#fb923c" strokeWidth="1.5"/>
        <circle cx="43" cy="18" r="3" fill="#fb923c" style={{ animation: "pulse 1s infinite" }}/>
        <circle cx="57" cy="18" r="6" fill="#fb923c22" stroke="#fb923c" strokeWidth="1.5"/>
        <circle cx="57" cy="18" r="3" fill="#fb923c" style={{ animation: "pulse 1s infinite 0.5s" }}/>
        <rect x="38" y="28" width="24" height="4" rx="2" fill="#fb923c44"/>
        {/* Antenna */}
        <line x1="50" y1="5" x2="50" y2="-3" stroke="#fb923c" strokeWidth="1.5"/>
        <circle cx="50" cy="-4" r="3" fill="#fb923c" style={{ animation: "pulse 0.6s infinite" }}/>
        {/* Body */}
        <rect x="28" y="37" width="44" height="30" rx="5" fill="#120c00" stroke="#fb923c" strokeWidth="1.5"/>
        <rect x="36" y="43" width="28" height="8" rx="2" fill="#fb923c11" stroke="#fb923c44" strokeWidth="1"/>
        {/* Arms */}
        <rect x="10" y="38" width="18" height="8" rx="4" fill="#1a1000" stroke="#fb923c" strokeWidth="1.5"
          style={{ transformOrigin: "28px 42px", animation: "robotArm 1.5s ease-in-out infinite" }}/>
        <rect x="72" y="38" width="18" height="8" rx="4" fill="#1a1000" stroke="#fb923c" strokeWidth="1.5"
          style={{ transformOrigin: "72px 42px", animation: "robotArm 1.5s ease-in-out infinite reverse" }}/>
        {/* Scissor blades */}
        <g style={{ transformOrigin: "50px 80px" }}>
          <path d="M35 72 Q50 85 65 72" fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"
            style={{ animation: "scissorSnip 0.8s ease-in-out infinite" }}/>
          <path d="M35 88 Q50 75 65 88" fill="none" stroke="#fb923caa" strokeWidth="3" strokeLinecap="round"
            style={{ animation: "scissorSnip 0.8s ease-in-out infinite reverse" }}/>
        </g>
        {/* Legs */}
        <rect x="35" y="67" width="12" height="16" rx="3" fill="#120c00" stroke="#fb923c88" strokeWidth="1"/>
        <rect x="53" y="67" width="12" height="16" rx="3" fill="#120c00" stroke="#fb923c88" strokeWidth="1"/>
        {/* Feet */}
        <rect x="32" y="81" width="18" height="6" rx="3" fill="#1a1000" stroke="#fb923c" strokeWidth="1.5"/>
        <rect x="50" y="81" width="18" height="6" rx="3" fill="#1a1000" stroke="#fb923c" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATED GRID BACKGROUND
═══════════════════════════════════════════════════════ */
function GridBG({ color }) {
  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden", opacity: 0.15, pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute", width: "200%", height: "300%", left: "-50%", top: "-100%",
        backgroundImage: `linear-gradient(${color}44 1px, transparent 1px), linear-gradient(90deg, ${color}44 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        animation: "bgGrid 3s linear infinite",
      }}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FLYING DRONE ACROSS SCREEN
═══════════════════════════════════════════════════════ */
function FlyingDrone() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      <div style={{ position: "absolute", animation: "droneFly 14s linear infinite" }}>
        <svg viewBox="0 0 80 50" width="80" height="50" style={{ filter: "drop-shadow(0 0 8px #00f5ff)" }}>
          <rect x="28" y="18" width="24" height="14" rx="4" fill="#0a1a2a" stroke="#00f5ff" strokeWidth="1.5"/>
          <line x1="28" y1="22" x2="14" y2="14" stroke="#00f5ff55" strokeWidth="1.5"/>
          <line x1="52" y1="22" x2="66" y2="14" stroke="#00f5ff55" strokeWidth="1.5"/>
          <line x1="28" y1="28" x2="14" y2="36" stroke="#00f5ff55" strokeWidth="1.5"/>
          <line x1="52" y1="28" x2="66" y2="36" stroke="#00f5ff55" strokeWidth="1.5"/>
          <g style={{ transformOrigin: "14px 14px", animation: "propSpin 0.15s linear infinite" }}>
            <ellipse cx="14" cy="14" rx="8" ry="2.5" fill="#00f5ff22" stroke="#00f5ff" strokeWidth="0.8"/>
          </g>
          <g style={{ transformOrigin: "66px 14px", animation: "propSpin 0.15s linear infinite reverse" }}>
            <ellipse cx="66" cy="14" rx="8" ry="2.5" fill="#00f5ff22" stroke="#00f5ff" strokeWidth="0.8"/>
          </g>
          <g style={{ transformOrigin: "14px 36px", animation: "propSpin 0.15s linear infinite reverse" }}>
            <ellipse cx="14" cy="36" rx="8" ry="2.5" fill="#00f5ff22" stroke="#00f5ff" strokeWidth="0.8"/>
          </g>
          <g style={{ transformOrigin: "66px 36px", animation: "propSpin 0.15s linear infinite" }}>
            <ellipse cx="66" cy="36" rx="8" ry="2.5" fill="#00f5ff22" stroke="#00f5ff" strokeWidth="0.8"/>
          </g>
          <circle cx="14" cy="14" r="2" fill="#00ff88"/>
          <circle cx="66" cy="14" r="2" fill="#ff4444"/>
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   GAME HERO BANNER
═══════════════════════════════════════════════════════ */
function GameBanner({ game }) {
  const g = GAMES[game];
  return (
    <div style={{
      position: "relative", borderRadius: 20, overflow: "hidden",
      border: `2px solid ${g.color}44`, marginBottom: 24, padding: "20px 24px",
      background: `linear-gradient(135deg, ${g.dark}cc, #02020fcc)`,
      display: "flex", alignItems: "center", gap: 24,
      boxShadow: `0 0 40px ${g.color}22`,
    }}>
      <GridBG color={g.color} />
      <div style={{ flexShrink: 0, zIndex: 1 }}>
        {game === "drone" && <DroneAnim size={90} />}
        {game === "vr" && <VRAnim size={100} />}
        {game === "robot" && <RobotAnim size={80} />}
      </div>
      <div style={{ zIndex: 1 }}>
        <div style={{ fontSize: 10, color: `${g.color}88`, letterSpacing: 4, fontFamily: "'Share Tech Mono', monospace", marginBottom: 4 }}>
          ACTIVE GAME
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Orbitron', monospace", color: g.color,
          textShadow: `0 0 30px ${g.color}`, letterSpacing: 2 }}>
          {g.label.toUpperCase()}
        </div>
        <div style={{ fontSize: 12, color: "#ffffff55", fontFamily: "'Share Tech Mono', monospace", marginTop: 4, letterSpacing: 1 }}>
          METRICS: {METRICS[game].map(m => m.label).join(" · ")}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOP 3 PODIUM
═══════════════════════════════════════════════════════ */
function Podium({ players, game }) {
  const r = ranked(players, game);
  const g = GAMES[game];
  if (r.length === 0) return null;
  const slots = [r[1], r[0], r[2]]; // 2nd, 1st, 3rd
  const podiumH = [100, 140, 80];
  const medals = ["🥈","🥇","🥉"];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 12, marginBottom: 28, padding: "0 20px" }}>
      {slots.map((p, i) => !p ? <div key={i} style={{ flex: 1, maxWidth: 220 }}/> : (
        <div key={p.id} style={{
          flex: 1, maxWidth: i === 1 ? 260 : 220,
          animation: `fadeUp 0.6s cubic-bezier(.34,1.56,.64,1) ${i * 0.15}s both`,
        }}>
          {/* Card */}
          <div style={{
            background: i === 1 ? `linear-gradient(160deg, ${g.color}22, ${g.dark}cc)` : "#0a0a1a99",
            border: `2px solid ${i === 1 ? g.color + "cc" : g.color + "33"}`,
            borderRadius: 16, padding: "16px 12px", textAlign: "center",
            boxShadow: i === 1 ? `0 0 40px ${g.color}44, 0 0 80px ${g.color}22` : "none",
            position: "relative", overflow: "hidden",
            transform: i === 1 ? "scale(1.05)" : "scale(1)",
          }}>
            {i === 1 && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                background: g.color, color: "#000", fontSize: 8, fontWeight: 900,
                padding: "3px 16px", borderRadius: "0 0 8px 8px", letterSpacing: 3,
                fontFamily: "'Orbitron', monospace",
              }}>CHAMPION</div>
            )}
            <div style={{ fontSize: i === 1 ? 36 : 28, marginBottom: 6, marginTop: i === 1 ? 12 : 0 }}>{medals[i]}</div>
            <div style={{ fontWeight: 900, fontSize: i === 1 ? 16 : 13, color: "#fff", fontFamily: "'Orbitron', monospace", marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: g.color, fontFamily: "'Share Tech Mono', monospace", marginBottom: 8, letterSpacing: 1 }}>{p.id}</div>
            <div style={{ fontSize: i === 1 ? 34 : 26, fontWeight: 900, color: g.color, fontFamily: "'Orbitron', monospace",
              textShadow: `0 0 20px ${g.color}`, animation: "countUp 0.5s ease both" }}>
              {p.metrics.score ?? p.metrics[Object.keys(p.metrics)[0]]}
              <span style={{ fontSize: 11, color: "#ffffff44" }}>pts</span>
            </div>
          </div>
          {/* Podium base */}
          <div style={{
            height: podiumH[i], background: `linear-gradient(180deg, ${g.color}22, ${g.color}05)`,
            border: `1px solid ${g.color}33`, borderTop: "none", borderRadius: "0 0 8px 8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 900, color: `${g.color}55`,
            fontFamily: "'Orbitron', monospace",
          }}>{i === 0 ? "2" : i === 1 ? "1" : "3"}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PLAYER ROW
═══════════════════════════════════════════════════════ */
function PlayerRow({ p, rank, game, idx, isAdmin, onEdit, onDelete }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  const g = GAMES[game];
  const ms = METRICS[game];

  useEffect(() => { const t = setTimeout(() => setVis(true), idx * 80 + 100); return () => clearTimeout(t); }, [idx]);

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: isAdmin ? "52px 72px 1fr repeat(4, 80px) 96px" : "52px 72px 1fr repeat(4, 80px)",
        alignItems: "center", gap: 6, padding: "12px 16px", marginBottom: 5, borderRadius: 10,
        border: `1px solid ${rank <= 3 ? g.color + "55" : hov ? g.color + "22" : "#ffffff0a"}`,
        background: rank === 1 ? `linear-gradient(90deg, ${g.color}18, transparent)` : hov ? "#ffffff06" : "transparent",
        transform: vis ? hov ? "translateX(6px)" : "none" : "translateX(-30px)",
        opacity: vis ? 1 : 0, transition: "all 0.35s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: rank === 1 ? `inset 0 0 30px ${g.color}11` : "none",
      }}
    >
      <div style={{ textAlign: "center", fontSize: rank <= 3 ? 20 : 13, fontFamily: "'Share Tech Mono', monospace", color: g.color }}>
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
      </div>
      <div style={{
        fontSize: 11, color: g.color, background: `${g.color}18`, border: `1px solid ${g.color}33`,
        borderRadius: 5, padding: "2px 5px", textAlign: "center", fontFamily: "'Share Tech Mono', monospace", letterSpacing: 1,
      }}>{p.id}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: rank === 1 ? "#fff" : "#ccc", fontFamily: "'Orbitron', monospace", letterSpacing: 0.5 }}>{p.name}</div>
      {ms.map(m => (
        <div key={m.key} style={{ textAlign: "center", fontFamily: "'Share Tech Mono', monospace" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: rank === 1 ? g.color : "#aaa" }}>{p.metrics[m.key] ?? "—"}</span>
          <span style={{ fontSize: 9, color: "#555" }}>{m.unit}</span>
        </div>
      ))}
      {isAdmin && (
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onEdit(p)} style={{ padding: "4px 8px", borderRadius: 5, border: `1px solid ${g.color}44`, background: `${g.color}11`, color: g.color, fontSize: 10, cursor: "pointer", fontFamily: "monospace" }}>EDIT</button>
          <button onClick={() => onDelete(p.id)} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid #ff446644", background: "#ff446611", color: "#ff4466", fontSize: 10, cursor: "pointer", fontFamily: "monospace" }}>DEL</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   GAME SELECTOR TABS
═══════════════════════════════════════════════════════ */
function Tabs({ active, onChange, players }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
      {Object.entries(GAMES).map(([k, g]) => {
        const cnt = players.filter(p => p.game === k).length;
        const isActive = active === k;
        return (
          <button key={k} onClick={() => onChange(k)} style={{
            padding: "10px 20px", borderRadius: 10, cursor: "pointer", transition: "all 0.3s",
            border: `2px solid ${isActive ? g.color : g.color + "33"}`,
            background: isActive ? `${g.color}18` : "transparent",
            color: isActive ? g.color : "#666",
            fontFamily: "'Orbitron', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 1,
            boxShadow: isActive ? `0 0 20px ${g.color}33` : "none",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>
              {k === "drone" ? "🚁" : k === "vr" ? "🥽" : "🤖"}
            </span>
            {g.short}
            <span style={{
              background: isActive ? g.color : "#333", color: isActive ? "#000" : "#666",
              borderRadius: 20, padding: "0 7px", fontSize: 10, fontWeight: 900, minWidth: 20, textAlign: "center",
            }}>{cnt}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TABLE HEADER
═══════════════════════════════════════════════════════ */
function TableHeader({ game, isAdmin }) {
  const g = GAMES[game];
  const ms = METRICS[game];
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isAdmin ? "52px 72px 1fr repeat(4, 80px) 96px" : "52px 72px 1fr repeat(4, 80px)",
      gap: 6, padding: "8px 16px", marginBottom: 4,
      fontSize: 9, color: `${g.color}66`, letterSpacing: 2,
      fontFamily: "'Share Tech Mono', monospace", textTransform: "uppercase",
      borderBottom: `1px solid ${g.color}22`,
    }}>
      <div>RANK</div><div>ID</div><div>PLAYER</div>
      {ms.map(m => <div key={m.key} style={{ textAlign: "center" }}>{m.label}</div>)}
      {isAdmin && <div style={{ textAlign: "center" }}>ACTIONS</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LEADERBOARD MAIN VIEW
═══════════════════════════════════════════════════════ */
function LeaderboardView({ players, isAdmin, onEdit, onDelete, onAdminClick }) {
  const [game, setGame] = useState("drone");
  const g = GAMES[game];
  const r = ranked(players, game);

  return (
    <div style={{ minHeight: "100vh", background: "#02020f", color: "#fff", position: "relative" }}>
      <style>{STYLES}</style>
      <FlyingDrone />

      {/* Scanline sweep */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,245,255,0.015) 3px, rgba(0,245,255,0.015) 4px)",
      }}/>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1060, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: 24, position: "relative" }}>
          <div style={{ fontSize: 9, letterSpacing: 6, color: "#ffffff33", fontFamily: "'Share Tech Mono', monospace", marginBottom: 6 }}>
            ◆ TECHFEST 2025 · GAMING ZONE ◆
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 7vw, 76px)", fontWeight: 900, letterSpacing: 6,
            fontFamily: "'Orbitron', monospace", lineHeight: 1,
            background: `linear-gradient(135deg, #fff 0%, ${g.color} 50%, #fff 100%)`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "shimmer 3s linear infinite",
            filter: `drop-shadow(0 0 40px ${g.color}66)`,
          }}>LEADERBOARD</h1>
          <div style={{ fontSize: 10, color: "#ffffff22", marginTop: 6, fontFamily: "'Share Tech Mono', monospace", letterSpacing: 3 }}>
            {new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }).toUpperCase()}
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#00ff88", marginLeft: 10, verticalAlign: "middle", boxShadow: "0 0 8px #00ff88", animation: "pulse 2s infinite" }}/>
            LIVE
          </div>

          {/* ADMIN BUTTON — PROMINENT */}
          <button onClick={onAdminClick} style={{
            position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
            padding: "10px 18px", borderRadius: 10,
            background: isAdmin ? "#00f5ff18" : "#ffffff0a",
            border: isAdmin ? "2px solid #00f5ff" : "2px solid #ffffff33",
            color: isAdmin ? "#00f5ff" : "#fff",
            fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700,
            letterSpacing: 1, cursor: "pointer",
            boxShadow: isAdmin ? "0 0 20px #00f5ff44" : "none",
            transition: "all 0.3s",
          }}>
            {isAdmin ? "⚙ ADMIN" : "🔐 ADMIN"}
          </button>
        </div>

        {/* ── GAME TABS ── */}
        <Tabs active={game} onChange={setGame} players={players} />

        {/* ── GAME BANNER ── */}
        <GameBanner game={game} />

        {/* ── PODIUM ── */}
        <Podium players={players} game={game} />

        {/* ── FULL TABLE ── */}
        <div style={{
          background: "#07071888", border: `1px solid ${g.color}22`,
          borderRadius: 14, overflow: "hidden", backdropFilter: "blur(10px)",
          boxShadow: `0 0 40px ${g.color}11`,
        }}>
          <div style={{ padding: "12px 16px 0" }}>
            <TableHeader game={game} isAdmin={isAdmin} />
          </div>
          <div style={{ padding: "4px 12px 12px" }}>
            {r.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#ffffff22", fontFamily: "'Share Tech Mono', monospace" }}>
                No players yet — add via Admin panel
              </div>
            ) : r.map((p, i) => (
              <PlayerRow key={p.id} p={p} rank={i + 1} game={game} idx={i}
                isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>

        {/* ── STATS FOOTER ── */}
        <div style={{ display: "flex", gap: 20, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
          {Object.entries(GAMES).map(([k, gx]) => (
            <div key={k} style={{ fontSize: 11, fontFamily: "'Share Tech Mono', monospace", color: "#ffffff33", letterSpacing: 2 }}>
              <span style={{ color: gx.color }}>{gx.short}</span>: {players.filter(p => p.game === k).length} players
            </div>
          ))}
          <div style={{ fontSize: 11, fontFamily: "'Share Tech Mono', monospace", color: "#ffffff22", letterSpacing: 2 }}>
            TOTAL: <span style={{ color: "#fff" }}>{players.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════ */
function Login({ onLogin, onBack }) {
  const [user, setUser] = useState(""); const [pass, setPass] = useState(""); const [err, setErr] = useState("");
  const submit = () => {
    if (ADMIN_USERS.find(u => u.username === user && u.password === pass)) onLogin(user);
    else setErr("Invalid credentials. Try again.");
  };
  return (
    <div style={{ minHeight: "100vh", background: "#02020f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{STYLES}</style>
      <FlyingDrone />
      <div style={{
        position: "relative", zIndex: 2, width: 380, padding: 40,
        background: "#07071acc", border: "1px solid #00f5ff33", borderRadius: 20,
        backdropFilter: "blur(20px)", boxShadow: "0 0 80px #00f5ff18",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
          <h2 style={{ fontFamily: "'Orbitron', monospace", color: "#00f5ff", fontSize: 18, letterSpacing: 4 }}>ADMIN LOGIN</h2>
          <p style={{ color: "#ffffff33", fontSize: 10, letterSpacing: 2, fontFamily: "'Share Tech Mono', monospace", marginTop: 5 }}>TECHFEST CONTROL PANEL</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
            <DroneAnim size={50} /><VRAnim size={55} /><RobotAnim size={45} />
          </div>
        </div>
        {[{ label: "USERNAME", val: user, set: setUser, type: "text" }, { label: "PASSWORD", val: pass, set: setPass, type: "password" }].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#00f5ff88", letterSpacing: 3, fontFamily: "'Share Tech Mono', monospace", marginBottom: 5 }}>{f.label}</div>
            <input type={f.type} value={f.val} onChange={e => { f.set(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{ width: "100%", padding: "11px 14px", background: "#0a0a22", border: "1px solid #00f5ff33", borderRadius: 8, color: "#fff", fontSize: 13, fontFamily: "'Share Tech Mono', monospace", outline: "none" }} />
          </div>
        ))}
        {err && <div style={{ color: "#ff4466", fontSize: 11, marginBottom: 10, textAlign: "center", fontFamily: "monospace" }}>⚠ {err}</div>}
        <button onClick={submit} style={{
          width: "100%", padding: "13px", background: "#00f5ff18", border: "2px solid #00f5ff",
          borderRadius: 10, color: "#00f5ff", fontSize: 13, fontWeight: 900, cursor: "pointer",
          fontFamily: "'Orbitron', monospace", letterSpacing: 3, boxShadow: "0 0 20px #00f5ff22", marginBottom: 10,
        }}>LOGIN →</button>
        <button onClick={onBack} style={{
          width: "100%", padding: "10px", background: "transparent", border: "1px solid #ffffff11",
          borderRadius: 10, color: "#ffffff44", fontSize: 10, cursor: "pointer", fontFamily: "monospace", letterSpacing: 2,
        }}>← BACK</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PLAYER FORM
═══════════════════════════════════════════════════════ */
function PlayerForm({ init, onSave, onCancel }) {
  const [name, setName] = useState(init?.name || "");
  const [id, setId] = useState(init?.id || "");
  const [game, setGame] = useState(init?.game || "drone");
  const [metrics, setMetrics] = useState(init?.metrics || {});
  const g = GAMES[game];

  return (
    <div style={{
      background: "#0a0a1a", border: `2px solid ${g.color}44`, borderRadius: 14,
      padding: 24, marginBottom: 20, boxShadow: `0 0 30px ${g.color}22`,
      animation: "fadeUp 0.3s ease both",
    }}>
      <div style={{ fontSize: 11, color: g.color, letterSpacing: 3, fontFamily: "'Orbitron', monospace", marginBottom: 16 }}>
        {init ? "✏ EDIT PLAYER" : "➕ ADD NEW PLAYER"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        {[
          { label: "PLAYER NAME", val: name, set: setName },
          { label: "PLAYER ID", val: id, set: setId, disabled: !!init, placeholder: "e.g. P007" },
        ].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 9, color: "#ffffff44", letterSpacing: 2, fontFamily: "monospace", marginBottom: 5 }}>{f.label}</div>
            <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder || ""} disabled={f.disabled}
              style={{ width: "100%", padding: "9px 11px", background: "#050518", border: "1px solid #ffffff22", borderRadius: 7, color: "#fff", fontSize: 12, fontFamily: "monospace", outline: "none" }} />
          </div>
        ))}
        <div>
          <div style={{ fontSize: 9, color: "#ffffff44", letterSpacing: 2, fontFamily: "monospace", marginBottom: 5 }}>GAME</div>
          <select value={game} onChange={e => { setGame(e.target.value); setMetrics({}); }}
            style={{ width: "100%", padding: "9px 11px", background: "#050518", border: "1px solid #ffffff22", borderRadius: 7, color: "#fff", fontSize: 12, fontFamily: "monospace", outline: "none" }}>
            {Object.entries(GAMES).map(([k, v]) => <option key={k} value={k}>{k === "drone" ? "🚁" : k === "vr" ? "🥽" : "🤖"} {v.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
        {METRICS[game].map(m => (
          <div key={m.key}>
            <div style={{ fontSize: 9, color: "#ffffff44", letterSpacing: 1, fontFamily: "monospace", marginBottom: 5 }}>{m.label}</div>
            <input type="number" value={metrics[m.key] ?? ""} placeholder="0"
              onChange={e => setMetrics(prev => ({ ...prev, [m.key]: parseFloat(e.target.value) || 0 }))}
              style={{ width: "100%", padding: "9px 11px", background: "#050518", border: "1px solid #ffffff22", borderRadius: 7, color: "#fff", fontSize: 12, fontFamily: "monospace", outline: "none" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { if (!name.trim() || !id.trim()) return; onSave({ id: id.trim().toUpperCase(), name: name.trim(), game, metrics, ts: Date.now() }); }}
          style={{ padding: "10px 24px", background: `${g.color}22`, border: `2px solid ${g.color}`, borderRadius: 8, color: g.color, fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "'Orbitron', monospace", letterSpacing: 2 }}>
          SAVE
        </button>
        <button onClick={onCancel} style={{ padding: "10px 24px", background: "transparent", border: "1px solid #ffffff22", borderRadius: 8, color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "monospace" }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════ */
function AdminDashboard({ players, adminUser, onUpdate, onLogout, onViewBoard }) {
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP] = useState(null);
  const [game, setGame] = useState("drone");
  const [search, setSearch] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const g = GAMES[game];

  const add = p => {
    if (players.find(x => x.id === p.id)) { alert("Player ID already exists!"); return; }
    onUpdate([...players, p]); setShowForm(false);
  };
  const edit = p => { onUpdate(players.map(x => x.id === p.id ? p : x)); setEditP(null); };
  const del = id => { onUpdate(players.filter(p => p.id !== id)); setConfirmDel(null); };

  const filtered = ranked(players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  ), game).filter(p => p.game === game);

  return (
    <div style={{ minHeight: "100vh", background: "#02020f", color: "#fff", position: "relative" }}>
      <style>{STYLES}</style>
      <FlyingDrone />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1060, margin: "0 auto", padding: "20px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 9, color: "#00f5ff88", letterSpacing: 4, fontFamily: "'Share Tech Mono', monospace" }}>CONTROL PANEL</div>
            <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 26, letterSpacing: 3, color: "#fff" }}>ADMIN DASHBOARD</h1>
            <div style={{ fontSize: 10, color: "#ffffff33", fontFamily: "'Share Tech Mono', monospace" }}>
              Logged in as <span style={{ color: "#00f5ff" }}>{adminUser}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onViewBoard} style={{ padding: "10px 16px", background: "#00f5ff18", border: "2px solid #00f5ff", borderRadius: 9, color: "#00f5ff", fontSize: 11, cursor: "pointer", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>
              📺 DISPLAY
            </button>
            <button onClick={onLogout} style={{ padding: "10px 16px", background: "#ff446618", border: "2px solid #ff4466", borderRadius: 9, color: "#ff4466", fontSize: 11, cursor: "pointer", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>
              LOGOUT
            </button>
          </div>
        </div>

        {/* Game stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
          {Object.entries(GAMES).map(([k, gx]) => {
            const cnt = players.filter(p => p.game === k).length;
            return (
              <div key={k} onClick={() => setGame(k)} style={{
                background: k === game ? `${gx.color}18` : "#0a0a1a",
                border: `2px solid ${k === game ? gx.color : gx.color + "33"}`,
                borderRadius: 12, padding: "14px 18px", cursor: "pointer",
                boxShadow: k === game ? `0 0 20px ${gx.color}33` : "none",
                transition: "all 0.3s", display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ flexShrink: 0 }}>
                  {k === "drone" ? <DroneAnim size={50} /> : k === "vr" ? <VRAnim size={55} /> : <RobotAnim size={45} />}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "#ffffff44", letterSpacing: 2, fontFamily: "monospace" }}>{gx.label.toUpperCase()}</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: gx.color, fontFamily: "'Orbitron', monospace" }}>{cnt}</div>
                  <div style={{ fontSize: 9, color: "#ffffff33", fontFamily: "monospace" }}>PARTICIPANTS</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          <input placeholder="🔍  Search name or ID..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: "10px 14px", background: "#0a0a1a", border: `1px solid ${g.color}33`, borderRadius: 8, color: "#fff", fontSize: 12, fontFamily: "'Share Tech Mono', monospace", outline: "none" }} />
          {!showForm && !editP && (
            <button onClick={() => setShowForm(true)} style={{
              padding: "10px 20px", background: `${g.color}22`, border: `2px solid ${g.color}`, borderRadius: 8,
              color: g.color, fontSize: 12, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Orbitron', monospace", letterSpacing: 2, whiteSpace: "nowrap",
            }}>+ ADD PLAYER</button>
          )}
        </div>

        {(showForm || editP) && <PlayerForm init={editP} onSave={editP ? edit : add} onCancel={() => { setShowForm(false); setEditP(null); }} />}

        {/* Table */}
        <div style={{ background: "#07071888", border: `1px solid ${g.color}22`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 12px 0", background: `${g.color}08`, borderBottom: `1px solid ${g.color}22` }}>
            <TableHeader game={game} isAdmin={true} />
          </div>
          <div style={{ padding: "6px 8px 10px" }}>
            {filtered.length === 0
              ? <div style={{ padding: "40px", textAlign: "center", color: "#ffffff22", fontFamily: "'Share Tech Mono', monospace" }}>No players found. Add some! ↑</div>
              : filtered.map((p, i) => (
                <PlayerRow key={p.id} p={p} rank={ranked(players, game).indexOf(p) + 1}
                  game={game} idx={i} isAdmin
                  onEdit={x => { setEditP(x); setShowForm(false); }}
                  onDelete={id => setConfirmDel(id)} />
              ))
            }
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#0a0a1a", border: "2px solid #ff446688", borderRadius: 14, padding: 32, textAlign: "center", boxShadow: "0 0 60px #ff446622" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontFamily: "'Orbitron', monospace", color: "#fff", fontSize: 14, marginBottom: 8, letterSpacing: 2 }}>DELETE PLAYER?</div>
            <div style={{ color: "#ff4466", fontFamily: "'Share Tech Mono', monospace", fontSize: 14, marginBottom: 22 }}>{confirmDel}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => del(confirmDel)} style={{ padding: "10px 24px", background: "#ff446622", border: "2px solid #ff4466", borderRadius: 8, color: "#ff4466", cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 11 }}>CONFIRM DELETE</button>
              <button onClick={() => setConfirmDel(null)} style={{ padding: "10px 24px", background: "transparent", border: "1px solid #ffffff22", borderRadius: 8, color: "#888", cursor: "pointer", fontFamily: "monospace" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState("board"); // board | login | admin
  const [admin, setAdmin] = useState(null);
  const [players, setPlayers] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => { loadPlayers().then(p => { setPlayers(p); setReady(true); }); }, []);

  const update = async p => { setPlayers(p); await savePlayers(p); };

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: "#02020f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <style>{STYLES}</style>
      <DroneAnim size={80} />
      <div style={{ color: "#00f5ff", fontFamily: "'Orbitron', monospace", fontSize: 13, letterSpacing: 4, animation: "pulse 1.5s infinite" }}>LOADING...</div>
    </div>
  );

  if (view === "login") return <Login onLogin={u => { setAdmin(u); setView("admin"); }} onBack={() => setView("board")} />;

  if (view === "admin") return (
    <AdminDashboard players={players} adminUser={admin} onUpdate={update}
      onLogout={() => { setAdmin(null); setView("board"); }}
      onViewBoard={() => setView("board")} />
  );

  return (
    <LeaderboardView players={players} isAdmin={!!admin}
      onEdit={() => setView("admin")}
      onDelete={async id => { const np = players.filter(p => p.id !== id); await update(np); }}
      onAdminClick={() => admin ? setView("admin") : setView("login")} />
  );
}
