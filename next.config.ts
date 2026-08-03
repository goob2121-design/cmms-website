import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 4,
  },
  async redirects() {
    return [
      {
        source: "/sponsor-rsvp",
        destination: "https://stageflow.cumberlandmountainmusic.com/sponsor-rsvp",
        permanent: true,
      },
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
