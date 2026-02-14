export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-gradient">
      <div className="mx-auto w-full max-w-md px-4" role="status" aria-label="Laddar inbjudan">
        <div className="rounded-2xl border bg-card p-6 shadow-lg">
          {/* Header skeleton */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="h-6 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
          </div>

          {/* Image skeleton */}
          <div className="mb-6 aspect-[3/4] w-full animate-pulse rounded-xl bg-muted" />

          {/* Details skeleton */}
          <div className="mb-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
          </div>

          {/* Button skeleton */}
          <div className="flex gap-3">
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-muted" />
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>

        {/* Loading indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Laddar inbjudan...</p>
        </div>
      </div>
    </div>
  );
}
