'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SpotifyError } from '@/app/lib/spotify';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;
      const isSpotifyError = error instanceof SpotifyError;

      return (
        <div className="p-4 rounded-lg bg-semantic-error/10 border border-semantic-error">
          <h2 className="text-lg font-semibold text-semantic-error mb-2">
            {isSpotifyError ? 'Spotify Error' : 'Something went wrong'}
          </h2>
          <p className="text-neutral mb-4">
            {error?.message || 'An unexpected error occurred'}
          </p>
          {isSpotifyError && error.status && (
            <p className="text-sm text-neutral">
              Status: {error.status}
              {error.code && ` (${error.code})`}
            </p>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-semantic-error text-white rounded-lg hover:bg-semantic-error/90 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 