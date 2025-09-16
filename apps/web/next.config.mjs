/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5024/api/:path*",
      },
    ];
  },
};
export default nextConfig;
