export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Laddar kalas...</p>
      </div>

      <div className="space-y-4">
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />

        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="aspect-[3/4] w-full max-w-sm mx-auto animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
