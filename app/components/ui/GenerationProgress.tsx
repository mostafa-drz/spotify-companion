import { cn } from '@/app/lib/utils';
import ProgressBar from './ProgressBar';
import StatusIndicator from './StatusIndicator';

interface GenerationProgressProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  className?: string;
}

export default function GenerationProgress({
  status,
  progress,
  message,
  className
}: GenerationProgressProps) {
  return (
    <div className={cn(
      'space-y-3 p-4 rounded-lg bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800',
      className
    )}>
      <StatusIndicator status={status} message={message} />
      {status === 'processing' && (
        <ProgressBar value={progress} showLabel />
      )}
    </div>
  );
} 