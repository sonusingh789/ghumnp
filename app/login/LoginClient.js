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

  // Map ?error= query params set by the Google callback route
  const errorParam = searchParams.get("error");
  const googleError =
    errorParam === "google_failed"   ? "Google sign-in failed. Please try again." :
    errorParam === "google_no_email" ? "Your Google account has no email address." :
    null;

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

        {(error || googleError) ? (
          <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: "11px 14px", fontSize: 13, color: "#dc2626", marginBottom: 20 }}>
            {error || googleError}
          </div>
        ) : null}

        {/* ── Continue with Google ── */}
        <a
          href={`/api/auth/google?from=${encodeURIComponent(from)}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", padding: "13px 16px", borderRadius: 14,
            border: "1.5px solid #e2e8f0", background: "#fff",
            fontSize: 14, fontWeight: 700, color: "#0f172a",
            textDecoration: "none", boxSizing: "border-box",
            boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
            transition: "box-shadow 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.06)"; }}
        >
          {/* Google "G" logo */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </a>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>or sign in with email</span>
          <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="login-email" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="login-password" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Password</label>
            <input
              id="login-password"
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
              background: loading ? "#6b7280" : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
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
