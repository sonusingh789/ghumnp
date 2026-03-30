import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const COOKIE_NAME = "prescriptoai_token";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

function buildLoginUrl(request) {
  const loginUrl = new URL("/login", request.url);
  const from = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("from", from || "/");
  return loginUrl;
}

function isProtectedPage(pathname) {
  return (
    pathname === "/add" ||
    pathname.startsWith("/add/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/favorites" ||
    pathname.startsWith("/favorites/")
  );
}

function isProtectedApi(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/profile/") || pathname === "/api/profile") {
    return true;
  }

  if (pathname.startsWith("/api/uploads/")) {
    return true;
  }

  if (pathname === "/api/favorites" || pathname.startsWith("/api/favorites/")) {
    return request.method !== "GET";
  }

  if (pathname === "/api/places") {
    return request.method === "POST";
  }

  if (pathname.startsWith("/api/districts/") && pathname.endsWith("/ratings")) {
    return request.method === "POST";
  }

  if (pathname.startsWith("/api/places/") && pathname.endsWith("/reviews")) {
    return request.method === "POST";
  }

  return false;
}

async function hasValidSession(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !JWT_SECRET.length) {
    return false;
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, "", {
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });
  return response;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const needsAuth = isProtectedPage(pathname) || isProtectedApi(request);

  if (!needsAuth) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSession(request);
  if (authenticated) {
    return NextResponse.next();
  }

  if (isProtectedApi(request)) {
    return clearAuthCookie(
      NextResponse.json({ error: "Unauthorized", authenticated: false }, { status: 401 })
    );
  }

  return clearAuthCookie(NextResponse.redirect(buildLoginUrl(request)));
}

export const config = {
  matcher: [
    // Protected pages — always need JWT check
    "/add/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    // Protected API routes — only write operations need JWT (checked inside isProtectedApi)
    "/api/profile/:path*",
    "/api/uploads/:path*",
    // favorites GET is public; POST/DELETE are protected — isProtectedApi filters by method
    "/api/favorites/:path*",
    // Only POST to /api/places needs auth (creating a place); GET is public search
    // Only POST to /api/districts/*/ratings needs auth; GET is public
    // These are handled inside isProtectedApi — but we must still match to reach that check.
    // Keep these narrow: match only the specific sub-paths that can be protected.
    "/api/places",
    "/api/districts/:districtId/ratings",
    "/api/places/:placeId/reviews",
  ],
};
