import { cn } from '@/app/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  showLabel = false,
  className 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-[#1DB954] transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm text-neutral text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
} 