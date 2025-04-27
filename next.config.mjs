/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Rewrites configuration to proxy specific API routes, excluding /api/auth
  async rewrites() {
    return [
      // Proxy all API routes EXCEPT /api/auth/* to the backend
      {
        source: "/api/((?!auth/).*)", // Use negative lookahead to exclude /api/auth/
        destination: `${
          process.env.BACKEND_URL || "http://localhost:8001"
        }/api/:path*`,
      },
    ];
  },
  // API configuration
  experimental: {
    largePageDataBytes: 128 * 100000, // Increase size limit for large responses
  },
};

export default nextConfig;
