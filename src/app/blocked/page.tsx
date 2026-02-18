import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blockerad',
  robots: { index: false, follow: false },
};

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🤖</div>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Hmm, du verkar inte mänsklig...
        </h1>
        <p className="text-muted-foreground">
          Vår automatiska bot-detektering har flaggat din förfrågan.
          Om du är en riktig person, vänta en stund och försök igen.
        </p>
        <p className="text-sm text-muted-foreground">
          Blockeringen försvinner automatiskt inom en timme.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
}
