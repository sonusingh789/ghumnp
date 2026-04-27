"use client";

import dynamic from "next/dynamic";

// ssr: false — calendar calls new Date() on every render.
// Server (UTC) and client (Nepal UTC+5:45) see different local dates,
// causing hydration mismatches. Skipping SSR entirely avoids this.
const CalendarClient = dynamic(() => import("./calendar-client"), {
  ssr: false,
  loading: () => null,
});

export default function CalendarLoader() {
  return <CalendarClient />;
}
