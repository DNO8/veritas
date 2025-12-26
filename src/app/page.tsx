import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>StellarDonate</h1>
      <p style={{ fontSize: "20px", color: "#666", marginBottom: "40px" }}>
        Decentralized donation platform powered by Stellar blockchain
      </p>

      <div style={{ marginBottom: "40px" }}>
        <Link
          href="/projects"
          style={{
            padding: "15px 30px",
            background: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "18px",
            display: "inline-block",
          }}
        >
          Browse Projects
        </Link>
      </div>

      <div style={{ textAlign: "left", marginTop: "60px" }}>
        <h2>Features</h2>
        <ul style={{ lineHeight: "2" }}>
          <li>Direct peer-to-peer donations via Stellar</li>
          <li>No custodial wallets - you control your funds</li>
          <li>Support for XLM and USDC</li>
          <li>Transparent on-chain verification</li>
          <li>No platform fees</li>
        </ul>

        <h2 style={{ marginTop: "40px" }}>Tech Stack</h2>
        <ul style={{ lineHeight: "2" }}>
          <li>Next.js 16 (App Router)</li>
          <li>Supabase (Auth + PostgreSQL)</li>
          <li>Stellar SDK</li>
          <li>TypeScript</li>
        </ul>
      </div>
    </div>
  );
}
