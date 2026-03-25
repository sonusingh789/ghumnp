import { Suspense } from "react";
import SignupClient from "./SignupClient";
import { sanitizeReturnPath } from "@/utils/navigation";

export const metadata = {
  title: "Sign Up - Ghum Nepal",
  description:
    "Create your Ghum Nepal account to save favorite places, write reviews, and contribute to the travel community.",
  openGraph: {
    title: "Sign Up - Ghum Nepal",
    description:
      "Create your Ghum Nepal account to save favorite places, write reviews, and contribute to the travel community.",
    url: "https://ghumnepal.com/signup",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sign Up - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - Ghum Nepal",
    description:
      "Create your Ghum Nepal account to save favorite places, write reviews, and contribute to the travel community.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
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
