'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import type { PromptTemplate } from '@/app/types/Prompt';
import { LoadingButton } from './LoadingButton';

interface TemplatePreviewProps {
  template: PromptTemplate;
  onEdit: (template: PromptTemplate) => void;
  onDelete: (template: PromptTemplate) => Promise<void>;
}

export default function TemplatePreview({
  template,
  onEdit,
  onDelete,
}: TemplatePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState<'use' | 'edit' | 'delete' | null>(null);

  const handleAction = async (
    action: 'use' | 'edit' | 'delete',
    callback: (template: PromptTemplate) => void | Promise<void>
  ) => {
    try {
      setIsLoading(action);
      await Promise.resolve(callback(template));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {template.name}
            </h3>
            {template.isSystem && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:bg-primary/20">
                System
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {isExpanded ? template.prompt : `${template.prompt.slice(0, 100)}...`}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
        >
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {!template.isSystem && (
          <>
            <LoadingButton
              variant="secondary"
              size="sm"
              loading={isLoading === 'edit'}
              onClick={() => handleAction('edit', onEdit)}
            >
              Edit
            </LoadingButton>
            <LoadingButton
              variant="danger"
              size="sm"
              loading={isLoading === 'delete'}
              onClick={() => handleAction('delete', onDelete)}
            >
              Delete
            </LoadingButton>
          </>
        )}
      </div>
    </div>
  );
} 