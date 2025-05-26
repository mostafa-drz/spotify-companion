'use client';
import TemplateList from '@/app/components/TemplateList';
import TemplateForm from '@/app/components/TemplateForm';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import type { PromptTemplate } from '@/app/types/Prompt';

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | undefined>();

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditingTemplate(undefined);
  };

  const handleEditClick = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setIsCreating(false);
  };

  const handleFormCancel = () => {
    setIsCreating(false);
    setEditingTemplate(undefined);
  };

  const handleFormSuccess = () => {
    setIsCreating(false);
    setEditingTemplate(undefined);
  };

  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Templates</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to manage your templates.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Templates</h1>
        {!isCreating && !editingTemplate && (
          <button
            onClick={handleCreateClick}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Template
          </button>
        )}
      </div>

      {(isCreating || editingTemplate) ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h2>
          <TemplateForm
            template={editingTemplate}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <TemplateList onEdit={handleEditClick} />
      )}
    </div>
  );
} 