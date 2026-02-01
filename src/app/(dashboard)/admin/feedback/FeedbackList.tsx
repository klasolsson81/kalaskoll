'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/database';

type FeedbackRow = Database['public']['Tables']['feedback']['Row'];

const STATUS_OPTIONS = ['new', 'reviewed', 'in_progress', 'resolved', 'dismissed'] as const;

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'new':
      return 'default' as const;
    case 'reviewed':
      return 'secondary' as const;
    case 'in_progress':
      return 'warning' as const;
    case 'resolved':
      return 'success' as const;
    case 'dismissed':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'new': return 'Ny';
    case 'reviewed': return 'Granskad';
    case 'in_progress': return 'Pågår';
    case 'resolved': return 'Löst';
    case 'dismissed': return 'Avfärdad';
    default: return status;
  }
}

export function FeedbackList() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {
    try {
      const res = await fetch('/api/admin/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: id, status: newStatus }),
      });
      if (res.ok) {
        setFeedback((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)),
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }

  async function handleSaveNotes(id: string) {
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: id, adminNotes: notesValue }),
      });
      if (res.ok) {
        setFeedback((prev) =>
          prev.map((f) => (f.id === id ? { ...f, admin_notes: notesValue } : f)),
        );
        setEditingNotes(null);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
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

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
            <div className="mb-2 h-4 w-48 rounded bg-muted" />
            <div className="h-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Ingen feedback ännu
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedback.map((f) => (
        <div key={f.id} className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={statusBadgeVariant(f.status)}>
              {statusLabel(f.status)}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatTimestamp(f.created_at)}</span>
            <span className="text-xs font-mono text-muted-foreground">{f.user_email ?? 'Anonym'}</span>
          </div>

          <p className="mb-3 whitespace-pre-wrap text-sm">{f.message}</p>

          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Sida: {f.page_url}</span>
            {f.screen_size && <span>Skärm: {f.screen_size}</span>}
            {f.user_agent && (
              <span className="max-w-xs truncate" title={f.user_agent}>
                {f.user_agent.slice(0, 60)}...
              </span>
            )}
          </div>

          {f.screenshot_url && (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.screenshot_url}
                alt="Screenshot"
                className="max-h-48 rounded-lg border"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={f.status}
              onChange={(e) => handleStatusChange(f.id, e.target.value)}
              className="h-8 rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>

            {editingNotes === f.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Admin-anteckning..."
                  className="h-8 flex-1 rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={() => handleSaveNotes(f.id)}
                  className="rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground"
                >
                  Spara
                </button>
                <button
                  onClick={() => setEditingNotes(null)}
                  className="rounded-lg px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  Avbryt
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingNotes(f.id); setNotesValue(f.admin_notes ?? ''); }}
                className="rounded-lg px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                {f.admin_notes ? `Anteckning: ${f.admin_notes}` : 'Lägg till anteckning'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
