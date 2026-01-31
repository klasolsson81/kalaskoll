export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 gradient-warm" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/8 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
