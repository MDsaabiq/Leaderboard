import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { createRequestId, logError, logInfo } from "@/lib/logger";
import { GAME_ORDER } from "@/lib/game-config";
import { normalizeEntry, validateEntry } from "@/lib/validation";
import { isAuthorizedRequest } from "@/lib/admin-auth";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 }
  );
}

export async function GET(request) {
  const requestId = createRequestId();
  try {
    const game = request.nextUrl.searchParams.get("game");
    const collection = await getCollection();
    const query = game && GAME_ORDER.includes(game) ? { game } : {};

    const entries = await collection
      .find(query)
      .project({ _id: 0 })
      .sort({ score: -1, updatedAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, entries, requestId }, { status: 200 });
  } catch (error) {
    logError("entries_get_failed", error, { requestId });
    return NextResponse.json(
      { ok: false, error: "Failed to load leaderboard entries.", requestId },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const requestId = createRequestId();

  if (!isAuthorizedRequest(request)) {
    logInfo("entries_post_unauthorized", { requestId });
    return unauthorized();
  }

  try {
    const payload = await request.json();
    const errors = validateEntry(payload);

    if (errors.length) {
      return NextResponse.json(
        { ok: false, error: "Validation failed.", details: errors, requestId },
        { status: 400 }
      );
    }

    const entry = normalizeEntry(payload);
    const collection = await getCollection();

    await collection.updateOne(
      { game: entry.game, playerId: entry.playerId },
      {
        $set: entry,
        $setOnInsert: { createdAt: new Date().toISOString() }
      },
      { upsert: true }
    );

    logInfo("entries_post_success", { requestId, game: entry.game, playerId: entry.playerId });

    return NextResponse.json(
      { ok: true, entry, requestId },
      { status: 200 }
    );
  } catch (error) {
    logError("entries_post_failed", error, { requestId });
    return NextResponse.json(
      { ok: false, error: "Failed to save leaderboard entry.", requestId },
      { status: 500 }
    );
  }
}
