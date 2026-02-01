import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/utils/admin-guard';
import { ProfileDropdown } from './ProfileDropdown';

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

  const displayName = user.user_metadata?.full_name || user.email || '';
  const email = user.email || '';
  const isAdmin = isAdminEmail(email);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-primary font-display">
                KalasKoll
              </span>
            </Link>
            {isAdmin && (
              <nav className="flex items-center gap-1">
                <Link
                  href="/admin"
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Admin
                </Link>
                <Link
                  href="/admin/feedback"
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Feedback
                </Link>
              </nav>
            )}
          </div>
          <ProfileDropdown displayName={displayName} email={email} />
        </div>
        <div className="h-[3px] gradient-celebration" />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
