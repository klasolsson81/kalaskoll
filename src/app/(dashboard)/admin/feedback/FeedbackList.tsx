'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Trash2, X, Check } from 'lucide-react';
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

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Förstora skärmbild"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Stäng"
      >
        <X className="h-6 w-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Skärmbild (förstoring)"
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function FeedbackList() {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

  function showSaved(id: string) {
    setSavedId(id);
    setTimeout(() => setSavedId(null), 1500);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setActionLoading(id);
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
        showSaved(id);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSaveNotes(id: string) {
    setActionLoading(id);
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
        showSaved(id);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Radera denna feedback permanent?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/feedback?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFeedback((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    } finally {
      setActionLoading(null);
    }
  }

  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

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
    <>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />}
      <div className="space-y-3">
        {feedback.map((f) => (
          <div key={f.id} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={statusBadgeVariant(f.status)}>
                {statusLabel(f.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatTimestamp(f.created_at)}</span>
              <span className="font-mono text-xs text-muted-foreground">{f.user_email ?? 'Anonym'}</span>
              {savedId === f.id && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <Check className="h-3 w-3" /> Sparat
                </span>
              )}
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
                <button
                  onClick={() => setLightboxSrc(f.screenshot_url)}
                  className="group relative cursor-zoom-in overflow-hidden rounded-lg border transition-shadow hover:shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.screenshot_url}
                    alt="Skärmbild"
                    className="max-h-48 object-contain transition-transform group-hover:scale-[1.02]"
                  />
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Klicka för att förstora
                  </span>
                </button>
              </div>
            )}

            {f.admin_notes && editingNotes !== f.id && (
              <div className="mb-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium">Anteckning:</span> {f.admin_notes}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Status:</label>
              <select
                value={f.status}
                onChange={(e) => handleStatusChange(f.id, e.target.value)}
                disabled={actionLoading === f.id}
                className="h-8 rounded-lg border bg-background px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNotes(f.id); }}
                    placeholder="Admin-anteckning..."
                    className="h-8 flex-1 rounded-lg border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveNotes(f.id)}
                    disabled={actionLoading === f.id}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Spara
                  </button>
                  <button
                    onClick={() => setEditingNotes(null)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                  >
                    Avbryt
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingNotes(f.id); setNotesValue(f.admin_notes ?? ''); }}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                >
                  {f.admin_notes ? 'Redigera anteckning' : 'Lägg till anteckning'}
                </button>
              )}

              <button
                onClick={() => handleDelete(f.id)}
                disabled={actionLoading === f.id}
                className="ml-auto rounded-lg border border-destructive/30 p-1.5 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                title="Radera feedback"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
