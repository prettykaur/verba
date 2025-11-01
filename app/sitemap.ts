// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static hero pages
  const heroes = [
    "https://tryverba.com/answers/nyt-mini/2025-10-12",
    "https://tryverba.com/answers/nyt-mini/2025-10-13",
    "https://tryverba.com/answers/nyt-mini/2025-10-14",
    "https://tryverba.com/answers/nyt-mini/2025-10-15",
    "https://tryverba.com/answers/nyt-mini/2025-10-16",
    "https://tryverba.com/answers/nyt-mini/2025-10-17",
    "https://tryverba.com/answers/nyt-mini/2025-10-18",
    "https://tryverba.com/answers/nyt-mini/2025-10-19",
    "https://tryverba.com/answers/nyt-mini/2025-10-20",
    "https://tryverba.com/answers/nyt-mini/2025-10-21",
  ];

  const now = new Date();

  return [
    { url: "https://tryverba.com/", lastModified: now },
    { url: "https://tryverba.com/answers", lastModified: now },
    { url: "https://tryverba.com/answers/nyt-mini", lastModified: now },
    ...heroes.map((url) => ({ url, lastModified: new Date("2025-10-21") })),
  ];
}
