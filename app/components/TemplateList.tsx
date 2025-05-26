'use client';

import TemplatePreview from './TemplatePreview';
import type { PromptTemplate } from '@/app/types/Prompt';
import toast from 'react-hot-toast';
import { deleteUserPromptTemplate, getUserPromptTemplates } from '@/app/lib/firestore';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface TemplateListProps {
  onEdit: (template: PromptTemplate) => void;
}

export default function TemplateList({ onEdit }: TemplateListProps) {
  const { data: session } = useSession();
  const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const templates = await getUserPromptTemplates(session.user.id);
        setUserTemplates(templates);
      } catch {
        setError('Failed to load templates');
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, [session?.user?.id]);

  const handleDeleteTemplate = async (template: PromptTemplate) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to delete templates');
      return;
    }

    try {
      await deleteUserPromptTemplate(session.user.id, template.id);
      setUserTemplates(prev => prev.filter(t => t.id !== template.id));
      toast.success('Template deleted successfully');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center p-4">
        {error}
      </div>
    );
  }

  if (userTemplates.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600 dark:text-gray-400">
        <p>No templates found. Create your first template to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Your Templates
        </h2>
        <div className="space-y-4">
          {userTemplates.map(template => (
            <TemplatePreview
              key={template.id}
              template={template}
              onEdit={() => onEdit(template)}
              onDelete={() => handleDeleteTemplate(template)}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 