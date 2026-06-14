/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // We rely on Vercel to inject env vars in production.
  // Locally, copy `.env.example` to `.env.local`.
};

export default nextConfig;
