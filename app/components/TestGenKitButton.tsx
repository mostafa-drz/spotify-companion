'use client';

import { useSession } from 'next-auth/react';
import { testHelloFlow } from '@/app/actions/genkit';
import Button from './ui/Button';
import { useState } from 'react';

export default function TestGenKitButton() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  if (!session) {
    return null;
  }

  const handleClick = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await testHelloFlow(session.user?.name || 'Anonymous');
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="primary"
      >
        {isLoading ? 'Testing...' : 'Test GenKit Flow'}
      </Button>
      {result && (
        <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.success ? 'Successfully called helloFlow!' : result.error}
        </p>
      )}
    </div>
  );
} 