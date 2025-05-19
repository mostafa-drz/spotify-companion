'use client';

import { useEffect, useState } from 'react';
import { getPlaylistSettings, savePlaylistSettings } from '@/app/actions/playlistSettings';

interface PlaylistSettingsInlineClientProps {
  playlistId: string;
}

const DEFAULT_PROMPT = 'Give me a fun fact about this song.';

export default function PlaylistSettingsInlineClient({ playlistId }: PlaylistSettingsInlineClientProps) {
  const [introsEnabled, setIntrosEnabled] = useState(true);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPlaylistSettings(playlistId)
      .then((settings) => {
        if (settings) {
          setIntrosEnabled(settings.introsEnabled);
          setPrompt(settings.prompt);
        }
      })
      .catch(() => setError('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, [playlistId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await savePlaylistSettings(playlistId, { introsEnabled, prompt });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-4">Loading settings...</div>;
  if (error) return <div className="py-4 text-semantic-error">{error}</div>;

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181818] max-w-xl mb-8">
      <h2 className="text-lg font-semibold mb-2">Playlist Intro Settings</h2>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={introsEnabled}
            onChange={e => setIntrosEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-primary"
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
        />
        <p className="text-xs text-neutral mt-1">This prompt will be used to generate intros for this playlist.</p>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary px-6 py-2 rounded-md disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
      {success && <span className="ml-4 text-semantic-success">Saved!</span>}
    </div>
  );
} 