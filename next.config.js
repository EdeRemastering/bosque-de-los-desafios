/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16 configuration
  typescript: {
    // Durante el build, ignorar errores de TypeScript
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
