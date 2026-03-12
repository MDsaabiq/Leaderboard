"use client";

import { useEffect, useMemo, useState } from "react";
import { GAMES, GAME_ORDER, METRICS } from "@/lib/game-config";

const FALLBACK_DATA = [
  { playerId: "P001", playerName: "Sneha Gupta", game: "droneArena", score: 980, metrics: { score: 980, accuracy: 97, time: 41, penalties: 0 } },
  { playerId: "P002", playerName: "Arjun Sharma", game: "droneArena", score: 930, metrics: { score: 930, accuracy: 93, time: 46, penalties: 1 } },
  { playerId: "P003", playerName: "Dev Rao", game: "droneArena", score: 890, metrics: { score: 890, accuracy: 89, time: 48, penalties: 2 } },
  { playerId: "P004", playerName: "Priya Patel", game: "vr", score: 960, metrics: { score: 960, combo: 86, hits: 144, time: 118 } },
  { playerId: "P005", playerName: "Karan Joshi", game: "vr", score: 910, metrics: { score: 910, combo: 71, hits: 135, time: 132 } },
  { playerId: "P006", playerName: "Aisha Khan", game: "robotSoccer", score: 940, metrics: { score: 940, wins: 6, goals: 18, time: 130 } },
  { playerId: "P007", playerName: "Rohan Mehta", game: "robotSoccer", score: 900, metrics: { score: 900, wins: 5, goals: 14, time: 141 } }
];

function byGameAndScore(entries, game) {
  return entries
    .filter((item) => item.game === game)
    .sort((a, b) => {
      const scoreOrder = (Number(b.score) || 0) - (Number(a.score) || 0);
      if (scoreOrder !== 0) return scoreOrder;

      const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      const timeOrder = bTime - aTime;
      if (timeOrder !== 0) return timeOrder;

      return String(a.playerName || "").localeCompare(String(b.playerName || ""));
    });
}

function buildMetricValues(gameId, current = {}) {
  return METRICS[gameId].reduce((acc, key) => {
    const raw = current?.[key];
    acc[key] = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    return acc;
  }, {});
}

async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || "Request failed");
    }
    return json;
  } finally {
    clearTimeout(timeout);
  }
}

function Drone3D() {
  return (
    <div className="scene sceneDrone" aria-label="3D Drone animation">
      <svg viewBox="0 0 120 90" width="100%" height="100%">
        <rect x="38" y="36" width="44" height="20" rx="8" className="metalBody" />
        <rect x="47" y="40" width="26" height="8" rx="3" className="glassPanel" />
        <line x1="38" y1="40" x2="22" y2="28" className="armLine" />
        <line x1="82" y1="40" x2="98" y2="28" className="armLine" />
        <line x1="38" y1="52" x2="22" y2="64" className="armLine" />
        <line x1="82" y1="52" x2="98" y2="64" className="armLine" />
        <g className="prop propA"><ellipse cx="22" cy="28" rx="11" ry="3" /></g>
        <g className="prop propB"><ellipse cx="98" cy="28" rx="11" ry="3" /></g>
        <g className="prop propC"><ellipse cx="22" cy="64" rx="11" ry="3" /></g>
        <g className="prop propD"><ellipse cx="98" cy="64" rx="11" ry="3" /></g>
      </svg>
      <div className="sceneGlow" />
    </div>
  );
}

function Robot3D() {
  return (
    <div className="scene sceneRobot" aria-label="3D Robot animation">
      <svg viewBox="0 0 120 90" width="100%" height="100%">
        <rect x="40" y="8" width="40" height="22" rx="6" className="metalBody" />
        <circle cx="53" cy="18" r="5" className="eyeL" />
        <circle cx="67" cy="18" r="5" className="eyeR" />
        <rect x="36" y="32" width="48" height="30" rx="8" className="robotTorso" />
        <rect x="20" y="36" width="16" height="8" rx="4" className="robotArm leftArm" />
        <rect x="84" y="36" width="16" height="8" rx="4" className="robotArm rightArm" />
        <circle cx="48" cy="72" r="8" className="soccerBall" />
      </svg>
      <div className="sceneGlow" />
    </div>
  );
}

function VR3D() {
  const vrGif = process.env.NEXT_PUBLIC_VR_GIF_URL;
  const canUseGif = vrGif && /media\.giphy\.com|media\.tenor\.com|\.gif(\?|$)/i.test(vrGif);

  if (canUseGif) {
    return (
      <div className="scene sceneVr" aria-label="VR animation scene">
        <img src={vrGif} alt="VR Gameplay" />
        <div className="sceneGlow" />
      </div>
    );
  }

  return (
    <div className="scene sceneVr" aria-label="3D VR animation">
      <svg viewBox="0 0 120 90" width="100%" height="100%">
        <rect x="16" y="30" width="88" height="30" rx="12" className="vrShell" />
        <circle cx="42" cy="45" r="10" className="vrLensA" />
        <circle cx="78" cy="45" r="10" className="vrLensB" />
        <path d="M16 46C34 20 86 20 104 46" className="vrBand" />
      </svg>
      <div className="sceneGlow" />
    </div>
  );
}

