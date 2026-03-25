"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  }

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#f5f2eb", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Top band */}
      <div style={{
        height: 180, position: "relative", overflow: "hidden", flexShrink: 0,
        backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,26,15,0.78) 100%), url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop')",
        backgroundPosition: "center 30%", backgroundSize: "cover",
      }}>
        <Link href="/login" style={{ position: "absolute", top: 20, left: 20, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,254,249,0.18)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <path d="M19 12H5" /><path d="m11 18-6-6 6-6" />
          </svg>
        </Link>
        <div style={{ position: "absolute", bottom: 24, left: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>Account Recovery</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Forgot Password?</h1>
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, margin: "0 16px", marginTop: -28, position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fffef9", borderRadius: 28, border: "1px solid rgba(15,26,15,0.08)", boxShadow: "0 20px 60px rgba(15,26,15,0.14)", padding: "28px 24px 24px" }}>

          {!sent ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, background: "#e8f5ed", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
                  🔐
                </div>
                <p style={{ fontSize: 13, color: "#1a6b3a", lineHeight: 1.6, fontWeight: 500 }}>
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <label style={{ display: "block" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5a6b5a", marginBottom: 6 }}>Email Address</div>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email"
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid rgba(15,26,15,0.12)", background: "#f5f2eb", fontSize: 14, color: "#0f1a0f", outline: "none", fontFamily: "inherit" }}
                  />
                </label>

                {error && (
                  <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#dc2626", fontWeight: 500 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "15px", borderRadius: 999, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading ? "#5a9b6e" : "#1a6b3a", color: "#fff",
                  fontSize: 15, fontWeight: 700,
                  boxShadow: "0 4px 20px rgba(26,107,58,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {loading ? <Spinner /> : null}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div style={{ textAlign: "center", padding: "16px 8px 8px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e8f5ed", border: "3px solid #1a6b3a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>
                📬
              </div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0f1a0f", marginBottom: 10 }}>
                Check Your Email
              </h2>
              <p style={{ fontSize: 14, color: "#5a6b5a", lineHeight: 1.7, marginBottom: 8 }}>
                We've sent a password reset link to
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a6b3a", marginBottom: 28, wordBreak: "break-all" }}>
                {email}
              </p>
              <p style={{ fontSize: 12, color: "#9aaa9a", lineHeight: 1.6, marginBottom: 24 }}>
                Didn't receive it? Check your spam folder or{" "}
                <button type="button" onClick={() => setSent(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#1a6b3a", fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
                  try again
                </button>.
              </p>

              {/* Countdown hint */}
              <div style={{ background: "#f5f2eb", borderRadius: 14, padding: "12px 16px", fontSize: 12, color: "#5a6b5a" }}>
                The link expires in <strong>15 minutes</strong>.
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(15,26,15,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: "#1a6b3a" }}>← Back to Sign In</Link>
            <span style={{ color: "rgba(15,26,15,0.15)" }}>|</span>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 600, color: "#5a6b5a" }}>Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export const metadata = {
  title: "Forgot Password - Ghum Nepal",
  description: "Reset your Ghum Nepal account password. Enter your email to receive a password reset link.",
  openGraph: {
    title: "Forgot Password - Ghum Nepal",
    description: "Reset your Ghum Nepal account password. Enter your email to receive a password reset link.",
    url: "https://ghumnepal.com/forgot-password",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Forgot Password - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot Password - Ghum Nepal",
    description: "Reset your Ghum Nepal account password. Enter your email to receive a password reset link.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
  },
};
