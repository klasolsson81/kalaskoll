import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/utils/admin-guard';
import { ProfileDropdown } from './ProfileDropdown';
import { AdminFeedbackBadge } from './AdminFeedbackBadge';
import { IdleTimeout } from './IdleTimeout';
import { ImpersonationBanner } from '@/components/layout/ImpersonationBanner';
import { getImpersonationContext } from '@/lib/utils/impersonation';

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

  const impersonation = await getImpersonationContext();
  const isImpersonating = impersonation?.isImpersonating ?? false;

  // When impersonating, show the impersonated user's info in the header
  const headerDisplayName = isImpersonating
    ? impersonation?.impersonatedName || impersonation?.impersonatedEmail || ''
    : displayName;
  const headerEmail = isImpersonating
    ? impersonation?.impersonatedEmail || ''
    : email;

  return (
    <div className="min-h-screen">
      {isImpersonating && (
        <ImpersonationBanner
          name={impersonation?.impersonatedName ?? null}
          email={impersonation?.impersonatedEmail ?? null}
        />
      )}
      <header className={`sticky ${isImpersonating ? 'top-10' : 'top-0'} z-50 border-b border-white/30 bg-white/30 backdrop-blur-xl print:hidden`}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-primary font-display">
                KalasKoll
              </span>
            </Link>
            {isAdmin && !isImpersonating && (
              <nav className="flex items-center gap-1">
                <Link
                  href="/admin"
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Admin
                </Link>
                <AdminFeedbackBadge />
              </nav>
            )}
          </div>
          <ProfileDropdown displayName={headerDisplayName} email={headerEmail} isImpersonating={isImpersonating} />
        </div>
        <div className="h-[3px] gradient-celebration" />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <IdleTimeout isSuperAdmin={isAdmin} />
    </div>
  );
}
