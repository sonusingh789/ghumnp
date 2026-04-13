"use client";

import Image from "next/image";

/**
 * BlurImage — drop-in wrapper around next/image.
 *
 * The global custom loader (imagekit-loader.js) only meaningfully optimises
 * ImageKit and Unsplash URLs. For any other source — local paths, random
 * external CDNs, Wikipedia, WordPress-hosted images, etc. — we set
 * `unoptimized={true}` so Next.js skips the loader and serves the original
 * URL directly, eliminating the "loader does not implement width" warning.
 *
 * The skeleton effect is handled purely by the `.img-skeleton` CSS class on
 * the parent container — no JS state, no race conditions.
 */

const CDN_HOSTS = ["ik.imagekit.io", "images.unsplash.com"];

function isManagedCdn(src) {
  if (!src || typeof src !== "string") return false;
  return CDN_HOSTS.some((host) => src.includes(host));
}

export default function BlurImage({ src, unoptimized, ...props }) {
  // Caller can always force unoptimized=true; otherwise we infer from the URL.
  const shouldBypassLoader = unoptimized ?? !isManagedCdn(src);
  return <Image src={src} unoptimized={shouldBypassLoader} {...props} />;
}
