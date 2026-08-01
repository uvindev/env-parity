"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="route-error">
      <p className="label">Interface error</p>
      <h1>The coverage desk could not open.</h1>
      <p>
        No source or environment data was sent. Reload the interface and paste
        the key lists again.
      </p>
      <button className="button primary" type="button" onClick={reset}>
        Reload coverage desk
      </button>
    </main>
  );
}
