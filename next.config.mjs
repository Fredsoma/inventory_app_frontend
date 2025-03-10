/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/oprahv1.appspot.com/o/**",
      },
      {
        protocol: "https",
        hostname: "www.pinterest.com",
        port: "",
        pathname: "/pin/**",
      },
    ],
  },
  output: "export", // Enables static HTML export
  images: {
    unoptimized: true, // Fixes image optimization issues for static export
  },
  trailingSlash: true, // Ensures correct routing for Netlify
};

export default nextConfig;
