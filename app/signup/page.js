import { Suspense } from "react";
import SignupClient from "./SignupClient";
import { sanitizeReturnPath } from "@/utils/navigation";

export default async function SignupPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialFrom = sanitizeReturnPath(resolvedSearchParams?.from);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupClient initialFrom={initialFrom} />
    </Suspense>
  );
}
