export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-confetti-dots opacity-70" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
