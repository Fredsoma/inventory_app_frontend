/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/ipfs/**", // Matches IPFS paths for Pinata
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/oprahv1.appspot.com/o/**", // Firebase image path
      },
      {
        protocol: "https",
        hostname: "www.pinterest.com",
        port: "",
        pathname: "/pin/**", // Pinterest image path
      },
    ],
  },
  // Other Next.js configuration options
};

export default nextConfig;
