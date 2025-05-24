'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TemplateSelector from '@/app/components/TemplateSelector';
import TemplatePreview from '@/app/components/TemplatePreview';
import TemplateForm from '@/app/components/TemplateForm';
import { usePromptTemplates } from '@/app/hooks/usePromptTemplates';
import type { PromptTemplate } from '@/app/types/Prompt';

export default function TemplatesPage() {
  const router = useRouter();
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate, setDefaultPrompt } = usePromptTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateTemplate = async (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTemplate(template);
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating template:', error);
      // You might want to show an error notification here
    }
  };

  const handleUpdateTemplate = async (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedTemplate) return;

    try {
      await updateTemplate(selectedTemplate.id, template);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating template:', error);
      // You might want to show an error notification here
    }
  };

  const handleDeleteTemplate = async (template: PromptTemplate) => {
    try {
      await deleteTemplate(template.id);
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(undefined);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      // You might want to show an error notification here
    }
  };

  const handleUseTemplate = async (template: PromptTemplate) => {
    try {
      await setDefaultPrompt(template.prompt);
      router.push('/playing'); // Navigate back to the playing page
    } catch (error) {
      console.error('Error setting default prompt:', error);
      // You might want to show an error notification here
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-48"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400">
        Error loading templates: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Template Management
        </h1>
        <TemplateSelector
          onSelect={setSelectedTemplate}
          selectedTemplate={selectedTemplate}
          onCreateNew={() => setIsCreating(true)}
        />
      </div>

      {isCreating && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Create New Template
          </h2>
          <TemplateForm
            onSubmit={handleCreateTemplate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {isEditing && selectedTemplate && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Edit Template
          </h2>
          <TemplateForm
            template={selectedTemplate}
            onSubmit={handleUpdateTemplate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}

      {selectedTemplate && !isEditing && (
        <div className="mb-8">
          <TemplatePreview
            template={selectedTemplate}
            onUseTemplate={handleUseTemplate}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDeleteTemplate}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(template => (
          <div
            key={template.id}
            className={`cursor-pointer ${
              selectedTemplate?.id === template.id
                ? 'ring-2 ring-indigo-500'
                : ''
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <TemplatePreview
              template={template}
              onUseTemplate={handleUseTemplate}
              onEdit={() => {
                setSelectedTemplate(template);
                setIsEditing(true);
              }}
              onDelete={handleDeleteTemplate}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 