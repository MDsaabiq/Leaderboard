import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { createRequestId, logError, logInfo } from "@/lib/logger";

function checkAdminSecret(request) {
  const provided = request.headers.get("x-admin-secret");
  return Boolean(process.env.ADMIN_SECRET && provided === process.env.ADMIN_SECRET);
}

export async function DELETE(request, { params }) {
  const requestId = createRequestId();

  if (!checkAdminSecret(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = params.id;
    const [game, playerId] = decodeURIComponent(id).split("__");

    if (!game || !playerId) {
      return NextResponse.json(
        { ok: false, error: "Invalid identifier format.", requestId },
        { status: 400 }
      );
    }

    const collection = await getCollection();
    const result = await collection.deleteOne({ game, playerId });

    if (!result.deletedCount) {
      return NextResponse.json(
        { ok: false, error: "Entry not found.", requestId },
        { status: 404 }
      );
    }

    logInfo("entry_delete_success", { requestId, game, playerId });
    return NextResponse.json({ ok: true, requestId }, { status: 200 });
  } catch (error) {
    logError("entry_delete_failed", error, { requestId });
    return NextResponse.json(
      { ok: false, error: "Failed to delete entry.", requestId },
      { status: 500 }
    );
  }
}
