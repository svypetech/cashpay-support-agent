import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'storage.googleapis.com',
      'cashpayy.com', // Add your main domain if needed
      'api.cashpayy.com', // Add your API domain if needed
    ],
    // Alternatively, you can use remotePatterns for more specific control
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'storage.googleapis.com',
    //     pathname: '/cashpayy/**',
    //   },
    // ],
  },
};

export default nextConfig;