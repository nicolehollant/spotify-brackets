/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'pbs.twimg.com', 'i.scdn.co', 'mosaic.scdn.co', 'thisis-images.scdn.co'],
  },
}

module.exports = nextConfig
