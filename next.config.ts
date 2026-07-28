import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function extractBase64Tar(source: string, label: string, excludeRootConfig = false) {
  if (!existsSync(source)) return;
  const archive = join(tmpdir(), `${label}-${process.pid}.tar.gz`);
  const encoded = readFileSync(source, "utf8").trim();
  writeFileSync(archive, Buffer.from(encoded, "base64"));
  const args = ["-xzf", archive];
  if (excludeRootConfig) args.push("--exclude=next.config.ts", "--exclude=package.json");
  args.push("-C", process.cwd());
  execFileSync("tar", args, { stdio: "inherit" });
  rmSync(archive, { force: true });
}

function copyTree(source: string, destination: string) {
  if (!existsSync(source)) return;
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else copyFileSync(from, to);
  }
}

// Activate the packaged commerce storefront before Next reads the app. Keep
// the active package/config intact, then apply the direct-publish CMS layer.
extractBase64Tar(
  join(process.cwd(), "scripts", "silent-commerce-upgrade.b64"),
  "silent-script-storefront",
  true,
);
extractBase64Tar(
  join(process.cwd(), "scripts", "blob-runtime-overrides.b64"),
  "silent-script-blob-overrides",
);
copyTree(join(process.cwd(), "scripts", "runtime-overrides"), process.cwd());

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
