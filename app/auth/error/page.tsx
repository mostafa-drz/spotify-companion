'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold text-red-600">
          Authentication Error
        </h1>

        <p className="mt-3 text-2xl">
          {error || 'An error occurred during authentication'}
        </p>

        <div className="mt-8">
          <a
            href="/auth/signin"
            className="rounded-md bg-gray-600 px-6 py-3 text-white hover:bg-gray-700"
          >
            Try Again
          </a>
        </div>
      </main>
    </div>
  );
} 