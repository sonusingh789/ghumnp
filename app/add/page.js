import AppShell from "@/components/layout/app-shell";
import ContributionForm from "@/components/forms/contribution-form";

export const metadata = {
  title: "Add a Place - Ghum Nepal",
  description:
    "Contribute a new place to Ghum Nepal and help travelers discover hidden gems across Nepal's 77 districts.",
  openGraph: {
    title: "Add a Place - Ghum Nepal",
    description:
      "Contribute a new place to Ghum Nepal and help travelers discover hidden gems across Nepal's 77 districts.",
    url: "https://ghumnepal.com/add",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Add a Place - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add a Place - Ghum Nepal",
    description:
      "Contribute a new place to Ghum Nepal and help travelers discover hidden gems across Nepal's 77 districts.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
  },
};

export default function AddPage() {
  return (
    <AppShell className="bg-[#f5f6f8]">
      <div className="fade-up mx-auto w-full max-w-3xl px-2 pt-5 sm:px-3">
        <div className="mb-6">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>
            Contribute
          </div>
          <h1 className="display" style={{ fontSize: 30, fontWeight: 700, color: "var(--ink)", lineHeight: 1.05, marginBottom: 8 }}>
            Add a Place
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7 }}>
            Help fellow travelers discover Nepal&apos;s hidden corners. Your contribution gets reviewed before it goes live.
          </p>
        </div>

        <div className="fade-up-1">
          <ContributionForm />
        </div>
      </div>
    </AppShell>
  );
}
