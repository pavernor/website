import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // www.pavernor.tech juga di-route Traefik ke container ini; arahkan
  // permanen (308) ke apex supaya Google tidak melihat dua host duplikat.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.pavernor.tech" }],
        destination: "https://pavernor.tech/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
