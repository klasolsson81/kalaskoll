import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/r/'],
      },
    ],
    sitemap: 'https://kalaskoll.se/sitemap.xml',
  };
}
