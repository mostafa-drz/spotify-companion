import { cn } from '@/app/lib/utils';
import Spinner from './Spinner';
import ProgressBar from './ProgressBar';

interface LoadingStateProps {
  type: 'spinner' | 'progress';
  progress?: number;
  message?: string;
  className?: string;
}

export default function LoadingState({ 
  type, 
  progress = 0,
  message,
  className 
}: LoadingStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-4 space-y-4',
      className
    )}>
      {type === 'spinner' ? (
        <Spinner size="lg" />
      ) : (
        <ProgressBar value={progress} showLabel />
      )}
      {message && (
        <p className="text-sm text-neutral text-center">
          {message}
        </p>
      )}
    </div>
  );
} 