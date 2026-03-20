import Link from "next/link";
import AppShell from "@/components/layout/app-shell";

export default function NotFound() {
  return (
    <AppShell showNavigation={false}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 32px" }}>
        <div style={{ fontSize: 72, marginBottom: 24, lineHeight: 1 }}>🏔️</div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 8 }}>404 Not Found</div>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, marginBottom: 12 }}>
          Lost in the Mountains?
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7, maxWidth: 280, marginBottom: 32 }}>
          This trail doesn't exist. Head back to the home page and continue your Nepal adventure.
        </p>
        <Link href="/home" style={{ background: "var(--jade)", color: "#fff", borderRadius: 999, padding: "14px 32px", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 20px var(--jade-glow)" }}>
          Back to Home
        </Link>
      </div>
    </AppShell>
  );
}
