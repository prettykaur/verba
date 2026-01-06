// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/search', '/search?', '/*?q='],
      },
    ],
    sitemap: 'https://tryverba.com/sitemap.xml',
  };
}
