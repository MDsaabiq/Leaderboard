import { GAME_ORDER } from "@/lib/game-config";

export function validateEntry(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    errors.push("Payload must be an object.");
    return errors;
  }

  if (!payload.playerId || typeof payload.playerId !== "string") {
    errors.push("playerId is required.");
  }

  if (!payload.playerName || typeof payload.playerName !== "string") {
    errors.push("playerName is required.");
  }

  if (!payload.game || !GAME_ORDER.includes(payload.game)) {
    errors.push("game is invalid.");
  }

  if (typeof payload.score !== "number" || Number.isNaN(payload.score)) {
    errors.push("score must be a number.");
  }

  if (!payload.metrics || typeof payload.metrics !== "object") {
    errors.push("metrics must be an object.");
  }

  return errors;
}

export function normalizeEntry(payload) {
  return {
    playerId: String(payload.playerId).trim().toUpperCase(),
    playerName: String(payload.playerName).trim(),
    game: payload.game,
    score: Number(payload.score),
    metrics: payload.metrics || {},
    updatedAt: new Date().toISOString()
  };
}
