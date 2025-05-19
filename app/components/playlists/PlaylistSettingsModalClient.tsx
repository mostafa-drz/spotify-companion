'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PlaylistSettings from './PlaylistSettings';
import { getPromptTemplates } from '@/app/actions/prompts';
import type { PromptTemplate } from '@/app/types/Prompt';

interface PlaylistSettingsModalClientProps {
  playlistId: string;
  playlistName: string;
}

const Modal = dynamic(() => import('@/app/components/ui/Modal'), { ssr: false });

export default function PlaylistSettingsModalClient({ playlistId, playlistName }: PlaylistSettingsModalClientProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);

  const openModal = useCallback(async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const data = await getPromptTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load prompt templates.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <button
        type="button"
        className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open playlist settings"
        onClick={openModal}
      >
        <svg className="w-6 h-6 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className="min-w-[320px] max-w-lg">
            <h2 className="text-xl font-bold mb-4">Playlist Settings</h2>
            {loading && <div className="py-8 text-center">Loading...</div>}
            {error && <div className="py-8 text-center text-semantic-error">{error}</div>}
            {!loading && !error && (
              <PlaylistSettings
                playlistId={playlistId}
                playlistName={playlistName}
                templates={templates}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
} 