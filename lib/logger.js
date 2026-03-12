export function createRequestId() {
  return crypto.randomUUID();
}

export function logInfo(event, details = {}) {
  console.log(
    JSON.stringify({
      level: "info",
      event,
      timestamp: new Date().toISOString(),
      ...details
    })
  );
}

export function logError(event, error, details = {}) {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      message: error?.message || "Unknown error",
      stack: error?.stack,
      ...details
    })
  );
}
