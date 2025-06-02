'use client';

import { useSession } from 'next-auth/react';
import { useUserCredits } from '@/app/lib/hooks/useUserCredits';
import { useLowCredits } from '@/app/lib/hooks/useLowCredits';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CreditBalanceProps {
  showWarning?: boolean;
  className?: string;
}

export default function CreditBalance({ showWarning = true, className = '' }: CreditBalanceProps) {
  const { data: session } = useSession();
  const { credits, isLoading } = useUserCredits(session?.user?.id);
  const { isLow } = useLowCredits(session?.user?.id);

  if (isLoading) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium">
        {credits.available} credits
      </span>
      {showWarning && isLow && (
        <ExclamationTriangleIcon 
          className="w-4 h-4 text-yellow-500" 
          title="Low credits remaining"
        />
      )}
    </div>
  );
} 