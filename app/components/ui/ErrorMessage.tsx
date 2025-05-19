import { cn } from '@/app/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function ErrorMessage({
  title = 'Error',
  message,
  action,
  className
}: ErrorMessageProps) {
  return (
    <div className={cn(
      'p-4 rounded-lg bg-semantic-error/10 border border-semantic-error',
      className
    )}>
      <h3 className="text-lg font-semibold text-semantic-error mb-2">
        {title}
      </h3>
      <p className="text-neutral mb-4">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-semantic-error hover:text-semantic-error/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
} 