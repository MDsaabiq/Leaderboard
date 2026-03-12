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
    .sort((a, b) => b.score - a.score);
}

async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 8000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || "Request failed");
    }
    return json;
  } finally {
    clearTimeout(timeout);
  }
}

function currentSymbol(game) {
  if (game === "droneArena") {
    return <img src="/assets/drone-arena.png" alt="Drone arena" />;
  }

  if (game === "robotSoccer") {
    return <img src="/assets/robot-soccer.png" alt="Robot soccer" />;
  }

  const vrGif = process.env.NEXT_PUBLIC_VR_GIF_URL;
  if (vrGif) {
    return <img src={vrGif} alt="VR gameplay" />;
  }

  return (
    <svg viewBox="0 0 120 70" width="100%" height="100%" aria-label="VR headset icon">
      <defs>
        <linearGradient id="vrg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#89ff5b" />
          <stop offset="1" stopColor="#00e4ff" />
        </linearGradient>
      </defs>
      <rect x="10" y="18" width="100" height="35" rx="14" fill="#0a1a25" stroke="url(#vrg)" strokeWidth="3" />
      <circle cx="40" cy="36" r="11" fill="#102c1c" stroke="#89ff5b" />
      <circle cx="80" cy="36" r="11" fill="#082639" stroke="#00e4ff" />
      <path d="M10 36c16-20 84-20 100 0" stroke="url(#vrg)" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default function Page() {
  const [game, setGame] = useState("droneArena");
  const [entries, setEntries] = useState(FALLBACK_DATA);
  const [status, setStatus] = useState("Loading live data...");
  const [statusError, setStatusError] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [form, setForm] = useState({
    playerId: "",
    playerName: "",
    game: "droneArena",
    score: 0,
    metricsText: "{}"
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
        setStatus("Network issue: showing cached data backup.");
      } else {
        setEntries(FALLBACK_DATA);
        setStatus("Network issue: showing emergency fallback data.");
      }
      setStatusError(true);
    }
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, []);

  const ranked = useMemo(() => byGameAndScore(entries, game), [entries, game]);
  const top3 = [ranked[1], ranked[0], ranked[2]];
  const gameMeta = GAMES[game];

  const submitEntry = async () => {
    try {
      const parsedMetrics = JSON.parse(form.metricsText || "{}");
      await safeFetch("/api/entries", {
        method: "POST",
        timeoutMs: 10000,
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret
        },
        body: JSON.stringify({
          playerId: form.playerId,
          playerName: form.playerName,
          game: form.game,
          score: Number(form.score),
          metrics: parsedMetrics
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
      await safeFetch(`/api/entries/${encodedId}`, {
        method: "DELETE",
        timeoutMs: 10000,
        headers: {
          "x-admin-secret": adminSecret
        }
      });

      setStatus("Entry deleted.");
      setStatusError(false);
      await refresh();
    } catch (error) {
      console.error("Delete failed", error);
      setStatus(`Delete failed: ${error.message}`);
      setStatusError(true);
    }
  };

  return (
    <main className="screen page">
      <div className="shell">
        <section className="topBar">
          <div className="titleBlock">
            <h1>TECH FEST 2026</h1>
            <p>Gaming Zone Leaderboard | Priority: Drone Arena, VR, Robot Soccer</p>
          </div>
          <button className="adminButton" onClick={() => setAdminOpen((open) => !open)}>
            {adminOpen ? "Close Admin" : "Open Admin"}
          </button>
        </section>

        <section className="tabs">
          {GAME_ORDER.map((id) => {
            const g = GAMES[id];
            const active = id === game;
            return (
              <button
                key={id}
                className={`tab ${active ? "active" : ""}`}
                style={{ borderColor: active ? g.accent : "rgba(255,255,255,.2)" }}
                onClick={() => setGame(id)}
              >
                <span>{g.short}</span>
                <strong>{entries.filter((entry) => entry.game === id).length}</strong>
              </button>
            );
          })}
        </section>

        <section className="banner" style={{ borderColor: `${gameMeta.accent}77`, background: `linear-gradient(120deg, ${gameMeta.panel}, rgba(0,0,0,.35))` }}>
          <div className="symbol3d" style={{ border: `1px solid ${gameMeta.accent}99` }}>
            {currentSymbol(game)}
            <div className="orbitRing" style={{ borderColor: `${gameMeta.accent}99` }} />
          </div>
          <div>
            <h2 style={{ color: gameMeta.accent }}>{gameMeta.title}</h2>
            <p>{gameMeta.subtitle}</p>
            <p className="small">Live metrics: {METRICS[game].join(" | ")}</p>
          </div>
        </section>

        <section className="podium">
          {top3.map((entry, idx) => (
            <article key={entry?.playerId || idx} className="podiumCard" style={{ minHeight: idx === 1 ? 250 : 220 }}>
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

        {adminOpen && (
          <section className="drawer">
            <h3>Admin Controls</h3>
            <p className="small">Use admin secret (from env) for add/update/delete. API logs go to Vercel logs with request IDs.</p>

            <div className="grid2">
              <label>
                Admin Secret
                <input type="password" value={adminSecret} onChange={(event) => setAdminSecret(event.target.value)} placeholder="Enter ADMIN_SECRET" />
              </label>
              <label>
                Game
                <select value={form.game} onChange={(event) => setForm((old) => ({ ...old, game: event.target.value }))}>
                  {GAME_ORDER.map((id) => (
                    <option key={id} value={id}>{GAMES[id].title}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid3">
              <label>
                Player ID
                <input value={form.playerId} onChange={(event) => setForm((old) => ({ ...old, playerId: event.target.value }))} placeholder="P101" />
              </label>
              <label>
                Player Name
                <input value={form.playerName} onChange={(event) => setForm((old) => ({ ...old, playerName: event.target.value }))} placeholder="Player name" />
              </label>
              <label>
                Score
                <input type="number" value={form.score} onChange={(event) => setForm((old) => ({ ...old, score: Number(event.target.value) }))} />
              </label>
            </div>

            <label>
              Metrics JSON
              <textarea rows={4} value={form.metricsText} onChange={(event) => setForm((old) => ({ ...old, metricsText: event.target.value }))} />
            </label>

            <div className="actions">
              <button className="cta" onClick={submitEntry}>Save or Update Entry</button>
              <button className="warn" onClick={deleteEntry}>Delete by Game + Player ID</button>
              <button className="adminButton" onClick={refresh}>Force Refresh</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
