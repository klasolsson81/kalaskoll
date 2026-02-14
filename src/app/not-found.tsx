import Link from 'next/link';

export const metadata = {
  title: 'Sidan hittades inte',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-4xl font-bold text-foreground font-display">
          404
        </h1>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Sidan hittades inte
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Sidan du letar efter finns inte eller har flyttats.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Till startsidan
        </Link>
      </div>
    </div>
  );
}
