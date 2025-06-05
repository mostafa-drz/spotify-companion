import Modal from './ui/Modal';
import type { PromptTemplate } from '@/app/types/Prompt';
import { useState } from 'react';
import { useUserTemplates } from '@/app/lib/hooks/useUserTemplates';
import { useAddUserTemplate } from '@/app/lib/hooks/useAddUserTemplate';
import { useUpdateUserTemplate } from '@/app/lib/hooks/useUpdateUserTemplate';
import { useDeleteUserTemplate } from '@/app/lib/hooks/useDeleteUserTemplate';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TemplateManagementModalProps {
  templates: PromptTemplate[];
  onClose: () => void;
  onTemplatesChange: () => void;
  initialEditing?: PromptTemplate;
}

const EXAMPLE_PROMPTS = [
  'Share a fun fact about this track or its artist.',
  'Describe the mood and style of this song.',
  'Explain the meaning behind the lyrics.',
  'Tell me about the genre and its history.',
];

export default function TemplateManagementModal({
  templates,
  onClose,
  onTemplatesChange,
  initialEditing,
}: TemplateManagementModalProps) {
  const { mutate: mutateTemplates } = useUserTemplates();
  const { addTemplate } = useAddUserTemplate();
  const { updateTemplate } = useUpdateUserTemplate();
  const { deleteTemplate } = useDeleteUserTemplate();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(!!initialEditing);
  const [editing, setEditing] = useState<PromptTemplate | null>(
    initialEditing || null
  );
  const [form, setForm] = useState({
    name: initialEditing?.name || '',
    prompt: initialEditing?.prompt || '',
    tone: initialEditing?.tone || '',
    length: initialEditing?.length?.toString() || '',
    language: initialEditing?.language || '',
  });
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
      language: template.language || '',
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      <div className="max-w-xl w-full p-8 rounded-lg bg-neutral-900 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Manage Templates</h2>
        <div className="text-neutral mb-6">
          Create, edit, or delete your intro templates here.
        </div>
        {actionError && (
          <div className="text-red-600 text-sm mb-2">{actionError}</div>
        )}
        <button
          className="w-full py-3 mb-6 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
          onClick={openCreate}
        >
          + New Template
        </button>
        <hr className="mb-6 border-neutral-700" />
        {/* Create/Edit Form */}
        {formOpen ? (
          <form
            onSubmit={handleFormSubmit}
            className="mb-6 bg-neutral-800 rounded-xl p-8 border border-gray-700 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">
              {editing ? 'Edit Template' : 'New Template'}
            </h3>
            <hr className="mb-6 border-neutral-700" />
            <div className="mb-4">
              <label
                htmlFor="template-name"
                className="block text-sm font-semibold mb-1 text-neutral-200"
              >
                Name
              </label>
              <input
                id="template-name"
                name="name"
                type="text"
                className="w-full rounded border border-gray-600 px-3 py-2 text-base bg-neutral-900 text-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none shadow-sm"
                placeholder="e.g. Historical Facts"
                value={form.name}
                onChange={handleFormChange}
                disabled={saving}
                maxLength={40}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="template-prompt"
                className="block text-sm font-semibold mb-1 text-neutral-200"
              >
                Prompt
              </label>
              <textarea
                id="template-prompt"
                name="prompt"
                className="w-full rounded border border-gray-600 px-3 py-2 text-base bg-neutral-900 text-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none shadow-sm"
                placeholder="e.g. Tell me about the historical context of this track."
                value={form.prompt}
                onChange={handleFormChange}
                rows={3}
                maxLength={200}
                disabled={saving}
                required
              />
              <div className="mt-3 bg-neutral-900 border border-neutral-700 rounded p-3">
                <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
                  <span role="img" aria-label="lightbulb">
                    💡
                  </span>{' '}
                  Examples:
                </div>
                <ul className="text-xs text-neutral-400 space-y-0.5">
                  {EXAMPLE_PROMPTS.map((ex, i) => (
                    <li key={i} className="pl-2">
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Advanced Section Toggle */}
            <div className="mb-4">
              <button
                type="button"
                className="text-green-500 underline text-sm font-medium hover:text-green-400 focus:outline-none"
                onClick={() => setShowAdvanced((v) => !v)}
                tabIndex={0}
              >
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              </button>
            </div>
            {showAdvanced && (
              <>
                <hr className="my-4 border-neutral-700" />
                <div className="mb-4">
                  <label
                    htmlFor="template-tone"
                    className="block text-sm font-semibold mb-1 text-neutral-200"
                  >
                    Tone
                  </label>
                  <input
                    id="template-tone"
                    name="tone"
                    type="text"
                    className="w-full rounded border border-gray-600 px-3 py-2 text-base bg-neutral-900 text-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none shadow-sm"
                    placeholder="e.g. Conversational, Formal, Playful"
                    value={form.tone}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="template-length"
                    className="block text-sm font-semibold mb-1 text-neutral-200"
                  >
                    Length (seconds)
                  </label>
                  <input
                    id="template-length"
                    name="length"
                    type="number"
                    min={10}
                    max={300}
                    className="w-full rounded border border-gray-600 px-3 py-2 text-base bg-neutral-900 text-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none shadow-sm"
                    placeholder="e.g. 60"
                    value={form.length}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="template-language"
                    className="block text-sm font-semibold mb-1 text-neutral-200"
                  >
                    Language
                  </label>
                  <input
                    id="template-language"
                    name="language"
                    type="text"
                    className="w-full rounded border border-gray-600 px-3 py-2 text-base bg-neutral-900 text-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none shadow-sm"
                    placeholder="e.g. en, es, fr"
                    value={form.language}
                    onChange={handleFormChange}
                    disabled={saving}
                  />
                </div>
              </>
            )}
            {formError && (
              <div className="text-red-600 text-sm mb-4 mt-2 p-2 rounded bg-red-100 dark:bg-red-900">
                {formError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editing
                    ? 'Save Changes'
                    : 'Create Template'}
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center text-neutral-400 py-8">
                <div className="text-lg font-semibold mb-2">
                  No templates yet
                </div>
                <div className="mb-4">
                  Create your first intro template to get started.
                </div>
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                  onClick={openCreate}
                >
                  + New Template
                </button>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded bg-neutral-800 flex w-full min-w-0 justify-between items-center hover:bg-neutral-700 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base mb-1 text-white truncate">
                      {template.name}
                    </div>
                    <div className="text-xs text-neutral-400 max-w-xs truncate">
                      {template.prompt}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    <button
                      aria-label="Edit"
                      title="Edit"
                      className="p-2 rounded hover:bg-neutral-600 focus:bg-neutral-600 transition-colors"
                      onClick={() => openEdit(template)}
                    >
                      <PencilSquareIcon className="w-5 h-5 text-green-400" />
                    </button>
                    <button
                      aria-label="Delete"
                      title="Delete"
                      className="p-2 rounded hover:bg-neutral-600 focus:bg-neutral-600 transition-colors"
                      onClick={() => setDeleteId(template.id)}
                    >
                      <TrashIcon className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {/* Delete confirmation dialog */}
      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <h3 className="text-lg font-semibold mb-2">Delete Template?</h3>
          <div className="mb-4 text-neutral">
            Are you sure you want to delete this template? This action cannot be
            undone.
          </div>
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
