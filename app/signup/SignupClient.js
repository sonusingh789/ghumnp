"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildLoginHref, sanitizeReturnPath } from "@/utils/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
import BrandLogo from "@/components/ui/brand-logo";

const AUTH_PAGES = new Set(["/login", "/signup"]);
const PROTECTED_BACK_PATHS = ["/profile", "/favorites", "/add"];

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 14,
  border: "1.5px solid #e2e8f0",
  background: "#f8fafc",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
};

export default function SignupClient({ initialFrom = "/" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = useMemo(() => {
    const liveFrom = searchParams.get("from");
    return sanitizeReturnPath(liveFrom || initialFrom);
  }, [initialFrom, searchParams]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleBack() {
    if (typeof window === "undefined") { router.push("/"); return; }
    const referrer = document.referrer;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const currentUrl = new URL(window.location.href);
        const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
        if (
          referrerUrl.origin === currentUrl.origin &&
          referrerPath !== `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}` &&
          !AUTH_PAGES.has(referrerUrl.pathname)
        ) { router.push(referrerPath); return; }
      } catch {}
    }
    if (from && !AUTH_PAGES.has(from) && !PROTECTED_BACK_PATHS.some((p) => from.startsWith(p))) {
      router.push(from); return;
    }
    router.push("/");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || (data.details && "Validation failed") || "Signup failed"); return; }
      router.replace(from);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100svh", background: "linear-gradient(160deg, #064e35 0%, #0a6644 40%, #059669 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>

      {/* Back button */}
      <div style={{ width: "100%", maxWidth: 400, marginBottom: 20 }}>
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <ArrowLeftIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Brand + headline */}
      <div style={{ width: "100%", maxWidth: 400, textAlign: "center", marginBottom: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <BrandLogo variant="light" size="lg" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 6 }}>Join visitNepal77</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Discover, share, and contribute to Nepal's travel community</p>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

        {error ? (
          <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: "11px 14px", fontSize: 13, color: "#dc2626", marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={150}
              placeholder="Your full name"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={150}
              placeholder="name@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
              Password
              <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>min 8 characters</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Create a strong password"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 6px 20px rgba(5,150,105,0.35)",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            {loading ? (
              <>
                <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </>
            ) : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            Already have an account?{" "}
            <a href={buildLoginHref(from)} style={{ fontWeight: 700, color: "#059669", textDecoration: "none" }}>
              Sign in →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
