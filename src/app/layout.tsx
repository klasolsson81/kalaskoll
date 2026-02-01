import type { Metadata, Viewport } from 'next';
import { Inter, Fredoka } from 'next/font/google';
import { DevBadge } from '@/components/shared/DevBadge';
import { FeedbackWidget } from '@/components/shared/FeedbackWidget';
import { Footer } from '@/components/layout/Footer';
import { APP_URL } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const fredoka = Fredoka({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF9F7' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'KalasKoll – Smarta barnkalas-inbjudningar med QR-kod',
    template: '%s | KalasKoll',
  },
  description:
    'Skapa digitala barnkalas-inbjudningar med QR-kod. Gäster svarar via mobilen, du ser OSA i realtid. Hantera allergier GDPR-säkert. Gratis att börja!',
  keywords: [
    'barnkalas',
    'inbjudningar',
    'kalas',
    'barnkalas inbjudan',
    'QR-kod inbjudan',
    'OSA barnkalas',
    'digital inbjudan',
    'barnkalas planering',
    'födelsedagskalas',
    'allergi kalas',
  ],
  authors: [{ name: 'KalasKoll' }],
  creator: 'KalasKoll',
  publisher: 'KalasKoll',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: APP_URL,
    siteName: 'KalasKoll',
    title: 'KalasKoll – Smarta barnkalas-inbjudningar',
    description: 'Skapa digitala barnkalas-inbjudningar med QR-kod. Gästerna svarar via mobilen!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KalasKoll – Smarta barnkalas-inbjudningar',
    description: 'Skapa digitala inbjudningar med QR-kod. Gästerna svarar via mobilen!',
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
  alternates: {
    canonical: APP_URL,
    languages: {
      'sv-SE': APP_URL,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} ${fredoka.variable}`}>
      <body className="min-h-screen bg-app-gradient font-sans antialiased">
        {children}
        <FeedbackWidget />
        <Footer />
        <DevBadge />
      </body>
    </html>
  );
}
