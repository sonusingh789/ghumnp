import { Suspense } from "react";
import SignupClient from "./SignupClient";
import { sanitizeReturnPath } from "@/utils/navigation";

export const metadata = {
  title: "Sign Up - visitNepal77",
  description:
    "Create your visitNepal77 account to save favorite places, write reviews, and contribute to the travel community.",
  openGraph: {
    title: "Sign Up - visitNepal77",
    description:
      "Create your visitNepal77 account to save favorite places, write reviews, and contribute to the travel community.",
    url: "https://visitnepal77.com/signup",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sign Up - visitNepal77",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - visitNepal77",
    description:
      "Create your visitNepal77 account to save favorite places, write reviews, and contribute to the travel community.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
  },
};

export default async function SignupPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialFrom = sanitizeReturnPath(resolvedSearchParams?.from);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupClient initialFrom={initialFrom} />
    </Suspense>
  );
}
