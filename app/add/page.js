import { redirect } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import ContributionForm from "@/components/forms/contribution-form";
import { getCurrentUser } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { buildLoginHref } from "@/utils/navigation";

export const metadata = buildMetadata({
  title: "Add a Place",
  description:
    "Contribute a new place to visitNepal77 and help travelers discover hidden gems across Nepal's 77 districts.",
  path: "/add",
  noIndex: true,
});

export default async function AddPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginHref("/add"));
  }

  return (
    <AppShell>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 32px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }} className="fade-up">
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Contribute</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6, letterSpacing: "-0.02em" }}>
            Add a <span style={{ color: "#86efac" }}>Place</span>
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 300 }}>
            Help fellow travelers discover Nepal&apos;s hidden gems and earn contributor badges.
          </p>
        </div>
      </div>

      {/* ── FORM ───────────────────────────────────────────── */}
      <div className="fade-up-1" style={{ padding: "20px 16px 40px" }}>
        <ContributionForm />
      </div>
    </AppShell>
  );
}
