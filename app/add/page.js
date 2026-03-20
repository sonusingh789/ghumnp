import AppShell from "@/components/layout/app-shell";
import ContributionForm from "@/components/forms/contribution-form";

export default function AddPage() {
  return (
    <AppShell>
      <div style={{ padding: "24px 20px 0" }} className="fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>
          Contribute
        </div>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 8 }}>
          Add a Place
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          Help fellow travelers discover Nepal's hidden corners. Your contribution gets reviewed and published.
        </p>

        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", padding: "20px", boxShadow: "var(--shadow-sm)" }} className="fade-up-1">
          <ContributionForm />
        </div>
      </div>
    </AppShell>
  );
}
