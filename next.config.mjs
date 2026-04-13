/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gzip/Brotli compress all responses (HTML, JS, CSS, JSON).
  compress: true,

  experimental: {
    // Allow up to 20MB JSON bodies through the proxy middleware.
    // Each image is base64-encoded before upload (~33% size overhead),
    // so a 4MB image becomes ~5.3MB. 20MB gives comfortable headroom.
    proxyClientMaxBodySize: '20mb',
    // Tree-shake heavy packages that export many named exports.
    // Prevents the entire package being bundled when only a few exports are used.
    optimizePackageImports: ['lucide-react', 'clsx', 'tailwind-merge', '@vercel/analytics'],
  },
  images: {
    // Custom loader delegates responsive resizing to ImageKit / Unsplash CDN.
    // This generates proper srcsets so mobile gets ~200px images, not 900px ones.
    loader: 'custom',
    loaderFile: './lib/imagekit-loader.js',
    // Cache optimised images at CDN edge for 1 hour (default is 60s).
    minimumCacheTTL: 3600,
    // Declare remote patterns so next/image can generate correct srcsets for CDN images.
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  allowedDevOrigins: ['192.168.1.75'],
  async headers() {
    return [
      {
        // Cache public static assets aggressively (Next.js hashes filenames).
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Cache read-only API responses for 60 s at CDN / shared caches.
        source: '/api/search',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' }],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect non-www to www so canonical URLs always match the served domain.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'visitnepal77.com' }],
        destination: 'https://www.visitnepal77.com/:path*',
        permanent: true,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
