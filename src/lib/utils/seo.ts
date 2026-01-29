import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

export function generateMetadata({
  title,
  description,
  path = '',
  image = '/og-image.png',
}: SeoProps): Metadata {
  const url = `https://kalaskoll.se${path}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${APP_NAME}`,
      description,
      images: [image],
    },
  };
}
