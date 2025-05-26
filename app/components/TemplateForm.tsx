'use client';

import { useState } from 'react';
import type { PromptTemplate } from '@/app/types/Prompt';
import { addUserPromptTemplate, updateUserPromptTemplate } from '@/app/lib/firestore';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface TemplateFormProps {
  template?: PromptTemplate;
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function TemplateForm({
  template,
  onSuccess,
  onCancel
}: TemplateFormProps) {
  const { data: session } = useSession();
  const [name, setName] = useState(template?.name || '');
  const [prompt, setPrompt] = useState(template?.prompt || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!session?.user?.id) {
      setError('You must be logged in to manage templates');
      return;
    }

    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!prompt.trim()) {
      setError('Template prompt is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const templateData = {
        name: name.trim(),
        prompt: prompt.trim(),
        isSystem: false
      };

      if (template) {
        // Update existing template
        await updateUserPromptTemplate(session.user.id, template.id, templateData);
        toast.success('Template updated successfully');
      } else {
        // Create new template
        await addUserPromptTemplate(session.user.id, {
          ...templateData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        });
        toast.success('Template created successfully');
      }

      onSuccess?.();
    } catch (err) {
      setError('Failed to save template');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Template Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder="Enter template name"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Template Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm"
          placeholder="Enter template prompt"
          disabled={isSubmitting}
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Use {'{track}'} and {'{artist}'} as placeholders for track and artist names.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
} 