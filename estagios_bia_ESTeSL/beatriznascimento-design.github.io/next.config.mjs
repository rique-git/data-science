/** @type {import('next').NextConfig} */

// When GitHub Actions builds this, GITHUB_REPOSITORY is "owner/repo".
// A project site is served from https://owner.github.io/repo/, so it needs
// basePath "/repo". A user site (repo named "owner.github.io") and local
// `npm run dev` use no basePath. This is detected automatically — no editing
// needed for whichever repo name is used.
const isProd = process.env.NODE_ENV === "production";
const [owner = "", repo = ""] = (process.env.GITHUB_REPOSITORY || "").split("/");
const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const basePath = isProd && repo && !isUserSite ? `/${repo}` : "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
