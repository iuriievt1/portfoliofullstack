import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@otpbank/ui", "@otpbank/types"]
};

export default nextConfig;
