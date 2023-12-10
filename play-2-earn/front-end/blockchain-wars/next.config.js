/** @type {import('next').NextConfig} */
// require("dotenv").config
const nextConfig = {
  reactStrictMode: false,
  basePath: "",
  // env:{
  //   API_KEY: process.env.ETHERSCAN_SEPOLIA_API_KEY
  // }
  experimental: {
    serverActions: true,
  }
};

module.exports = nextConfig;
