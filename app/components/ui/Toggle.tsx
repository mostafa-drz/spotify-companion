import { cn } from '@/app/lib/utils';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className
}: ToggleProps) {
  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] focus-visible:ring-offset-2',
          checked ? 'bg-[#1DB954]' : 'bg-gray-200 dark:bg-gray-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        {description && (
          <p className="text-sm text-neutral">
            {description}
          </p>
        )}
      </div>
    </div>
  );
} 