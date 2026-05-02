import type { NextConfig } from "next";
import { realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Turbopack resolves modules from this app directory (not a symlink parent path).
    root: realpathSync(configDir),
  },
};

export default nextConfig;
