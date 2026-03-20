import Link from "next/link";
import AppShell from "@/components/layout/app-shell";

export default function NotFound() {
  return (
    <AppShell showNavigation={false}>
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
          Page Not Found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          This route is ready, but the content is missing.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
          Try heading back to the home experience and continue exploring Nepal from there.
        </p>
        <Link
          href="/home"
          className="mt-8 rounded-full bg-primary px-5 py-3 font-semibold text-white"
        >
          Go to Home
        </Link>
      </div>
    </AppShell>
  );
}
