import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { sanitizeReturnPath } from "@/utils/navigation";

export const metadata = {
  title: "Login - visitNepal77",
  description:
    "Sign in to your visitNepal77 account to access your profile, favorites, and contributions.",
  openGraph: {
    title: "Login - visitNepal77",
    description:
      "Sign in to your visitNepal77 account to access your profile, favorites, and contributions.",
    url: "https://visitnepal77.com/login",
    siteName: "visitNepal77",
    images: [
      {
        url: "https://visitnepal77.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Login - visitNepal77",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login - visitNepal77",
    description:
      "Sign in to your visitNepal77 account to access your profile, favorites, and contributions.",
    images: ["https://visitnepal77.com/og-image.jpg"],
    site: "@visitnepal77",
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
