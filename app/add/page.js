import AppShell from "@/components/layout/app-shell";
import ContributionForm from "@/components/forms/contribution-form";

export default function AddPage() {
  return (
    <AppShell>
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
          Add Contribution
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Help others discover Nepal
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This front end is ready for your future submission API, moderation flow, and file upload backend.
        </p>
      </section>

      <section className="mt-8 rounded-[32px] bg-white p-5 shadow-[0_22px_48px_rgba(17,24,39,0.08)]">
        <ContributionForm />
      </section>
    </AppShell>
  );
}
