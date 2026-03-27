"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { buildLoginHref, sanitizeReturnPath } from "@/utils/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";

const AUTH_PAGES = new Set(["/login", "/signup"]);
const PROTECTED_BACK_PATHS = ["/profile", "/favorites", "/add"];

export default function SignupClient({ initialFrom = "/" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = useMemo(() => {
    const liveFrom = searchParams.get("from");
    return sanitizeReturnPath(liveFrom || initialFrom);
  }, [initialFrom, searchParams]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleBack() {
    if (typeof window === "undefined") {
      router.push("/");
      return;
    }

    const referrer = document.referrer;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const currentUrl = new URL(window.location.href);
        const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;

        if (
          referrerUrl.origin === currentUrl.origin &&
          referrerPath !== `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}` &&
          !AUTH_PAGES.has(referrerUrl.pathname)
        ) {
          router.push(referrerPath);
          return;
        }
      } catch {
      }
    }

    if (from && !AUTH_PAGES.has(from) && !PROTECTED_BACK_PATHS.some((path) => from.startsWith(path))) {
      router.push(from);
      return;
    }

    router.push("/");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
      if (password !== confirmPassword) {
  setError("Passwords do not match");
  return;
}
 if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);

  


    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || (data.details && "Validation failed") || "Signup failed");
        return;
      }
      router.replace(from);
      router.refresh();
    } finally {
      setLoading(false);
    }

    
  }

 return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8 sm:py-10">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
        </div>

        <div className="mb-5 flex justify-center pt-2 sm:pt-4">
          <Image src="/logo.png" alt="visitNepal77 - logo" width={200} height={50} priority />
        </div>

        {/* Card - matches the white card style from the contribution interface */}
        <div className="rounded-2xl border bg-[linear-gradient(145deg,#d9f0de,#dbe7f7)] border-slate-200  p-8 shadow-sm">
          
          {/* Header with icon and title - similar to "Aau a Place" branding */}
          <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#566ffd] via-[#c169d8] to-[#0f9fa4]">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Become a contributor</h2>
              <p className="text-xs text-slate-500">Help fellow travelers discover Nepal's hidden corners</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 border border-red-100">
                <i className="fas fa-exclamation-circle text-red-500 text-xs"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Name field */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                <i className="fas fa-user mr-1.5 text-slate-400 text-xs"></i>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={150}
                placeholder="Your full name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#566ffd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#566ffd]/20 transition-all"
              />
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                <i className="fas fa-envelope mr-1.5 text-slate-400 text-xs"></i>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={150}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#566ffd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#566ffd]/20 transition-all"
              />
            </div>

            {/* Password field */}
<div>
  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
    <i className="fas fa-lock mr-1.5 text-slate-400 text-xs"></i>
    Password <span className="text-xs text-slate-400 font-normal">(min 8 characters)</span>
  </label>
  <input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    minLength={8}
    placeholder="Create a strong password"
    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#566ffd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#566ffd]/20 transition-all"
  />
</div>

{/* Confirm Password field */}
<div>
  <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
    <i className="fas fa-check-circle mr-1.5 text-slate-400 text-xs"></i>
    Confirm Password
  </label>
  <input
    id="confirmPassword"
    type="password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    placeholder="Confirm your password"
    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#566ffd] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#566ffd]/20 transition-all"
  />
</div>

            {/* Submit button - matches the gradient from image sample */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-emerald-600 py-3 font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus text-sm"></i>
                    Sign Up
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-8 pt-2 text-center">
            <p className="text-sm text-emerald-600 ">
              Already have an account?{' '}
              <a href={buildLoginHref(from)} className="font-medium text-[#566ffd] hover:text-[#c169d8] transition-colors inline-flex items-center gap-1">
                Sign in
                <i className="fas fa-arrow-right text-xs"></i>
              </a>
            </p>
          
          </div>
        </div>

    
      </div>
    </div>
  );
}
