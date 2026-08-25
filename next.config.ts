import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // The homepage is the scroll build, served as a static page from
      // public/dive. The previous React homepage still exists and is reachable
      // at /classic, so this is reversible by deleting the rule below.
      { source: "/", destination: "/dive/index.html" },
    ];
  },
};

export default nextConfig;
