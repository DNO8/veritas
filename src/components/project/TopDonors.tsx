"use client";

interface Donation {
  id: string;
  donor_wallet: string;
  amount: string;
  asset: string;
  tx_hash: string;
  network: string;
  created_at: string;
}

interface DonorStats {
  wallet: string;
  totalAmount: number;
  donationCount: number;
  lastDonation: string;
}

interface TopDonorsProps {
  donations: Donation[];
  limit?: number;
}

export default function TopDonors({ donations, limit = 5 }: TopDonorsProps) {
  // Aggregate donations by donor wallet
  const donorStats = donations.reduce(
    (acc, donation) => {
      const wallet = donation.donor_wallet;
      const amount = parseFloat(donation.amount);

      if (!acc[wallet]) {
        acc[wallet] = {
          wallet,
          totalAmount: 0,
          donationCount: 0,
          lastDonation: donation.created_at,
        };
      }

      acc[wallet].totalAmount += amount;
      acc[wallet].donationCount += 1;

      // Keep the most recent donation date
      if (new Date(donation.created_at) > new Date(acc[wallet].lastDonation)) {
        acc[wallet].lastDonation = donation.created_at;
      }

      return acc;
    },
    {} as Record<string, DonorStats>,
  );

  // Convert to array and sort by total amount
  const topDonors = Object.values(donorStats)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);

  if (topDonors.length === 0) {
    return null;
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
      <h2 style={{ marginBottom: "15px" }}>🏆 Top Donors</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {topDonors.map((donor, index) => (
          <div
            key={donor.wallet}
            style={{
              padding: "15px",
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {/* Rank Badge */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background:
                  index === 0
                    ? "linear-gradient(135deg, #FFD700, #FFA500)"
                    : index === 1
                      ? "linear-gradient(135deg, #C0C0C0, #A8A8A8)"
                      : index === 2
                        ? "linear-gradient(135deg, #CD7F32, #8B4513)"
                        : "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
                color: index < 3 ? "white" : "#666",
                flexShrink: 0,
              }}
            >
              {index === 0
                ? "🥇"
                : index === 1
                  ? "🥈"
                  : index === 2
                    ? "🥉"
                    : index + 1}
            </div>

            {/* Donor Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 5px 0",
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {donor.wallet.substring(0, 8)}...
                {donor.wallet.substring(donor.wallet.length - 8)}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                {donor.donationCount} donation
                {donor.donationCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Total Amount */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p
                style={{
                  margin: "0 0 3px 0",
                  fontWeight: "bold",
                  fontSize: "18px",
                  color:
                    index === 0
                      ? "#FFD700"
                      : index === 1
                        ? "#C0C0C0"
                        : index === 2
                          ? "#CD7F32"
                          : "#0070f3",
                }}
              >
                {donor.totalAmount.toFixed(2)} XLM
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#999" }}>
                Last: {new Date(donor.lastDonation).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {topDonors.length >= limit && donations.length > limit && (
        <p
          style={{
            marginTop: "15px",
            marginBottom: 0,
            fontSize: "13px",
            color: "#666",
            textAlign: "center",
          }}
        >
          Showing top {limit} of {Object.keys(donorStats).length} unique donors
        </p>
      )}
    </div>
  );
}
