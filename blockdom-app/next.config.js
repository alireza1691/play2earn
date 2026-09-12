/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // `images.domains` was removed in Next 16 — a bare hostname allowed any
  // path and protocol, which is why remotePatterns replaced it.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gateway.pinata.cloud" },
    ],
    // Next 16 only honours qualities named here — anything else falls back to
    // 75 with a warning. These are the values the components actually pass.
    qualities: [10, 30, 70, 75, 80, 100],
  },
};

module.exports = nextConfig;
