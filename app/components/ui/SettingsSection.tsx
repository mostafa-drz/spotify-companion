import { cn } from '@/app/lib/utils';
import { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  'aria-label'?: string;
}

export default function SettingsSection({
  title,
  description,
  children,
  className,
  isExpanded = true,
  onToggle,
  'aria-label': ariaLabel
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'space-y-4 p-4 rounded-lg bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800',
        className
      )}
      aria-label={ariaLabel}
    >
      <div 
        className={cn(
          'space-y-1',
          onToggle && 'cursor-pointer'
        )}
        onClick={onToggle}
        role={onToggle ? 'button' : undefined}
        tabIndex={onToggle ? 0 : undefined}
        onKeyDown={onToggle ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        } : undefined}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          {onToggle && (
            <button
              type="button"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
            >
              <svg
                className={cn(
                  'w-5 h-5 text-neutral transition-transform',
                  !isExpanded && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
        {description && (
          <p className="text-sm text-neutral">
            {description}
          </p>
        )}
      </div>
      {isExpanded && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </section>
  );
} 