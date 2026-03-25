export function sanitizeReturnPath(from) {
  const value = Array.isArray(from) ? from[0] : from;

  if (!value || typeof value !== "string") {
    return "/";
  }

  try {
    const decoded = decodeURIComponent(value);

    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return "/";
    }

    return decoded;
  } catch {
    return "/";
  }
}

export function buildLoginHref(from = "/") {
  const params = new URLSearchParams({ from });
  return `/login?${params.toString()}`;
}

export function buildSignupHref(from = "/") {
  const params = new URLSearchParams({ from });
  return `/signup?${params.toString()}`;
}
