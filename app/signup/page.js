"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = form, 2 = success

  function update(field) { return (e) => setForm(f => ({ ...f, [field]: e.target.value })); }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1400);
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "var(--bg, #f5f2eb)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center", fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--jade-soft, #e8f5ed)", border: "3px solid #1a6b3a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 36 }}>
          🎉
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#0f1a0f", marginBottom: 12 }}>
          Welcome to Ghum Nepal!
        </h1>
        <p style={{ fontSize: 14, color: "#5a6b5a", lineHeight: 1.7, maxWidth: 300, marginBottom: 32 }}>
          Your account has been created. Start discovering the beauty of Nepal's 77 districts.
        </p>
        <button type="button" onClick={() => router.push("/home")} style={{ background: "#1a6b3a", color: "#fff", border: "none", cursor: "pointer", borderRadius: 999, padding: "15px 40px", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 20px rgba(26,107,58,0.35)" }}>
          Start Exploring →
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "var(--bg, #f5f2eb)", display: "flex", flexDirection: "column", fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)" }}>
      {/* Top band */}
      <div style={{
        height: 200, position: "relative", overflow: "hidden", flexShrink: 0,
        backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,26,15,0.75) 100%), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&auto=format&fit=crop')",
        backgroundPosition: "center 35%", backgroundSize: "cover",
      }}>
        <Link href="/login" style={{ position: "absolute", top: 20, left: 20, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,254,249,0.18)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <path d="M19 12H5" /><path d="m11 18-6-6 6-6" />
          </svg>
        </Link>
        <div style={{ position: "absolute", bottom: 24, left: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>Join the community</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Create Account</h1>
        </div>
      </div>

      {/* Form card */}
      <div style={{ flex: 1, margin: "0 16px", marginTop: -28, position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fffef9", borderRadius: 28, border: "1px solid rgba(15,26,15,0.08)", boxShadow: "0 20px 60px rgba(15,26,15,0.14)", padding: "28px 24px 24px" }}>

          {/* Social */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <SocialBtn icon="google" label="Google" />
            <SocialBtn icon="facebook" label="Facebook" />
          </div>

          <Divider />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
            <Field label="Full Name">
              <input value={form.name} onChange={update("name")} placeholder="Karma Sherpa" autoComplete="name" style={inputStyle} />
            </Field>

            <Field label="Email Address">
              <input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" autoComplete="email" style={inputStyle} />
            </Field>

            <Field label="Password">
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"} value={form.password}
                  onChange={update("password")} placeholder="Min. 8 characters"
                  autoComplete="new-password" style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9aaa9a", display: "flex" }}>
                  {showPassword ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && <PasswordStrength password={form.password} />}
            </Field>

            <Field label="Confirm Password">
              <input type="password" value={form.confirm} onChange={update("confirm")} placeholder="Re-enter password" autoComplete="new-password" style={{ ...inputStyle, borderColor: form.confirm && form.confirm !== form.password ? "#fca5a5" : "rgba(15,26,15,0.12)" }} />
              {form.confirm && form.confirm !== form.password && (
                <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4, fontWeight: 500 }}>Passwords do not match</div>
              )}
            </Field>

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
              marginTop: 4,
            }}>
              {loading ? <Spinner /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#5a6b5a" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ fontWeight: 700, color: "#1a6b3a" }}>Sign In</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 16, marginBottom: 32, fontSize: 11, color: "#9aaa9a", lineHeight: 1.6 }}>
          By signing up you agree to our{" "}
          <span style={{ color: "#5a6b5a", fontWeight: 600 }}>Terms</span> and{" "}
          <span style={{ color: "#5a6b5a", fontWeight: 600 }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const levels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= score ? colors[score] : "rgba(15,26,15,0.1)", transition: "all 0.3s ease" }} />
        ))}
      </div>
      {score > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: colors[score] }}>{levels[score]}</div>}
    </div>
  );
}

function SocialBtn({ icon, label }) {
  const icons = {
    google: <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
    facebook: <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/></svg>,
  };
  return (
    <button type="button" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 999, background: "#f5f2eb", border: "1.5px solid rgba(15,26,15,0.12)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0f1a0f" }}>
      {icons[icon]}{label}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: "rgba(15,26,15,0.08)" }} />
      <span style={{ fontSize: 12, color: "#9aaa9a", fontWeight: 500 }}>or sign up with email</span>
      <div style={{ flex: 1, height: 1, background: "rgba(15,26,15,0.08)" }} />
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
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function EyeOff() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>;
}

const inputStyle = {
  width: "100%", padding: "13px 16px", borderRadius: 14,
  border: "1.5px solid rgba(15,26,15,0.12)", background: "#f5f2eb",
  fontSize: 14, color: "#0f1a0f", outline: "none",
  fontFamily: "inherit", transition: "border-color 0.2s ease",
};
