"use client";

import { useState } from "react";

interface Donation {
  id: string;
  donor_wallet: string;
  amount: string;
  asset: string;
  tx_hash: string;
  network: string;
  created_at: string;
}

interface RecentDonationsProps {
  donations: Donation[];
}

export default function RecentDonations({ donations }: RecentDonationsProps) {
  if (donations.length === 0) {
    return (
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Recent Donations</h2>
        <p style={{ color: "#666" }}>
          No donations yet. Be the first to support this project!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        background: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginBottom: "15px" }}>Recent Donations</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {donations.map((donation) => (
          <div
            key={donation.id}
            style={{
              padding: "15px",
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: "0 0 5px 0",
                  fontWeight: "500",
                  fontSize: "16px",
                }}
              >
                {parseFloat(donation.amount).toFixed(2)} {donation.asset}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                From: {donation.donor_wallet.substring(0, 8)}...
                {donation.donor_wallet.substring(
                  donation.donor_wallet.length - 8,
                )}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <a
                href={`https://stellar.expert/explorer/${donation.network.toLowerCase()}/tx/${donation.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "12px",
                  color: "#0070f3",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                View on Stellar 🔗
              </a>
              <p style={{ margin: 0, fontSize: "11px", color: "#999" }}>
                {new Date(donation.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
