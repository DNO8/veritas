"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"person" | "startup" | "project" | "pyme">(
    "person",
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      alert(`Error: ${error.message}`);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        alert(`Error: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: email,
          name: name,
          role: role,
        } as any);

        if (userError) {
          alert(`Error creating user profile: ${userError.message}`);
        } else {
          alert("Account created! Please check your email to verify.");
          router.push("/login");
        }
      }

      setLoading(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Sign Up</h1>

      <button
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "16px",
          background: "white",
          color: "#333",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: googleLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
          />
        </svg>
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>

      <div style={{ position: "relative", margin: "20px 0" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: "1px",
            background: "#ddd",
          }}
        />
        <span
          style={{
            position: "relative",
            background: "white",
            padding: "0 10px",
            display: "inline-block",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#666",
            fontSize: "14px",
          }}
        >
          or
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="name"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Password *
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Minimum 6 characters
          </small>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="role"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Account Type *
          </label>
          <select
            id="role"
            required
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value as "person" | "startup" | "project" | "pyme",
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="person">Person</option>
            <option value="startup">Startup</option>
            <option value="project">Project</option>
            <option value="pyme">PYME</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "18px",
            background: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "15px",
          }}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "#0070f3", textDecoration: "none" }}
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
