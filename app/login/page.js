import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { sanitizeReturnPath } from "@/utils/navigation";

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialFrom = sanitizeReturnPath(resolvedSearchParams?.from);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginClient initialFrom={initialFrom} />
    </Suspense>
  );
}
