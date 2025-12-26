"use client";

import { useState } from "react";
import { useWallet } from "@/lib/hooks/useWallet";
import WalletSelector from "./WalletSelector";
import { WalletType } from "@/lib/stellar/wallet-types";

export default function WalletConnect() {
  const {
    isConnected,
    publicKey,
    walletType,
    isLoading,
    error,
    availableWallets,
    connect,
    disconnect,
    getWalletInfo,
  } = useWallet();

  const [showSelector, setShowSelector] = useState(false);

  if (isLoading) {
    return (
      <div style={{ padding: "10px" }}>
        <span style={{ fontSize: "14px", color: "#666" }}>
          Connecting wallet...
        </span>
      </div>
    );
  }

  // Show wallet selector
  if (!isConnected && showSelector) {
    return (
      <div style={{ marginBottom: "20px" }}>
        <WalletSelector
          availableWallets={availableWallets}
          onSelectWallet={async (type) => {
            const success = await connect(type);
            if (success) {
              setShowSelector(false);
            }
          }}
          isLoading={isLoading}
        />
        <button
          onClick={() => setShowSelector(false)}
          style={{
            marginTop: "10px",
            width: "100%",
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
        {error && (
          <p style={{ marginTop: "10px", color: "#dc2626", fontSize: "14px" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowSelector(true)}
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
          Connect Wallet
        </button>
        <p
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "#666",
            textAlign: "center",
          }}
        >
          Supports Freighter, Albedo, and xBull
        </p>
      </div>
    );
  }

  // Connected - show wallet info
  const walletInfo = walletType ? getWalletInfo(walletType) : null;

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
            ✅ {walletInfo?.name || "Wallet"} Connected
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
