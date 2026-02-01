export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Decorative confetti-dots overlay */}
      <div className="pointer-events-none absolute inset-0 bg-confetti-dots opacity-50" />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
