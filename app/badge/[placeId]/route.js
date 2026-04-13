/**
 * GET /badge/[placeId]
 *
 * Returns an embeddable SVG badge for a place.
 * Places can embed this on their own website: <img src="https://visitnepal77.com/badge/kathmandu-durbar-square">
 * Every embed creates a canonical reference (DoFollow potential) back to visitNepal77.
 */
import { getApprovedPlaceBySlug } from "@/lib/content";

export const revalidate = 3600;

export async function GET(request, { params }) {
  const { placeId } = await params;

  const place = await getApprovedPlaceBySlug(placeId).catch(() => null);

  const name = place?.name ? escapeXml(place.name.slice(0, 40)) : "visitNepal77";
  const rating = place?.rating ? Number(place.rating).toFixed(1) : null;
  const category = place?.category ? escapeXml(capitalize(place.category)) : "Place";
  const district = place?.districtId ? escapeXml(capitalize(place.districtId)) : "Nepal";
  const verified = Boolean(place?.isVerified);

  // Star fill: each of 5 stars — full, half, or empty based on rating
  const stars = rating ? buildStars(Number(rating)) : "";

  const badgeWidth = 220;
  const badgeHeight = 68;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${badgeWidth}" height="${badgeHeight}" viewBox="0 0 ${badgeWidth} ${badgeHeight}" role="img" aria-label="${name} — visitNepal77">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#064e35"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${badgeWidth}" height="${badgeHeight}" rx="12"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${badgeWidth}" height="${badgeHeight}" rx="12" fill="url(#bg)"/>

  <!-- Left accent strip -->
  <rect width="4" height="${badgeHeight}" rx="0" fill="rgba(255,255,255,0.18)"/>

  <!-- Logo text -->
  <text x="16" y="17" font-family="system-ui,-apple-system,sans-serif" font-size="9" font-weight="700" fill="rgba(255,255,255,0.55)" letter-spacing="0.12em">VISITNEPAL77</text>

  ${verified ? `<!-- Verified checkmark -->
  <text x="182" y="17" font-family="system-ui,-apple-system,sans-serif" font-size="9" font-weight="700" fill="#86efac">✓ VERIFIED</text>` : ""}

  <!-- Place name -->
  <text x="16" y="37" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="800" fill="#ffffff" letter-spacing="-0.01em">${name}</text>

  <!-- Category · District -->
  <text x="16" y="52" font-family="system-ui,-apple-system,sans-serif" font-size="10" font-weight="600" fill="rgba(255,255,255,0.65)">${category} · ${district}</text>

  <!-- Rating stars -->
  ${rating ? `<text x="16" y="64" font-family="system-ui,-apple-system,sans-serif" font-size="11" fill="#fbbf24">${stars}</text>
  <text x="${16 + stars.length * 6.5}" y="64" font-family="system-ui,-apple-system,sans-serif" font-size="10" font-weight="700" fill="rgba(255,255,255,0.8)" dx="4">${rating}</text>` : ""}

  <!-- External link arrow hint -->
  <text x="${badgeWidth - 16}" y="${badgeHeight - 10}" font-family="system-ui,-apple-system,sans-serif" font-size="9" font-weight="600" fill="rgba(255,255,255,0.4)" text-anchor="end">visitnepal77.com ↗</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildStars(rating) {
  let result = "";
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) result += "★";
    else if (rating >= i - 0.5) result += "½";
    else result += "☆";
  }
  return result;
}
