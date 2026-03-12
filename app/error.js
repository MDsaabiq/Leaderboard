"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("UI fatal error", error);
  }, [error]);

  return (
    <main className="screen center">
      <div className="fatalCard">
        <h1>Display Interrupted</h1>
        <p>The UI hit an unexpected error. Use reset to recover quickly on projector.</p>
        <button onClick={reset}>Reset Display</button>
      </div>
    </main>
  );
}
