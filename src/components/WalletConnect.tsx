"use client";

import { useState } from "react";
import { useFreighter } from "@/lib/hooks/useFreighter";

export default function WalletConnect() {
  const {
    isInstalled,
    isConnected,
    publicKey,
    isLoading,
    error,
    connect,
    disconnect,
    checkInstalled,
  } = useFreighter();

  const [manualMode, setManualMode] = useState(false);
  const [manualKey, setManualKey] = useState("");
  const [manualConnected, setManualConnected] = useState(false);

  if (isLoading) {
    return (
      <div style={{ padding: "10px" }}>
        <span style={{ fontSize: "14px", color: "#666" }}>
          Loading wallet...
        </span>
      </div>
    );
  }

  if (!isInstalled) {
    const handleInstallClick = () => {
      // Detectar si es móvil
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // En móvil, redirigir a la app store correspondiente
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isIOS) {
          window.open(
            "https://apps.apple.com/app/freighter/id1626859419",
            "_blank",
          );
        } else {
          window.open(
            "https://play.google.com/store/apps/details?id=com.freighter",
            "_blank",
          );
        }
      } else {
        // En desktop, abrir página de extensión
        window.open("https://www.freighter.app/", "_blank");
      }
    };

    return (
      <div
        style={{
          padding: "15px",
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{ margin: "0 0 10px 0", fontWeight: "bold", color: "#856404" }}
        >
          ⚠️ Freighter Wallet Not Detected
        </p>
        <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#856404" }}>
          You need Freighter wallet to make donations with Stellar.
        </p>
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            background: "#fff",
            borderRadius: "4px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          <strong>If you already have Freighter installed:</strong>
          <ol style={{ margin: "5px 0 0 20px", padding: 0 }}>
            <li>Open Freighter extension</li>
            <li>Go to Settings → Preferences</li>
            <li>Make sure "Experimental Mode" is OFF</li>
            <li>Click "Retry Detection" below</li>
          </ol>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button
            onClick={handleInstallClick}
            style={{
              flex: 1,
              padding: "10px 20px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Install Freighter
          </button>
          <button
            onClick={() => {
              checkInstalled();
              window.location.reload();
            }}
            style={{
              flex: 1,
              padding: "10px 20px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            🔄 Retry Detection
          </button>
        </div>
        <div style={{ borderTop: "1px solid #ddd", paddingTop: "15px" }}>
          <p
            style={{
              margin: "0 0 10px 0",
              fontSize: "13px",
              color: "#666",
              fontWeight: "bold",
            }}
          >
            🛠️ Development Workaround:
          </p>
          <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#666" }}>
            Freighter doesn't work on localhost HTTP. You can manually enter
            your public key for testing:
          </p>
          <button
            onClick={() => setManualMode(true)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ✏️ Connect Manually (Dev Only)
          </button>
        </div>
      </div>
    );
  }

  // Manual connection mode
  if (manualMode && !manualConnected) {
    return (
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          background: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
        }}
      >
        <p
          style={{ margin: "0 0 10px 0", fontWeight: "bold", fontSize: "14px" }}
        >
          ✏️ Manual Connection (Development)
        </p>
        <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#666" }}>
          Enter your Stellar public key (starts with G):
        </p>
        <input
          type="text"
          placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={manualKey}
          onChange={(e) => setManualKey(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "12px",
            fontFamily: "monospace",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              if (manualKey.startsWith("G") && manualKey.length === 56) {
                setManualConnected(true);
              } else {
                alert(
                  "Invalid Stellar public key. Must start with G and be 56 characters.",
                );
              }
            }}
            style={{
              flex: 1,
              padding: "10px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Connect
          </button>
          <button
            onClick={() => {
              setManualMode(false);
              setManualKey("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Manual connected state
  if (manualConnected) {
    return (
      <div
        style={{
          padding: "15px",
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 5px 0",
                fontWeight: "bold",
                color: "#856404",
              }}
            >
              ⚠️ Manual Connection (Dev Mode)
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#856404",
                fontFamily: "monospace",
              }}
            >
              {manualKey.substring(0, 8)}...
              {manualKey.substring(manualKey.length - 8)}
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: "11px",
                color: "#856404",
              }}
            >
              Note: Transactions won't be signed. This is for UI testing only.
            </p>
          </div>
          <button
            onClick={() => {
              setManualConnected(false);
              setManualMode(false);
              setManualKey("");
            }}
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: "#856404",
              border: "2px solid #856404",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={connect}
          style={{
            width: "100%",
            padding: "15px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <span>🔗</span>
          Connect Freighter Wallet
        </button>
        {error && (
          <p style={{ marginTop: "10px", color: "#dc2626", fontSize: "14px" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  // Freighter connected
  return (
    <div
      style={{
        padding: "15px",
        background: "#d4edda",
        border: "1px solid #28a745",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 5px 0",
              fontWeight: "bold",
              color: "#155724",
            }}
          >
            ✅ Freighter Wallet Connected
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#155724",
              fontFamily: "monospace",
            }}
          >
            {publicKey?.substring(0, 8)}...
            {publicKey?.substring(publicKey.length - 8)}
          </p>
        </div>
        <button
          onClick={disconnect}
          style={{
            padding: "8px 16px",
            background: "transparent",
            color: "#155724",
            border: "2px solid #155724",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
