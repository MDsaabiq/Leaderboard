import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getLoginCredentials } from "@/lib/admin-auth";
import { createRequestId, logInfo } from "@/lib/logger";

export async function POST(request) {
  const requestId = createRequestId();

  try {
    const { username, password } = await request.json();
    const expected = getLoginCredentials();

    if (username !== expected.username || password !== expected.password) {
      logInfo("admin_login_failed", { requestId, username });
      return NextResponse.json({ ok: false, error: "Invalid credentials.", requestId }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, requestId }, { status: 200 });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: "ok",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8
    });

    logInfo("admin_login_success", { requestId, username });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request payload.", requestId }, { status: 400 });
  }
}
