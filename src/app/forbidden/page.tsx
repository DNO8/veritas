import Link from "next/link";

export default function ForbiddenPage() {
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
          color: "#f59e0b",
        }}
      >
        403
      </h1>
      <h2
        style={{
          fontSize: "32px",
          fontWeight: "600",
          margin: "20px 0",
          color: "#333",
        }}
      >
        Access Forbidden
      </h2>
      <p
        style={{
          fontSize: "18px",
          color: "#666",
          maxWidth: "500px",
          marginBottom: "30px",
        }}
      >
        You don't have permission to access this resource. This could be
        because:
      </p>
      <ul
        style={{
          textAlign: "left",
          color: "#666",
          fontSize: "16px",
          maxWidth: "400px",
          marginBottom: "30px",
          lineHeight: "1.8",
        }}
      >
        <li>You're not logged in</li>
        <li>You're trying to access someone else's project</li>
        <li>Your session has expired</li>
        <li>
          You're trying to access a page that doesn't match your account state
        </li>
      </ul>
      <div style={{ display: "flex", gap: "15px" }}>
        <Link
          href="/login"
          style={{
            padding: "12px 24px",
            background: "#f59e0b",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "500",
            fontSize: "16px",
          }}
        >
          Login
        </Link>
        <Link
          href="/projects"
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#f59e0b",
            textDecoration: "none",
            border: "2px solid #f59e0b",
            borderRadius: "6px",
            fontWeight: "500",
            fontSize: "16px",
          }}
        >
          Browse Projects
        </Link>
      </div>
    </div>
  );
}
