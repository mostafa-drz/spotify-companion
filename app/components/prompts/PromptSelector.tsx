'use client';

import { useState } from 'react';
import { PromptTemplate } from '@/app/types/Prompt';
import { saveUserPrompt } from '@/app/actions/prompts';

interface PromptSelectorProps {
  playlistId: string;
  templates: PromptTemplate[];
  onPromptSaved?: () => void;
}

export default function PromptSelector({ 
  playlistId, 
  templates,
  onPromptSaved 
}: PromptSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await saveUserPrompt(
        playlistId,
        selectedTemplate || undefined,
        customPrompt || undefined
      );
      onPromptSaved?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Choose a Prompt Template</h3>
        <div className="grid gap-4">
          {templates.map((template) => (
            <label
              key={template.id}
              className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors
                ${selectedTemplate === template.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'}`}
            >
              <input
                type="radio"
                name="template"
                value={template.id}
                checked={selectedTemplate === template.id}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="mt-1"
              />
              <div className="ml-3">
                <p className="font-medium text-foreground">{template.title}</p>
                <p className="text-sm text-foreground-secondary mt-1">
                  {template.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Or Create Custom Prompt</h3>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Enter your custom prompt..."
          className="w-full h-32 p-3 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-semantic-error/10 border border-semantic-error">
          <p className="text-sm text-semantic-error">{error}</p>
        </div>
      )}

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isLoading || (!selectedTemplate && !customPrompt)}
        className="btn-primary w-full"
      >
        {isLoading ? 'Saving...' : 'Save Prompt'}
      </button>
    </div>
  );
} 