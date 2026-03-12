export const ADMIN_SESSION_COOKIE = "tf_admin_session";

export function isAuthorizedRequest(request) {
  const secretFromHeader = request.headers.get("x-admin-secret");
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  const secretOk = Boolean(
    process.env.ADMIN_SECRET && secretFromHeader === process.env.ADMIN_SECRET
  );

  const cookieOk = sessionCookie === "ok";

  return secretOk || cookieOk;
}

export function getLoginCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "techfest2026"
  };
}
