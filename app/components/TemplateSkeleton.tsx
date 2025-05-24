import { cn } from '@/app/lib/utils';

interface TemplateSkeletonProps {
  count?: number;
  className?: string;
}

export function TemplateSkeleton({ count = 3, className }: TemplateSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100 to-transparent dark:via-gray-800" />
          
          {/* Template name skeleton */}
          <div className="mb-2 h-6 w-3/4 rounded-md bg-gray-200 dark:bg-gray-800" />
          
          {/* Template prompt skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-5/6 rounded-md bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-4/6 rounded-md bg-gray-200 dark:bg-gray-800" />
          </div>
          
          {/* Action buttons skeleton */}
          <div className="mt-4 flex items-center justify-end space-x-2">
            <div className="h-8 w-20 rounded-md bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-20 rounded-md bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
} 