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
    <AppShell className="bg-[#f5f6f8]">
      <div className="fade-up mx-auto w-full max-w-3xl pt-5 pb-4 px-3 sm:px-3">
        <div className="mb-6">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>
            Contribute
          </div>
          <h1 className="display" style={{ fontSize: 30, fontWeight: 700, color: "var(--ink)", lineHeight: 1.05, marginBottom: 8 }}>
            Add a Place
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7 }}>
            Help fellow travelers discover Nepal&apos;s hidden corners.
          </p>
        </div>

        <div className="fade-up-1">
          <ContributionForm />
        </div>
      </div>
    </AppShell>
  );
}
