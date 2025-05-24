'use client';

import { useState, useEffect } from 'react';
import { adminDb } from '@/app/lib/firebase-admin';
import { TemplateSkeleton } from './TemplateSkeleton';
import TemplatePreview from './TemplatePreview';
import { usePromptTemplates } from '@/app/hooks/usePromptTemplates';
import type { PromptTemplate } from '@/app/types/Prompt';
import toast from 'react-hot-toast';

async function getSystemTemplates(): Promise<PromptTemplate[]> {
  const templates = await adminDb
    .collection('promptTemplates')
    .where('isSystem', '==', true)
    .get();
  return templates.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    prompt: doc.data().prompt,
    isSystem: true,
    createdAt: doc.data().createdAt,
    updatedAt: doc.data().updatedAt
  }));
}

export default function TemplateList() {
  const { templates: userTemplates, loading, error, deleteTemplate, setDefaultPrompt } = usePromptTemplates();
  const [systemTemplates, setSystemTemplates] = useState<PromptTemplate[]>([]);

  useEffect(() => {
    getSystemTemplates().then(setSystemTemplates);
  }, []);

  const handleUseTemplate = async (template: PromptTemplate) => {
    try {
      await setDefaultPrompt(template.id);
      toast.success('Default template set successfully');
    } catch {
      toast.error('Failed to set default template');
    }
  };

  const handleEditTemplate = async () => {
    // TODO: Implement edit functionality
    toast.error('Edit functionality not implemented yet');
  };

  const handleDeleteTemplate = async (template: PromptTemplate) => {
    try {
      await deleteTemplate(template.id);
      toast.success('Template deleted successfully');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  if (loading) {
    return <TemplateSkeleton count={5} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Templates */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          System Templates
        </h2>
        <div className="space-y-4">
          {systemTemplates.map(template => (
            <TemplatePreview
              key={template.id}
              template={template}
              onUseTemplate={handleUseTemplate}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      </div>

      {/* User Templates */}
      {userTemplates.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Templates
          </h2>
          <div className="space-y-4">
            {userTemplates.map(template => (
              <TemplatePreview
                key={template.id}
                template={template}
                onUseTemplate={handleUseTemplate}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 