/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
destination: 'http://localhost:5024/api/:path*', // Forward to the ASP.NET Core API
      },
    ]
  },
}

module.exports = nextConfig