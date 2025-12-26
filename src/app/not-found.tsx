import Link from "next/link";

export default function NotFound() {
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
          color: "#0070f3",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "32px",
          fontWeight: "600",
          margin: "20px 0",
          color: "#333",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: "18px",
          color: "#666",
          maxWidth: "500px",
          marginBottom: "30px",
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "15px" }}>
        <Link
          href="/projects"
          style={{
            padding: "12px 24px",
            background: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "500",
            fontSize: "16px",
          }}
        >
          Browse Projects
        </Link>
        <Link
          href="/"
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#0070f3",
            textDecoration: "none",
            border: "2px solid #0070f3",
            borderRadius: "6px",
            fontWeight: "500",
            fontSize: "16px",
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
