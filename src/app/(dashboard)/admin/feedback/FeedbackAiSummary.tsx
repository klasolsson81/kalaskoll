'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Bug, Lightbulb, Palette, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SummaryItem {
  summary: string;
  severity?: string;
  feedbackIds: number[];
}

interface Summary {
  totalAnalyzed: number;
  categories: {
    bugs?: { count: number; items: SummaryItem[] };
    featureRequests?: { count: number; items: SummaryItem[] };
    uxIssues?: { count: number; items: SummaryItem[] };
    praise?: { count: number; items: SummaryItem[] };
  };
  claudePrompt: string | null;
}

function SeverityBadge({ severity }: { severity?: string }) {
  if (!severity) return null;
  switch (severity) {
    case 'high':
      return <Badge variant="destructive">Hög</Badge>;
    case 'medium':
      return <Badge variant="warning">Medel</Badge>;
    case 'low':
      return <Badge variant="outline">Låg</Badge>;
    default:
      return null;
  }
}

function CategorySection({
  title,
  icon: Icon,
  items,
  showSeverity = false,
}: {
  title: string;
  icon: React.ElementType;
  items?: { count: number; items: SummaryItem[] };
  showSeverity?: boolean;
}) {
  if (!items || items.count === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{items.count}</Badge>
      </div>
      <ul className="space-y-2">
        {items.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-muted-foreground">•</span>
            <div>
              {showSeverity && <SeverityBadge severity={item.severity} />}{' '}
              {item.summary}
              <span className="ml-2 text-xs text-muted-foreground">
                [{item.feedbackIds.join(', ')}]
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeedbackAiSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/feedback/summarize', { method: 'POST' });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setSummary(data.summary);
    } catch {
      setError('Kunde inte generera sammanfattning. Kontrollera att OPENAI_API_KEY är satt.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyPrompt() {
    if (!summary?.claudePrompt) return;
    await navigator.clipboard.writeText(summary.claudePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? 'Analyserar feedback...' : 'Generera AI-sammanfattning'}
      </button>

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {summary && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {summary.totalAnalyzed} feedbackposter analyserade
          </div>

          {summary.totalAnalyzed === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
              Ingen ny eller granskad feedback att analysera
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <CategorySection
                  title="Buggar"
                  icon={Bug}
                  items={summary.categories.bugs}
                  showSeverity
                />
                <CategorySection
                  title="Funktionsförfrågningar"
                  icon={Lightbulb}
                  items={summary.categories.featureRequests}
                />
                <CategorySection
                  title="UX/Design"
                  icon={Palette}
                  items={summary.categories.uxIssues}
                />
                <CategorySection
                  title="Beröm"
                  icon={Heart}
                  items={summary.categories.praise}
                />
              </div>

              {summary.claudePrompt && (
                <div className="rounded-xl border bg-muted/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Claude Code Prompt</h3>
                    <button
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Kopierad!' : 'Kopiera'}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs">{summary.claudePrompt}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
