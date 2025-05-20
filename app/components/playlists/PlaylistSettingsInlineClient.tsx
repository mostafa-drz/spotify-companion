'use client';

import { useState, useEffect } from 'react';
import { usePlaylistSettings } from '@/app/hooks/usePlaylistSettings';

interface PlaylistSettingsInlineClientProps {
  playlistId: string;
}

const DEFAULT_PROMPT = 'Give me a fun fact about this song.';

export default function PlaylistSettingsInlineClient({ playlistId }: PlaylistSettingsInlineClientProps) {
  const { settings, loading, error, saving, success, saveSettings } = usePlaylistSettings(playlistId);
  const [introsEnabled, setIntrosEnabled] = useState(true);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      setIntrosEnabled(settings.introsEnabled);
      setPrompt(settings.prompt);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveSettings({ introsEnabled, prompt });
    } catch (err) {
      // Error is handled by the hook
      console.error('Failed to save settings:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-4" role="status" aria-label="Loading playlist settings">
        Loading settings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-semantic-error" role="alert" aria-label="Error loading settings">
        {error}
      </div>
    );
  }

  return (
    <div 
      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181818] max-w-xl mb-8"
      role="region"
      aria-label="Playlist intro settings"
    >
      <h2 className="text-lg font-semibold mb-2">Playlist Intro Settings</h2>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={introsEnabled}
            onChange={e => setIntrosEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-primary"
            aria-label="Enable intros for this playlist"
          />
          <span>Enable Intros</span>
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="prompt-input">
          Intro Prompt
        </label>
        <input
          id="prompt-input"
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Enter prompt for generating intros"
          placeholder={DEFAULT_PROMPT}
        />
        <p className="text-xs text-neutral mt-1">
          This prompt will be used to generate intros for this playlist.
        </p>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary px-6 py-2 rounded-md disabled:opacity-60"
        aria-label={saving ? 'Saving settings...' : 'Save settings'}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
      {success && (
        <span 
          className="ml-4 text-semantic-success"
          role="status"
          aria-label="Settings saved successfully"
        >
          Saved!
        </span>
      )}
    </div>
  );
} 