'use client';

import { useState } from 'react';
import { usePlaylistSettings } from '@/app/hooks/usePlaylistSettings';
import SettingsSection from '../ui/SettingsSection';
import Toggle from '../ui/Toggle';
import PromptSelector from '../prompts/PromptSelector';
import { PromptTemplate } from '@/app/types/Prompt';

interface PlaylistSettingsProps {
  playlistId: string;
  playlistName: string;
  templates: PromptTemplate[];
  onPromptSaved?: () => void;
}

export default function PlaylistSettings({
  playlistId,
  playlistName,
  templates,
  onPromptSaved
}: PlaylistSettingsProps) {
  const { settings, loading, error, saving, saveSettings } = usePlaylistSettings(playlistId);
  const [expandedSections, setExpandedSections] = useState({
    intro: true,
    prompt: true,
    audio: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleIntroToggle = async (enabled: boolean) => {
    await saveSettings({ 
      introsEnabled: enabled,
      prompt: settings?.prompt || 'Give me a fun fact about this song.'
    });
  };

  if (loading) {
    return (
      <div className="p-4 text-neutral" role="status" aria-label="Loading playlist settings">
        Loading settings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-semantic-error" role="alert" aria-label="Error loading settings">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header - Responsive text sizes */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground break-words">
            {playlistName}
          </h2>
          <p className="text-sm text-neutral mt-1">
            Configure intro settings for this playlist
          </p>
        </div>

        {/* Settings Grid - Responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Intro and Audio Settings */}
          <div className="space-y-4 sm:space-y-6">
            <SettingsSection
              title="Intro Settings"
              description="Configure how intros work for this playlist"
              className="sm:p-6 h-full"
              isExpanded={expandedSections.intro}
              onToggle={() => toggleSection('intro')}
              aria-label="Intro settings section"
            >
              <Toggle
                label="Enable Intros"
                description="Generate and play educational intros before each track"
                checked={settings?.introsEnabled ?? true}
                onChange={handleIntroToggle}
                className="py-2 sm:py-3"
                aria-label="Enable educational intros"
                disabled={saving}
              />
            </SettingsSection>

            <SettingsSection
              title="Audio Settings"
              description="Configure audio quality and playback settings"
              className="sm:p-6 h-full"
              isExpanded={expandedSections.audio}
              onToggle={() => toggleSection('audio')}
              aria-label="Audio settings section"
            >
              <div className="space-y-4 sm:space-y-6">
                <Toggle
                  label="High Quality Audio"
                  description="Generate intros in higher quality (uses more storage)"
                  checked={true}
                  onChange={() => {}}
                  className="py-2 sm:py-3"
                  aria-label="Enable high quality audio"
                />
                <Toggle
                  label="Auto-play Next Track"
                  description="Automatically play the next track after intro"
                  checked={true}
                  onChange={() => {}}
                  className="py-2 sm:py-3"
                  aria-label="Enable auto-play next track"
                />
              </div>
            </SettingsSection>
          </div>

          {/* Right Column - Prompt Settings */}
          <div className="space-y-4 sm:space-y-6">
            <SettingsSection
              title="Prompt Settings"
              description="Choose how intros are generated for this playlist"
              className="sm:p-6 h-full"
              isExpanded={expandedSections.prompt}
              onToggle={() => toggleSection('prompt')}
              aria-label="Prompt settings section"
            >
              <div className="mt-2">
                <PromptSelector
                  playlistId={playlistId}
                  templates={templates}
                  onPromptSaved={onPromptSaved}
                />
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>

      {/* Playback Controls Sidebar - Desktop Only */}
      <div className="hidden lg:block w-80 space-y-4">
        <div className="sticky top-6">
          <SettingsSection
            title="Playback Controls"
            description="Keyboard shortcuts and playback options"
            className="p-6"
            aria-label="Playback controls section"
          >
            <div className="space-y-4">
              <div className="text-sm">
                <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                <ul className="space-y-2 text-neutral" role="list">
                  <li>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">Space</kbd>
                    <span className="ml-2">Play/Pause</span>
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">→</kbd>
                    <span className="ml-2">Next Track</span>
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">←</kbd>
                    <span className="ml-2">Previous Track</span>
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">S</kbd>
                    <span className="ml-2">Skip Intro</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-medium mb-2">Playback Options</h4>
                <Toggle
                  label="Auto-play Intros"
                  description="Automatically play intros when available"
                  checked={true}
                  onChange={() => {}}
                  className="py-2"
                  aria-label="Enable auto-play intros"
                />
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
} 