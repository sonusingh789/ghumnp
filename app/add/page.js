import { redirect } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import ContributionForm from "@/components/forms/contribution-form";
import { getCurrentUser } from "@/lib/content";
import { buildLoginHref } from "@/utils/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add a Place - visitNepal77",
  description:
    "Contribute visitNepal77 to help travelers discover hidden gems across Nepal's 77 districts.",
  alternates: {
    canonical: "https://visitnepal77.com/add",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Contribute- visitNepal77",
    description:
      "Contribute a new place to visitNepal77 and help travelers discover hidden gems across Nepal's 77 districts.",
    url: "https://visitnepal77.com/add",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contribute - visitNepal77",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contribute - visitNepal77",
    description:
      "Contribute a new place to visitNepal77 and help travelers discover hidden gems across Nepal's 77 districts.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
  },
};

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
