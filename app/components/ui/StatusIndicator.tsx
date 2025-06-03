import { cn } from '@/app/lib/utils';

type Status = 'idle' | 'processing' | 'success' | 'error';

interface StatusIndicatorProps {
  status: Status;
  message: string;
  className?: string;
}

export default function StatusIndicator({
  status,
  message,
  className,
}: StatusIndicatorProps) {
  const statusStyles = {
    idle: 'text-neutral',
    processing: 'text-[#1DB954]',
    success: 'text-semantic-success',
    error: 'text-semantic-error',
  };

  const statusIcons = {
    idle: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    processing: (
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ),
    success: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-2',
        statusStyles[status],
        className
      )}
    >
      {statusIcons[status]}
      <span className="text-sm">{message}</span>
    </div>
  );
}
