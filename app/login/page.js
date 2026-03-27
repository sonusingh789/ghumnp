import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { sanitizeReturnPath } from "@/utils/navigation";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Login",
  description:
    "Sign in to your visitNepal77 account to access your profile, favorites, and contributions.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialFrom = sanitizeReturnPath(resolvedSearchParams?.from);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginClient initialFrom={initialFrom} />
    </Suspense>
  );
}
