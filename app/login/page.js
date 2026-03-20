"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); router.push("/home"); }, 1200);
  }

  return (
    <div style={{
      minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      background: "var(--bg, #f5f2eb)",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)",
    }}>
      {/* Top illustration band */}
      <div style={{
        height: 220, position: "relative", overflow: "hidden", flexShrink: 0,
        backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(15,26,15,0.72) 100%), url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&auto=format&fit=crop')",
        backgroundPosition: "center 40%", backgroundSize: "cover",
      }}>
        {/* Back button */}
        <Link href="/" style={{ position: "absolute", top: 20, left: 20, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,254,249,0.18)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <path d="M19 12H5" /><path d="m11 18-6-6 6-6" />
          </svg>
        </Link>

        <div style={{ position: "absolute", bottom: 24, left: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
            Welcome back
          </div>
          <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            Sign In
          </h1>
        </div>
      </div>

      {/* Form card */}
      <div style={{ flex: 1, margin: "0 16px", marginTop: -28, position: "relative", zIndex: 10 }}>
        <div style={{ background: "var(--bg-card, #fffef9)", borderRadius: 28, border: "1px solid rgba(15,26,15,0.08)", boxShadow: "0 20px 60px rgba(15,26,15,0.14)", padding: "28px 24px 24px" }}>

          {/* Social login */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <SocialButton icon="google" label="Continue with Google" />
            <SocialButton icon="facebook" label="Continue with Facebook" />
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(15,26,15,0.08)" }} />
            <span style={{ fontSize: 12, color: "#9aaa9a", fontWeight: 500 }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: "rgba(15,26,15,0.08)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Email Address">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                style={inputStyle}
              />
            </Field>

            <Field label="Password">
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9aaa9a", display: "flex", alignItems: "center" }}>
                  {showPassword ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
            </Field>

            <div style={{ textAlign: "right", marginTop: -8 }}>
              <Link href="/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: "var(--jade, #1a6b3a)" }}>
                Forgot password?
              </Link>
            </div>

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#dc2626", fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "15px", borderRadius: 999, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#5a9b6e" : "var(--jade, #1a6b3a)", color: "#fff",
              fontSize: 15, fontWeight: 700, letterSpacing: "0.01em",
              boxShadow: "0 4px 20px rgba(26,107,58,0.35)",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading ? <Spinner /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#5a6b5a" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ fontWeight: 700, color: "var(--jade, #1a6b3a)" }}>
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 20, marginBottom: 32, fontSize: 11, color: "#9aaa9a", lineHeight: 1.6 }}>
          By signing in you agree to our{" "}
          <span style={{ color: "#5a6b5a", fontWeight: 600 }}>Terms of Service</span>
          {" "}and{" "}
          <span style={{ color: "#5a6b5a", fontWeight: 600 }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5a6b5a", marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

function SocialButton({ icon, label }) {
  const icons = {
    google: (
      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
      </svg>
    ),
  };
  return (
    <button type="button" style={{
      width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      padding: "13px 16px", borderRadius: 999,
      background: "var(--bg, #f5f2eb)", border: "1.5px solid rgba(15,26,15,0.12)",
      cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#0f1a0f",
      transition: "all 0.2s ease",
    }}>
      {icons[icon]}
      {label}
    </button>
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

function EyeOn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

const inputStyle = {
  width: "100%", padding: "13px 16px",
  borderRadius: 14, border: "1.5px solid rgba(15,26,15,0.12)",
  background: "var(--bg, #f5f2eb)", fontSize: 14,
  color: "#0f1a0f", outline: "none",
  transition: "border-color 0.2s ease",
  fontFamily: "inherit",
};
