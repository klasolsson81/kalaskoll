import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { DevBadge } from '@/components/shared/DevBadge';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kalasfix.se'),
  title: {
    default: 'KalasFix – Smarta inbjudningar för barnkalas',
    template: '%s | KalasFix',
  },
  description:
    'Skapa snygga inbjudningskort med AI, hantera OSA och allergier digitalt. Perfekt för barnkalas!',
  keywords: ['barnkalas', 'inbjudningar', 'kalas', 'OSA', 'födelsedagskalas', 'allergi'],
  authors: [{ name: 'KalasFix' }],
  creator: 'KalasFix',
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://kalasfix.se',
    siteName: 'KalasFix',
    title: 'KalasFix – Smarta inbjudningar för barnkalas',
    description: 'Skapa snygga inbjudningskort med AI, hantera OSA och allergier digitalt.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KalasFix – Smarta inbjudningar för barnkalas',
    description: 'Skapa snygga inbjudningskort med AI, hantera OSA och allergier digitalt.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <DevBadge />
      </body>
    </html>
  );
}
