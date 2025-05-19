import { cn } from '@/app/lib/utils';
import Button from './Button';

interface RetryStateProps {
  message: string;
  onRetry: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function RetryState({
  message,
  onRetry,
  isLoading = false,
  className
}: RetryStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-6 space-y-4 text-center',
      className
    )}>
      <p className="text-neutral">
        {message}
      </p>
      <Button
        onClick={onRetry}
        disabled={isLoading}
        variant="primary"
        size="md"
      >
        {isLoading ? 'Retrying...' : 'Try Again'}
      </Button>
    </div>
  );
} 