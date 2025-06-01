'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function LowCreditBanner() {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-2">
      <div className="flex items-start gap-2">
        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <p>Running low on credits? Email <a href="mailto:hi@mostafa.xyz" className="underline hover:text-yellow-900 dark:hover:text-yellow-100">hi@mostafa.xyz</a> to get more.</p>
        </div>
      </div>
    </div>
  );
} 