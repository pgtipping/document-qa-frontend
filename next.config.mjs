/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
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
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
