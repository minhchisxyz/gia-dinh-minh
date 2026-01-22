
import { spawnSync } from "node:child_process"
import { createSerwistRoute } from "@serwist/turbopack"
import path from "node:path"

const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout ?? crypto.randomUUID()

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const { dynamicParams, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: path.resolve(process.cwd(), "app/sw.ts"),
  // Copy relevant Next.js configuration (assetPrefix,
  // basePath, distDir) over if you've changed them.
  nextConfig: {

  },
})