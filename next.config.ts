import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function extractBase64Tar(source: string, label: string) {
  if (!existsSync(source)) return;
  const archive = join(tmpdir(), `${label}-${process.pid}.tar.gz`);
  const encoded = readFileSync(source, "utf8").trim();
  writeFileSync(archive, Buffer.from(encoded, "base64"));
  execFileSync("tar", ["-xzf", archive, "-C", process.cwd()], { stdio: "inherit" });
  rmSync(archive, { force: true });
}

// The repository previously contained a packaged storefront that the Vercel
// build-command override was skipping. Extract it before Next reads the app,
// then apply the direct-publish admin overrides.
extractBase64Tar(join(process.cwd(), "scripts", "silent-commerce-upgrade.b64"), "silent-script-storefront");
extractBase64Tar(join(process.cwd(), "scripts", "blob-runtime-overrides.b64"), "silent-script-blob-overrides");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
