import { NextResponse } from "next/server";
import { COOKIE_NAME, getCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    ...getCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });
  return response;
}
