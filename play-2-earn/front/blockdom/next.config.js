/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "fill it",
            },
        ]
    }
}

module.exports = nextConfig
