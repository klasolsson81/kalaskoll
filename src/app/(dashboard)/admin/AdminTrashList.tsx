'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, RotateCcw, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeletedParty {
  id: string;
  childName: string;
  childAge: number;
  partyDate: string;
  deletedAt: string;
  ownerName: string | null;
  ownerEmail: string | null;
}

type SortKey = 'childName' | 'partyDate' | 'deletedAt' | 'ownerName';
type SortDir = 'asc' | 'desc';

export function AdminTrashList() {
  const [parties, setParties] = useState<DeletedParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('deletedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    fetchDeletedParties();
  }, []);

  async function fetchDeletedParties() {
    try {
      const res = await fetch('/api/admin/deleted-parties');
      if (res.ok) {
        const data = await res.json();
        setParties(data.parties);
      }
    } catch (err) {
      console.error('Failed to fetch deleted parties:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search) return parties;
    const q = search.toLowerCase();
    return parties.filter(
      (p) =>
        p.childName?.toLowerCase().includes(q) ||
        p.ownerName?.toLowerCase().includes(q) ||
        p.ownerEmail?.toLowerCase().includes(q),
    );
  }, [parties, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'childName':
        case 'ownerName':
          cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '', 'sv');
          break;
        case 'partyDate':
        case 'deletedAt':
          cmp = (a[sortKey] ?? '') < (b[sortKey] ?? '') ? -1 : (a[sortKey] ?? '') > (b[sortKey] ?? '') ? 1 : 0;
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
      setSortDir(key === 'deletedAt' || key === 'partyDate' ? 'desc' : 'asc');
      return key;
    });
  }, []);

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3" />
      : <ArrowDown className="ml-1 inline h-3 w-3" />;
  }

  async function handleRestore(partyId: string, childName: string) {
    if (!confirm(`Återställ "${childName}s kalas"?`)) return;
    setActionLoading(partyId);
    try {
      const res = await fetch(`/api/admin/deleted-parties/${partyId}/restore`, {
        method: 'POST',
      });
      if (res.ok) {
        setParties((prev) => prev.filter((p) => p.id !== partyId));
      }
    } catch (err) {
      console.error('Failed to restore party:', err);
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

  function formatShortDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function daysUntilHardDelete(deletedAt: string) {
    const deleted = new Date(deletedAt);
    const hardDelete = new Date(deleted);
    hardDelete.setDate(hardDelete.getDate() + 30);
    const now = new Date();
    const days = Math.ceil((hardDelete.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (parties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Trash2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">Papperskorgen är tom</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Raderade kalas visas här i 30 dagar innan de tas bort permanent
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Sök på kalasnamn, ägare eller e-post..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {filtered.length} av {parties.length} raderade kalas
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="cursor-pointer select-none px-3 py-2 font-medium hover:bg-muted/80" onClick={() => toggleSort('childName')}>
                Kalas<SortIcon column="childName" />
              </th>
              <th className="cursor-pointer select-none px-3 py-2 font-medium hover:bg-muted/80" onClick={() => toggleSort('ownerName')}>
                Ägare<SortIcon column="ownerName" />
              </th>
              <th className="hidden cursor-pointer select-none px-3 py-2 font-medium sm:table-cell hover:bg-muted/80" onClick={() => toggleSort('partyDate')}>
                Kalasdatum<SortIcon column="partyDate" />
              </th>
              <th className="cursor-pointer select-none px-3 py-2 font-medium hover:bg-muted/80" onClick={() => toggleSort('deletedAt')}>
                Raderat<SortIcon column="deletedAt" />
              </th>
              <th className="px-3 py-2 font-medium">Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((party) => {
              const daysLeft = daysUntilHardDelete(party.deletedAt);
              return (
                <tr key={party.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <div>
                      <span className="font-medium">{party.childName}s kalas</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">({party.childAge} år)</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-sm">{party.ownerName ?? '—'}</div>
                      <div className="font-mono text-xs text-muted-foreground">{party.ownerEmail ?? '—'}</div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2 sm:table-cell">{formatShortDate(party.partyDate)}</td>
                  <td className="px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-sm">{formatDate(party.deletedAt)}</div>
                      <Badge variant={daysLeft <= 7 ? 'warning' : 'outline'} className="text-[10px]">
                        {daysLeft} dagar kvar
                      </Badge>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleRestore(party.id, party.childName)}
                      disabled={actionLoading === party.id}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                      title="Återställ kalas"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Återställ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
