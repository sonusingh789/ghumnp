"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildSignupHref, sanitizeReturnPath } from "@/utils/navigation";
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

export default function LoginClient({ initialFrom = "/" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = useMemo(() => {
    const liveFrom = searchParams.get("from");
    return sanitizeReturnPath(liveFrom || initialFrom);
  }, [initialFrom, searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
      window.location.href = from;
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
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
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Sign in to explore Nepal with your account</p>
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
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              style={{ background: "none", border: "none", fontSize: 12, color: "#059669", fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              Forgot password?
            </button>
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
            }}
          >
            {loading ? (
              <>
                <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            Don't have an account?{" "}
            <a href={buildSignupHref(from)} style={{ fontWeight: 700, color: "#059669", textDecoration: "none" }}>
              Sign up free →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
