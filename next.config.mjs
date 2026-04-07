/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  experimental: {
    // Allow up to 20MB JSON bodies through the proxy middleware.
    // Each image is base64-encoded before upload (~33% size overhead),
    // so a 4MB image becomes ~5.3MB. 20MB gives comfortable headroom.
    proxyClientMaxBodySize: '20mb',
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.75'],
};

export default nextConfig;
