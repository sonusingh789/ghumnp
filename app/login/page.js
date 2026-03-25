import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { sanitizeReturnPath } from "@/utils/navigation";

export const metadata = {
  title: "Login - Ghum Nepal",
  description:
    "Sign in to your Ghum Nepal account to access your profile, favorites, and contributions.",
  openGraph: {
    title: "Login - Ghum Nepal",
    description:
      "Sign in to your Ghum Nepal account to access your profile, favorites, and contributions.",
    url: "https://ghumnepal.com/login",
    siteName: "Ghum Nepal",
    images: [
      {
        url: "https://ghumnepal.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Login - Ghum Nepal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login - Ghum Nepal",
    description:
      "Sign in to your Ghum Nepal account to access your profile, favorites, and contributions.",
    images: ["https://ghumnepal.com/og-image.jpg"],
    site: "@ghumnepal",
  },
};

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialFrom = sanitizeReturnPath(resolvedSearchParams?.from);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginClient initialFrom={initialFrom} />
    </Suspense>
  );
}
