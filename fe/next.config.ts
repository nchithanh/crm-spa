import path from "node:path";
import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
/** Custom domain → để trống. Project Pages: `/crm-spa` */
const rawBase = process.env.GITHUB_PAGES_BASE_PATH ?? "";
const basePath =
  isGithubPages && rawBase
    ? rawBase.startsWith("/")
      ? rawBase
      : `/${rawBase}`
    : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPages
    ? {
        output: "export" as const,
        trailingSlash: true,
        assetPrefix: basePath || undefined,
      }
    : {}),
  turbopack: {
    root: path.join(__dirname),
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
