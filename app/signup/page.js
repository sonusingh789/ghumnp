import { Suspense } from "react";
import SignupClient from "./SignupClient";
import { sanitizeReturnPath } from "@/utils/navigation";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sign Up",
  description:
    "Create your visitNepal77 account to save favorite places, write reviews, and contribute to the travel community.",
  path: "/signup",
  noIndex: true,
});

export default async function SignupPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialFrom = sanitizeReturnPath(resolvedSearchParams?.from);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupClient initialFrom={initialFrom} />
    </Suspense>
  );
}
