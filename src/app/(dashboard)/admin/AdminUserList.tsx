'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  betaExpiresAt: string | null;
  betaAiImagesUsed: number;
  betaSmsUsed: number;
  partyCount: number;
  feedbackCount: number;
}

type SortKey = 'fullName' | 'email' | 'role' | 'emailConfirmedAt' | 'createdAt' | 'lastSignInAt' | 'partyCount';
type SortDir = 'asc' | 'desc';

export function AdminUserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.fullName?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'fullName':
        case 'email':
        case 'role':
          cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '', 'sv');
          break;
        case 'emailConfirmedAt':
        case 'createdAt':
        case 'lastSignInAt': {
          const aVal = a[sortKey] ?? '';
          const bVal = b[sortKey] ?? '';
          cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          break;
        }
        case 'partyCount':
          cmp = a.partyCount - b.partyCount;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir(key === 'createdAt' || key === 'lastSignInAt' ? 'desc' : 'asc');
      return key;
    });
  }, []);

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3" />
      : <ArrowDown className="ml-1 inline h-3 w-3" />;
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole, action: 'update' }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        );
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Radera användare ${email}? Denna åtgärd kan inte ångras.`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'delete' }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function roleBadgeVariant(role: string) {
    switch (role) {
      case 'admin':
        return 'default' as const;
      case 'tester':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Sök på namn eller e-post..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {filtered.length} av {users.length} användare
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium cursor-pointer select-none hover:bg-muted/80" onClick={() => toggleSort('fullName')}>Namn<SortIcon column="fullName" /></th>
              <th className="px-3 py-2 font-medium cursor-pointer select-none hover:bg-muted/80" onClick={() => toggleSort('email')}>E-post<SortIcon column="email" /></th>
              <th className="px-3 py-2 font-medium cursor-pointer select-none hover:bg-muted/80" onClick={() => toggleSort('role')}>Roll<SortIcon column="role" /></th>
              <th className="hidden px-3 py-2 font-medium sm:table-cell cursor-pointer select-none hover:bg-muted/80" onClick={() => toggleSort('emailConfirmedAt')}>Verifierad<SortIcon column="emailConfirmedAt" /></th>
              <th className="hidden px-3 py-2 font-medium md:table-cell cursor-pointer select-none hover:bg-muted/80" onClick={() => toggleSort('createdAt')}>Registrerad<SortIcon column="createdAt" /></th>
              <th className="hidden px-3 py-2 font-medium md:table-cell cursor-pointer select-none hover:bg-muted/80" onClick={() => toggleSort('lastSignInAt')}>Senast inloggad<SortIcon column="lastSignInAt" /></th>
              <th className="hidden px-3 py-2 font-medium lg:table-cell cursor-pointer select-none hover:bg-muted/80" onClick={() => toggleSort('partyCount')}>Kalas<SortIcon column="partyCount" /></th>
              <th className="px-3 py-2 font-medium">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2">{user.fullName ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-xs">{user.email}</td>
                <td className="px-3 py-2">
                  <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell">
                  {user.emailConfirmedAt ? (
                    <Badge variant="success">Ja</Badge>
                  ) : (
                    <Badge variant="warning">Nej</Badge>
                  )}
                </td>
                <td className="hidden px-3 py-2 md:table-cell">{formatDate(user.createdAt)}</td>
                <td className="hidden px-3 py-2 md:table-cell">{formatDate(user.lastSignInAt)}</td>
                <td className="hidden px-3 py-2 lg:table-cell">{user.partyCount}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={actionLoading === user.id}
                      className="h-7 rounded border bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="user">user</option>
                      <option value="tester">tester</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={() => handleDelete(user.id, user.email ?? '')}
                      disabled={actionLoading === user.id}
                      className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      title="Radera användare"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
