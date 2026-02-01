'use client';

import { useEffect, useState } from 'react';
import type { Json } from '@/types/database';

interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Json;
  created_at: string;
}

export function AuditLogList() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
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
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatMetadata(meta: Json) {
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return '';
    const entries = Object.entries(meta).slice(0, 3);
    return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
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
          <option value="rsvp.submit">rsvp.submit</option>
          <option value="party.create">party.create</option>
          <option value="account.delete">account.delete</option>
          <option value="admin.user.delete">admin.user.delete</option>
          <option value="admin.user.role_change">admin.user.role_change</option>
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
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Resurs</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">Detaljer</th>
                <th className="hidden px-3 py-2 font-medium lg:table-cell">Användare</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{log.action}</td>
                  <td className="hidden px-3 py-2 sm:table-cell">
                    <span className="text-xs">{log.resource_type}</span>
                    {log.resource_id && (
                      <span className="ml-1 font-mono text-xs text-muted-foreground">
                        {log.resource_id.slice(0, 8)}...
                      </span>
                    )}
                  </td>
                  <td className="hidden max-w-xs truncate px-3 py-2 text-xs text-muted-foreground md:table-cell">
                    {formatMetadata(log.metadata)}
                  </td>
                  <td className="hidden px-3 py-2 font-mono text-xs text-muted-foreground lg:table-cell">
                    {log.user_id ? `${log.user_id.slice(0, 8)}...` : '—'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
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