function AnimatedSymbol({ game }) {
  if (game === "droneArena") return <Drone3D />;
  if (game === "vr") return <VR3D />;
  if (game === "robotSoccer") return <Robot3D />;
  if (game === "droneTrack") return <img src="/assets/drone-track.svg" alt="Drone time track" className="symbolImage" />;
  return <img src="/assets/ice-hockey.png" alt="Board ice hockey" className="symbolImage" />;
}

function LoginPanel({ onSuccess, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await safeFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        timeoutMs: 10000
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="loginOverlay">
      <div className="loginCard">
        <h3>Admin Login</h3>
        <p>Login once. Session stays active.</p>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        </label>
        {error && <div className="status error">{error}</div>}
        <div className="actions">
          <button className="cta" onClick={submit} disabled={busy}>{busy ? "Logging in..." : "Login"}</button>
          <button className="adminButton" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [game, setGame] = useState("droneArena");
  const [entries, setEntries] = useState(FALLBACK_DATA);
  const [status, setStatus] = useState("Loading live data...");
  const [statusError, setStatusError] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({
    playerId: "",
    playerName: "",
    game: "droneArena",
    metricValues: buildMetricValues("droneArena", { score: 0 })
  });

  const refresh = async () => {
    try {
      const response = await safeFetch("/api/entries", { timeoutMs: 9000 });
      setEntries(response.entries?.length ? response.entries : FALLBACK_DATA);
      setStatus("Live sync active. Data is persistent in MongoDB.");
      setStatusError(false);
      localStorage.setItem("techfest_cache", JSON.stringify(response.entries || []));
    } catch (error) {
      console.error("Leaderboard refresh failed", error);
      const cached = localStorage.getItem("techfest_cache");
      if (cached) {
        setEntries(JSON.parse(cached));
        setStatus("Mongo/network issue: showing cached backup.");
      } else {
        setEntries(FALLBACK_DATA);
        setStatus("Mongo/network issue: showing emergency fallback data.");
      }
      setStatusError(true);
    }
  };

  useEffect(() => {
    setIsAdmin(localStorage.getItem("tf_admin_ok") === "1");
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, []);

  const ranked = useMemo(() => byGameAndScore(entries, game), [entries, game]);
  const top3 = [ranked[1], ranked[0], ranked[2]];
  const gameMeta = GAMES[game];

  const submitEntry = async () => {
    try {
      const scoreValue = Number(form.metricValues.score || 0);
      await safeFetch("/api/entries", {
        method: "POST",
        timeoutMs: 10000,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: form.playerId,
          playerName: form.playerName,
          game: form.game,
          score: scoreValue,
          metrics: form.metricValues
        })
      });

      setStatus("Entry saved and persisted.");
      setStatusError(false);
      await refresh();
    } catch (error) {
      console.error("Save failed", error);
      setStatus(`Save failed: ${error.message}`);
      setStatusError(true);
    }
  };

  const deleteEntry = async () => {
    try {
      const encodedId = encodeURIComponent(`${form.game}__${form.playerId.toUpperCase()}`);
      await safeFetch(`/api/entries/${encodedId}`, { method: "DELETE", timeoutMs: 10000 });
      setStatus("Entry deleted.");
      setStatusError(false);
      await refresh();
    } catch (error) {
      console.error("Delete failed", error);
      setStatus(`Delete failed: ${error.message}`);
      setStatusError(true);
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setAdminOpen((v) => !v);
      return;
    }
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    localStorage.setItem("tf_admin_ok", "1");
    setIsAdmin(true);
    setAdminOpen(true);
    setShowLogin(false);
    setStatus("Admin session active.");
    setStatusError(false);
  };

  const handleLogout = async () => {
    try {
      await safeFetch("/api/auth/logout", { method: "POST", timeoutMs: 8000 });
    } catch {
      // Intentionally ignored to avoid UI interruption during demo.
    }
    localStorage.removeItem("tf_admin_ok");
    setIsAdmin(false);
    setAdminOpen(false);
    setStatus("Admin session closed.");
    setStatusError(false);
  };

  return (
    <main className="screen page">
      <div className="ambientLight" />
      <div className="shell">
        <section className="topBar">
          <div className="titleBlock">
            <h1>TECH FEST 2026</h1>
            <p>Priority Boards: Drone Arena, VR, Robot Soccer</p>
          </div>
          <div className="actions">
            <button className="adminButton" onClick={handleAdminClick}>{isAdmin ? (adminOpen ? "Close Admin" : "Open Admin") : "Admin Login"}</button>
            {isAdmin && <button className="warn" onClick={handleLogout}>Logout</button>}
          </div>
        </section>

        <section className="tabs">
          {GAME_ORDER.map((id) => {
            const g = GAMES[id];
            const active = id === game;
            return (
              <button key={id} className={`tab ${active ? "active" : ""}`} style={{ borderColor: active ? g.accent : "rgba(255,255,255,.2)", boxShadow: active ? `0 0 24px ${g.accent}55` : "none" }} onClick={() => setGame(id)}>
                <span>{g.short}</span>
                <strong>{entries.filter((entry) => entry.game === id).length}</strong>
              </button>
            );
          })}
        </section>

        <section className="banner" style={{ borderColor: `${gameMeta.accent}99`, background: `linear-gradient(120deg, ${gameMeta.panel}, rgba(0,0,0,.28))` }}>
          <div className="symbol3d"><AnimatedSymbol game={game} /></div>
          <div>
            <h2 style={{ color: gameMeta.accent }}>{gameMeta.title}</h2>
            <p>{gameMeta.subtitle}</p>
            <p className="small">Live metrics: {METRICS[game].join(" | ")}</p>
          </div>
        </section>

        <section className="podium">
          {top3.map((entry, idx) => (
            <article key={entry?.playerId || idx} className={`podiumCard ${idx === 1 ? "champ" : ""}`} style={{ minHeight: idx === 1 ? 250 : 220, borderColor: `${gameMeta.accent}77` }}>
              <div>{idx === 1 ? "CHAMPION" : idx === 0 ? "2ND" : "3RD"}</div>
              <h3>{entry?.playerName || "TBD"}</h3>
              <strong style={{ color: gameMeta.accent }}>{entry?.score ?? 0}</strong>
              <div>{entry?.playerId || "-"}</div>
            </article>
          ))}
        </section>

        <section className="table">
          <div className="row head">
            <div>Rank</div>
            <div>ID</div>
            <div>Player</div>
            <div>Score</div>
            <div>Updated</div>
          </div>
          {ranked.map((entry, idx) => (
            <div className="row body" key={`${entry.game}-${entry.playerId}`}>
              <div>#{idx + 1}</div>
              <div>{entry.playerId}</div>
              <div>{entry.playerName}</div>
              <div style={{ color: gameMeta.accent, fontWeight: 700 }}>{entry.score}</div>
              <div>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleTimeString() : "-"}</div>
            </div>
          ))}
          {!ranked.length && <div className="row body">No entries available for this game.</div>}
        </section>

        <p className={`status ${statusError ? "error" : ""}`}>{status}</p>

        {adminOpen && isAdmin && (
          <section className="drawer">
            <h3>Admin Controls</h3>
            <p className="small">No repeated secret typing. Login once, then use controls directly.</p>

            <div className="grid2">
              <label>
                Game
                <select
                  value={form.game}
                  onChange={(event) =>
                    setForm((old) => ({
                      ...old,
                      game: event.target.value,
                      metricValues: buildMetricValues(event.target.value, old.metricValues)
                    }))
                  }
                >
                  {GAME_ORDER.map((id) => (
                    <option key={id} value={id}>{GAMES[id].title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid2">
              <label>
                Player ID
                <input value={form.playerId} onChange={(event) => setForm((old) => ({ ...old, playerId: event.target.value }))} placeholder="P101" />
              </label>
              <label>
                Player Name
                <input value={form.playerName} onChange={(event) => setForm((old) => ({ ...old, playerName: event.target.value }))} placeholder="Player name" />
              </label>
            </div>

            <div className="grid2">
              {METRICS[form.game].map((metric) => (
                <label key={metric}>
                  {metric}
                  <input
                    type="number"
                    value={form.metricValues[metric] ?? 0}
                    onChange={(event) =>
                      setForm((old) => ({
                        ...old,
                        metricValues: {
                          ...old.metricValues,
                          [metric]: Number(event.target.value)
                        }
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <div className="actions">
              <button className="cta" onClick={submitEntry}>Save or Update Entry</button>
              <button className="warn" onClick={deleteEntry}>Delete by Game + Player ID</button>
              <button className="adminButton" onClick={refresh}>Force Refresh</button>
            </div>
          </section>
        )}
      </div>

      {showLogin && <LoginPanel onSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />}
    </main>
  );
}
