'use client';

import { useState } from 'react';
import { PromptTemplate } from '@/app/types/Prompt';
import { usePlaylistSettings } from '@/app/hooks/usePlaylistSettings';

interface PromptSelectorProps {
  playlistId: string;
  templates: PromptTemplate[];
  onPromptSaved?: () => void;
}

export default function PromptSelector({ playlistId, templates, onPromptSaved }: PromptSelectorProps) {
  const { settings, saving, saveSettings } = usePlaylistSettings(playlistId);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = async (template: PromptTemplate) => {
    setSelectedTemplate(template.id);
    await saveSettings({
      introsEnabled: settings?.introsEnabled ?? true,
      prompt: template.template
    });
    onPromptSaved?.();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            disabled={saving}
            className={`p-4 rounded-lg border text-left transition-colors ${
              selectedTemplate === template.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
            }`}
            aria-label={`Select ${template.title} prompt template`}
          >
            <h4 className="font-medium mb-1">{template.title}</h4>
            <p className="text-sm text-neutral">{template.description}</p>
          </button>
        ))}
      </div>
      {saving && (
        <div className="text-sm text-neutral" role="status" aria-label="Saving prompt">
          Saving prompt...
        </div>
      )}
    </div>
  );
} 