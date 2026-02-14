'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Crown, Trash2, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

interface ProfileDropdownProps {
  displayName: string;
  email: string;
  isImpersonating?: boolean;
}

export function ProfileDropdown({ displayName, email, isImpersonating = false }: ProfileDropdownProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors — redirect anyway
    }
    window.location.href = '/login';
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(data?.error || 'Kunde inte radera kontot. Försök igen.');
        setDeleting(false);
        return;
      }
      window.location.href = '/login';
    } catch {
      setDeleteError('Nätverksfel. Kontrollera din anslutning och försök igen.');
      setDeleting(false);
    }
  }

  if (showDeleteConfirm) {
    return (
      <div className="flex flex-col gap-1">
        {deleteError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive">{deleteError}</p>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-1.5">
        <span className="text-sm font-medium text-destructive">Radera kontot?</span>
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="rounded-lg bg-destructive px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
        >
          {deleting ? 'Raderar...' : 'Ja, radera'}
        </button>
        <button
          onClick={() => setShowDeleteConfirm(false)}
          disabled={deleting}
          className="rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Avbryt
        </button>
      </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        {!isImpersonating && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User />
                Ändra profil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="opacity-60">
              <Crown className="text-accent" />
              <span>Köp Guldkalas</span>
              <span className="ml-auto rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                Snart
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteConfirm(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 />
              Radera konto
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
          <LogOut />
          {loggingOut ? 'Loggar ut...' : 'Logga ut'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
