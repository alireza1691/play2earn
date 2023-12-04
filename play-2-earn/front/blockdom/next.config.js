/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "fill it",
            },
        ]
    },
    reactStrictMode: false
}

module.exports = nextConfig
