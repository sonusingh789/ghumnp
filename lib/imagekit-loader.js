/**
 * Custom Next.js image loader.
 *
 * Routing logic:
 *  • ImageKit URLs  → rewrite with `tr=w-{width},q-{quality},f-auto`
 *  • Unsplash URLs  → rewrite with `?w={width}&q={quality}&auto=format&fit=crop`
 *  • Local paths    → returned unchanged (public-dir files; use `unoptimized` on the component)
 *  • Other external → returned with `?w={width}` so Next.js sees width is used;
 *                     most CDN/servers ignore unknown query params harmlessly.
 *
 * NOTE: local images (/logo.png etc.) must have `unoptimized` on their <Image>
 * component — the loader cannot resize files from the public directory.
 */
export default function imagekitLoader({ src, width, quality }) {
  if (!src || typeof src !== 'string') return src ?? '';

  // ── Local public-dir files (e.g. /logo.png) ────────────────
  // Cannot be resized via CDN. Caller must add `unoptimized` prop.
  if (src.startsWith('/') || src.startsWith('data:')) return src;

  // ── ImageKit ────────────────────────────────────────────────
  if (src.includes('ik.imagekit.io')) {
    try {
      const url = new URL(src);
      url.searchParams.delete('tr');
      url.pathname = url.pathname.replace(/\/tr:[^/]+/, '');
      url.searchParams.set('tr', `w-${width},q-${quality || 80},f-auto`);
      return url.toString();
    } catch {
      return src;
    }
  }

  // ── Unsplash ────────────────────────────────────────────────
  if (src.includes('images.unsplash.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', String(quality || 80));
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      return url.toString();
    } catch {
      return src;
    }
  }

  // ── All other external URLs ─────────────────────────────────
  // Append ?w={width} so Next.js sees that the loader uses width.
  // Unknown query params are ignored by virtually every image host.
  try {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    return url.toString();
  } catch {
    return src;
  }
}
