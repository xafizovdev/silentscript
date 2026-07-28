import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "silent script.",
    short_name: "silent script.",
    description: "Xotirjam fikrlar uchun premium bloknotlar.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1e8",
    theme_color: "#626947",
    icons: [{ src: "/brand-avatar.svg", sizes: "320x320", type: "image/svg+xml", purpose: "any" }],
  };
}
