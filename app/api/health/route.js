import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const collection = await getCollection();
    await collection.findOne({}, { projection: { _id: 1 } });
    return NextResponse.json({ ok: true, service: "leaderboard-api" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Database connection failed.", message: error.message },
      { status: 500 }
    );
  }
}
