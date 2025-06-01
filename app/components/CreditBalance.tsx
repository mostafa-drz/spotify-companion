'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getUserCredits, hasLowCredits } from '@/app/actions/credits';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CreditBalanceProps {
  showWarning?: boolean;
  className?: string;
}

export default function CreditBalance({ showWarning = true, className = '' }: CreditBalanceProps) {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<{ available: number; used: number } | null>(null);
  const [isLow, setIsLow] = useState(false);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!session?.user?.id) return;
      try {
        const creditData = await getUserCredits(session.user.id);
        setCredits(creditData);
        if (showWarning) {
          const lowCredits = await hasLowCredits(session.user.id);
          setIsLow(lowCredits);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    fetchCredits();
    // Refresh credits every minute
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, [session?.user?.id, showWarning]);

  if (!credits) return null;

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