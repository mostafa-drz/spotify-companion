'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { testHelloFlow } from '@/app/actions/genkit';

export default function TestGenKitButton() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const result = await testHelloFlow('test');
      setResult(result);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to call helloFlow' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="btn-primary"
      >
        {isLoading ? 'Loading...' : 'Test GenKit'}
      </button>
      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.success ? 'Success!' : result.error}
          </p>
        </div>
      )}
    </div>
  );
} 