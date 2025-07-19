/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // basePath: '/miniapps/gridotto',
  // assetPrefix: '/miniapps/gridotto/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config, { dev, isServer }) => {
    // Production modunda console.log'ları kaldır
    if (!dev) {
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true;
        }
      });
    }
    return config;
  },
};

module.exports = nextConfig; 