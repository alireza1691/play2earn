/** @type {import('next').NextConfig} */
const nextConfig = {

    experimental: {
        esmExternals: true,
      },
      reactStrictMode: false,

      images: {
        domains: ['gateway.pinata.cloud'],
      },
}

module.exports = nextConfig
