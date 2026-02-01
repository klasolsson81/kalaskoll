'use client';

import { useEffect, useState } from 'react';
import { Users, PartyPopper, MessageSquare, Image, Smartphone, ClipboardList, UserCheck } from 'lucide-react';

interface Stats {
  users: {
    total: number;
    testers: number;
    admins: number;
    regular: number;
    verified: number;
    unverified: number;
    active: number;
  };
  parties: number;
  rsvpResponses: number;
  feedback: {
    total: number;
    byStatus: Record<string, number>;
  };
  waitlist: number;
  aiImagesUsed: number;
  smsUsed: number;
}

export function AdminStatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
            <div className="mb-2 h-4 w-20 rounded bg-muted" />
            <div className="h-8 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: 'Användare', value: stats.users.total, sub: `${stats.users.active} aktiva`, icon: Users },
    { label: 'Testare', value: stats.users.testers, sub: `${stats.users.admins} admins`, icon: UserCheck },
    { label: 'Kalas', value: stats.parties, icon: PartyPopper },
    { label: 'OSA-svar', value: stats.rsvpResponses, icon: ClipboardList },
    { label: 'Feedback', value: stats.feedback.total, sub: `${stats.feedback.byStatus.new ?? 0} nya`, icon: MessageSquare },
    { label: 'Väntlista', value: stats.waitlist, icon: Users },
    { label: 'AI-bilder', value: stats.aiImagesUsed, icon: Image },
    { label: 'SMS skickade', value: stats.smsUsed, icon: Smartphone },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border bg-card p-4">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <card.icon className="h-3.5 w-3.5" />
            {card.label}
          </div>
          <div className="text-2xl font-bold">{card.value}</div>
          {card.sub && <div className="text-xs text-muted-foreground">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
