import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "shop.cumberlandmountainmusic.com",
          },
        ],
        destination: "https://www.cumberlandmountainmusic.com/merch",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
