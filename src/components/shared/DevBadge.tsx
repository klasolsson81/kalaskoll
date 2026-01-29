export function DevBadge() {
  if (process.env.NODE_ENV === 'production') return null;
  if (process.env.NEXT_PUBLIC_MOCK_AI !== 'true') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">
      MOCK MODE
    </div>
  );
}
