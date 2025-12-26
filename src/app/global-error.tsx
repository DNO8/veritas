"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "20px",
            textAlign: "center",
            background: "#f9fafb",
          }}
        >
          <h1
            style={{
              fontSize: "120px",
              fontWeight: "bold",
              margin: "0",
              color: "#dc2626",
            }}
          >
            ⚠️
          </h1>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "600",
              margin: "20px 0",
              color: "#333",
            }}
          >
            Critical Error
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "#666",
              maxWidth: "500px",
              marginBottom: "30px",
            }}
          >
            A critical error occurred. Please refresh the page or contact
            support if the problem persists.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "500",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
