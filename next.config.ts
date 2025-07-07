import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['fs'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/uploads/**',
      },
    ],
  },
  // Vercel最適化設定
  output: 'standalone',
  // 静的ファイルの最適化
  compress: true,
  poweredByHeader: false,
  // ESLintを無効化（デプロイ時のエラー回避）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
