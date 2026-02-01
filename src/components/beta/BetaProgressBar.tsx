interface BetaProgressBarProps {
  current: number;
  max: number;
}

export function BetaProgressBar({ current, max }: BetaProgressBarProps) {
  const percent = Math.min(100, Math.round((current / max) * 100));

  const getBarColor = () => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-sm font-medium whitespace-nowrap">
        {current}/{max}
      </span>
    </div>
  );
}
