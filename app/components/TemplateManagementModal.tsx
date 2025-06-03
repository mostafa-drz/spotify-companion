import Modal from './ui/Modal';
import type { PromptTemplate } from '@/app/types/Prompt';
import { useState } from 'react';
import { useUserTemplates } from '@/app/lib/hooks/useUserTemplates';
import { useAddUserTemplate } from '@/app/lib/hooks/useAddUserTemplate';
import { useUpdateUserTemplate } from '@/app/lib/hooks/useUpdateUserTemplate';
import { useDeleteUserTemplate } from '@/app/lib/hooks/useDeleteUserTemplate';

interface TemplateManagementModalProps {
  templates: PromptTemplate[];
  onClose: () => void;
  selectedTemplateId?: string;
  onTemplatesChange: () => void;
}

const EXAMPLE_PROMPTS = [
  'Share a fun fact about this track or its artist.',
  'Describe the mood and style of this song.',
  'Explain the meaning behind the lyrics.',
  'Tell me about the genre and its history.'
];

export default function TemplateManagementModal({ templates, onClose, selectedTemplateId, onTemplatesChange }: TemplateManagementModalProps) {
  const { mutate: mutateTemplates } = useUserTemplates();
  const { addTemplate } = useAddUserTemplate();
  const { updateTemplate } = useUpdateUserTemplate();
  const { deleteTemplate } = useDeleteUserTemplate();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [form, setForm] = useState({ name: '', prompt: '', tone: '', length: '', language: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteTemplate(deleteId);
      setDeleteId(null);
      mutateTemplates();
      onTemplatesChange();
    } catch {
      setActionError('Failed to delete template.');
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', prompt: '', tone: '', length: '', language: '' });
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (template: PromptTemplate) => {
    setEditing(template);
    setForm({
      name: template.name,
      prompt: template.prompt,
      tone: template.tone || '',
      length: template.length?.toString() || '',
      language: template.language || ''
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionError(null);
    if (!form.name.trim()) {
      setFormError('Template name is required.');
      return;
    }
    if (!form.prompt.trim()) {
      setFormError('Prompt is required.');
      return;
    }
    setSaving(true);
    try {
      const templateData = {
        name: form.name,
        prompt: form.prompt,
        tone: form.tone,
        length: form.length ? parseInt(form.length) : undefined,
        language: form.language,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (editing) {
        await updateTemplate({ templateId: editing.id, updates: templateData });
      } else {
        const newTemplate: PromptTemplate = {
          id: Math.random().toString(36).slice(2),
          ...templateData,
        };
        await addTemplate(newTemplate);
      }
      setFormOpen(false);
      setEditing(null);
      setForm({ name: '', prompt: '', tone: '', length: '', language: '' });
      mutateTemplates();
      onTemplatesChange();
    } catch {
      setActionError('Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Manage Templates</h2>
      <div className="text-neutral mb-4">Create, edit, or delete your intro templates here.</div>
      {actionError && <div className="text-red-600 text-sm mb-2">{actionError}</div>}
      {/* Create/Edit Form */}
      {formOpen ? (
        <form onSubmit={handleFormSubmit} className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">{editing ? 'Edit Template' : 'New Template'}</h3>
          <div className="mb-3">
            <label htmlFor="template-name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="template-name"
              name="name"
              type="text"
              className="w-full rounded border px-3 py-2 text-sm bg-white dark:bg-[#181818]"
              placeholder="e.g. Historical Facts"
              value={form.name}
              onChange={handleFormChange}
              disabled={saving}
              maxLength={40}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="template-prompt" className="block text-sm font-medium mb-1">Prompt</label>
            <textarea
              id="template-prompt"
              name="prompt"
              className="w-full rounded border px-3 py-2 text-sm bg-white dark:bg-[#181818]"
              placeholder="e.g. Tell me about the historical context of this track."
              value={form.prompt}
              onChange={handleFormChange}
              rows={3}
              maxLength={200}
              disabled={saving}
              required
            />
            <div className="text-xs text-neutral mt-1">Examples:</div>
            <ul className="text-xs text-neutral mt-1 space-y-0.5">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <li key={i} className="pl-2">• {ex}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="text-sm text-primary mb-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
          {showAdvanced && (
            <>
              <div className="mb-3">
                <label htmlFor="template-tone" className="block text-sm font-medium mb-1">Tone</label>
                <input
                  id="template-tone"
                  name="tone"
                  type="text"
                  className="w-full rounded border px-3 py-2 text-sm bg-white dark:bg-[#181818]"
                  placeholder="e.g. neutral, formal, casual"
                  value={form.tone}
                  onChange={handleFormChange}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="template-length" className="block text-sm font-medium mb-1">Length (seconds)</label>
                <input
                  id="template-length"
                  name="length"
                  type="number"
                  className="w-full rounded border px-3 py-2 text-sm bg-white dark:bg-[#181818]"
                  placeholder="e.g. 30"
                  value={form.length}
                  onChange={handleFormChange}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="template-language" className="block text-sm font-medium mb-1">Language</label>
                <input
                  id="template-language"
                  name="language"
                  type="text"
                  className="w-full rounded border px-3 py-2 text-sm bg-white dark:bg-[#181818]"
                  placeholder="e.g. en-US"
                  value={form.language}
                  onChange={handleFormChange}
                  disabled={saving}
                />
              </div>
            </>
          )}
          {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={saving}
            >
              {saving ? (editing ? 'Saving…' : 'Creating…') : (editing ? 'Save' : 'Create')}
            </button>
            <button
              type="button"
              className="btn flex-1"
              onClick={() => { setFormOpen(false); setEditing(null); setFormError(null); }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          className="btn btn-primary w-full mb-4"
          onClick={openCreate}
        >
          + New Template
        </button>
      )}
      {/* Template List */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700 mb-4">
        {templates.length === 0 && (
          <li className="py-4 text-center text-neutral-500">No templates yet.</li>
        )}
        {templates.map((template) => (
          <li key={template.id} className="py-3 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {selectedTemplateId === template.id && (
                <span aria-current="true" title="Active template">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 20 20"><path d="M7 10.5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              )}
              <div className={`font-semibold truncate ${selectedTemplateId === template.id ? 'text-primary' : 'text-foreground'}`}>{template.name}</div>
              <div className="text-xs text-neutral truncate">{template.prompt}</div>
            </div>
            <div className="flex gap-1">
              <button
                className="p-2 rounded-full hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Edit template ${template.name}`}
                onClick={() => openEdit(template)}
              >
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 20 20"><path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5z" stroke="currentColor" strokeWidth="1.5" /><path d="M14.06 6.44a1.5 1.5 0 0 0 0-2.12l-1.38-1.38a1.5 1.5 0 0 0-2.12 0l-.88.88 3.5 3.5.88-.88z" stroke="currentColor" strokeWidth="1.5" /></svg>
              </button>
              <button
                className="p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Delete template ${template.name}`}
                onClick={() => setDeleteId(template.id)}
              >
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 20 20"><path d="M6 8v6m4-6v6m4-8v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6m2-2h4a2 2 0 0 1 2 2v2H4V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" /></svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/* Delete confirmation dialog */}
      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <h3 className="text-lg font-semibold mb-2">Delete Template?</h3>
          <div className="mb-4 text-neutral">Are you sure you want to delete this template? This action cannot be undone.</div>
          <div className="flex gap-2">
            <button
              className="btn btn-danger flex-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
            <button
              className="btn flex-1"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
} 