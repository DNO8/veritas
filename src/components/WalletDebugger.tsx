"use client";

import { useEffect, useState } from "react";

interface WalletDetectionStatus {
  freighter: boolean;
  xBull: boolean;
  albedo: boolean;
  windowObjects: string[];
}

export default function WalletDebugger() {
  const [status, setStatus] = useState<WalletDetectionStatus | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkWallets = () => {
      const windowKeys = Object.keys(window).filter(
        (key) =>
          key.toLowerCase().includes("freighter") ||
          key.toLowerCase().includes("xbull") ||
          key.toLowerCase().includes("albedo") ||
          key.toLowerCase().includes("stellar"),
      );

      setStatus({
        freighter: !!(window as any).freighter,
        xBull:
          !!(window as any).xBullSDK || !!(window as any).xBullWalletConnect,
        albedo: !!(window as any).albedo,
        windowObjects: windowKeys,
      });
    };

    checkWallets();

    // Recheck after a delay (extensions may load late)
    const timeout = setTimeout(checkWallets, 2000);

    return () => clearTimeout(timeout);
  }, []);

  if (!status) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setShowDebug(!showDebug)}
        style={{
          padding: "8px 12px",
          background: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        {showDebug ? "Hide" : "Show"} Wallet Detection Debug
      </button>

      {showDebug && (
        <div
          style={{
            marginTop: "10px",
            padding: "15px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
            Wallet Detection Status
          </h4>

          <div style={{ marginBottom: "10px" }}>
            <strong>Freighter:</strong>{" "}
            <span style={{ color: status.freighter ? "#10b981" : "#ef4444" }}>
              {status.freighter ? "✓ Detected" : "✗ Not found"}
            </span>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>xBull:</strong>{" "}
            <span style={{ color: status.xBull ? "#10b981" : "#ef4444" }}>
              {status.xBull ? "✓ Detected" : "✗ Not found"}
            </span>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <strong>Albedo:</strong>{" "}
            <span style={{ color: status.albedo ? "#10b981" : "#ef4444" }}>
              {status.albedo ? "✓ Detected (web-based)" : "✗ Not found"}
            </span>
          </div>

          {status.windowObjects.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <strong>Detected window objects:</strong>
              <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                {status.windowObjects.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </div>
          )}

          {!status.xBull && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "4px",
              }}
            >
              <strong>xBull not detected</strong>
              <p style={{ margin: "5px 0 0 0" }}>
                1. Make sure xBull extension is installed
                <br />
                2. Refresh the page after installing
                <br />
                3. Check if extension is enabled in Brave
                <br />
                4. Try opening xBull extension popup first
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
