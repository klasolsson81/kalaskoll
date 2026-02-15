'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'destructive' | 'outline' }> = {
  'rsvp.submit': { label: 'OSA-svar', variant: 'success' },
  'party.create': { label: 'Nytt kalas', variant: 'default' },
  'account.delete': { label: 'Konto raderat', variant: 'destructive' },
  'admin.user.delete': { label: 'Admin: radera', variant: 'destructive' },
  'admin.user.role_change': { label: 'Admin: roll', variant: 'outline' },
  'admin.user.invite': { label: 'Admin: inbjudan', variant: 'outline' },
};

export function AuditLogList() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const limit = 50;

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
        setUserMap(data.users ?? {});
        setSummaries(data.summaries ?? {});
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getUserDisplay(log: AuditEntry): string {
    if (log.user_id && userMap[log.user_id]) {
      return userMap[log.user_id];
    }
    if (log.action === 'rsvp.submit') {
      return 'via gästlänk';
    }
    return log.user_id ? log.user_id.slice(0, 8) + '...' : '—';
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Alla åtgärder</option>
          <option value="rsvp.submit">OSA-svar</option>
          <option value="party.create">Nytt kalas</option>
          <option value="account.delete">Konto raderat</option>
          <option value="admin.user.delete">Admin: radera</option>
          <option value="admin.user.role_change">Admin: roll</option>
          <option value="admin.user.invite">Admin: inbjudan</option>
        </select>
        <span className="text-sm text-muted-foreground">{total} poster totalt</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-card p-3">
              <div className="h-4 w-64 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium">Tid</th>
                <th className="px-3 py-2 font-medium">Åtgärd</th>
                <th className="px-3 py-2 font-medium">Beskrivning</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Användare</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const actionInfo = ACTION_LABELS[log.action];
                const summary = summaries[log.id];

                return (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={actionInfo?.variant ?? 'outline'} className="text-xs whitespace-nowrap">
                        {actionInfo?.label ?? log.action}
                      </Badge>
                    </td>
                    <td className="max-w-sm px-3 py-2.5 text-sm">
                      {summary || (
                        <span className="text-muted-foreground">
                          {log.resource_type}
                          {log.resource_id && ` ${log.resource_id.slice(0, 8)}...`}
                        </span>
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-2.5 text-xs sm:table-cell">
                      <span className={log.action === 'rsvp.submit' && !log.user_id ? 'italic text-muted-foreground' : 'text-foreground'}>
                        {getUserDisplay(log)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    Inga loggar hittades
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Föregående
          </button>
          <span className="text-sm text-muted-foreground">
            Sida {page} av {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Nästa
          </button>
        </div>
      )}
    </div>
  );
}
