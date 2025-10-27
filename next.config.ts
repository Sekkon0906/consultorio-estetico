/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "maps.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
    ],
    domains: [
      "lh3.googleusercontent.com",
      "ui-avatars.com",
      "upload.wikimedia.org",
    ],
  },
};

module.exports = nextConfig;
