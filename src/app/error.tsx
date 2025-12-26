"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error caught by error boundary:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "20px",
        textAlign: "center",
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
        500
      </h1>
      <h2
        style={{
          fontSize: "32px",
          fontWeight: "600",
          margin: "20px 0",
          color: "#333",
        }}
      >
        Something Went Wrong
      </h2>
      <p
        style={{
          fontSize: "18px",
          color: "#666",
          maxWidth: "500px",
          marginBottom: "10px",
        }}
      >
        We encountered an unexpected error. Our team has been notified.
      </p>
      {error.message && (
        <p
          style={{
            fontSize: "14px",
            color: "#999",
            maxWidth: "600px",
            marginBottom: "30px",
            fontFamily: "monospace",
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {error.message}
        </p>
      )}
      <div style={{ display: "flex", gap: "15px" }}>
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
          Try Again
        </button>
        <a
          href="/projects"
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#dc2626",
            textDecoration: "none",
            border: "2px solid #dc2626",
            borderRadius: "6px",
            fontWeight: "500",
            fontSize: "16px",
            display: "inline-block",
          }}
        >
          Go to Projects
        </a>
      </div>
    </div>
  );
}
