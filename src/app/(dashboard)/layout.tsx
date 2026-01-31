import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './LogoutButton';
import { DeleteAccountButton } from './DeleteAccountButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-primary">
              KalasKoll
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Mina kalas
            </Link>
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <LogoutButton />
            <DeleteAccountButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
