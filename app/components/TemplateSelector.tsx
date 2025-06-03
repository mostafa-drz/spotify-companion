'use client';

import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, Cog6ToothIcon } from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';
import { useUserTemplates } from '@/app/lib/hooks/useUserTemplates';
import type { PromptTemplate } from '@/app/types/Prompt';
import TemplateManagementModal from './TemplateManagementModal';

export interface TemplateSelectorProps {
  onSelect: (template: PromptTemplate) => void;
  selectedTemplate?: PromptTemplate;
  introCounts?: Record<string, number>;
  onCreateNew?: () => void;
  templates?: PromptTemplate[]; // Optional - if not provided, will fetch from DB
}

export default function TemplateSelector({
  onSelect,
  selectedTemplate,
  introCounts = {},
  onCreateNew,
  templates: providedTemplates,
}: TemplateSelectorProps) {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use SWR hook if templates are not provided
  const {
    templates,
    isLoading,
    error,
    mutate
  } = useUserTemplates(!providedTemplates && session?.user?.id ? session.user.id : undefined);

  // Add a default option
  const allTemplates = [
    ...(providedTemplates || templates),
  ];

  if(!selectedTemplate && allTemplates.length > 0) {
    onSelect(allTemplates[0]);
  }

  if (!providedTemplates && isLoading) {
    return (
      <div className="flex items-center gap-2 text-neutral">
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        <span>Loading templates...</span>
      </div>
    );
  }

  if (!providedTemplates && error) {
    return <div className="text-semantic-error">{error.message || 'Failed to load templates'}</div>;
  }

  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-foreground mb-1" id="template-label">
        Select Template
      </label>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Listbox
            value={selectedTemplate?.id || ''}
            onChange={id => {
              const template = allTemplates.find(t => t.id === id);
              if (template) onSelect(template);
            }}
          >
            <Listbox.Label className="sr-only" id="template-label">
              Select Template
            </Listbox.Label>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm" aria-labelledby="template-label">
                <span className="block truncate">
                  {selectedTemplate?.name || 'Default Template'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {allTemplates.map((template) => (
                    <Listbox.Option
                      key={template.id || 'default'}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${
                          active ? 'bg-primary/10 text-primary' : 'text-foreground'
                        }`
                      }
                      value={template.id}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate font-medium ${selected ? 'text-primary' : ''} flex items-center`}>
                            {template.name}
                            {introCounts[template.id] ? (
                              <span className="ml-2 inline-block align-middle">
                                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" title="Intro available" />
                              </span>
                            ) : null}
                          </span>
                          {template.prompt && (
                            <span className="block text-xs text-neutral mt-0.5 truncate">
                              {template.prompt.length > 80
                                ? template.prompt.slice(0, 80) + '...'
                                : template.prompt}
                            </span>
                          )}
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                  {onCreateNew && (
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  )}
                  {onCreateNew && (
                    <Listbox.Option
                      key="create-new"
                      value="__create_new__"
                      disabled
                      className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-primary/80 hover:text-primary/100"
                    >
                      <span className="block font-medium">+ Create New Template</span>
                    </Listbox.Option>
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        <button
          type="button"
          aria-label="Manage templates"
          title="Manage templates"
          className="ml-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 h-[42px] mt-0.5"
          tabIndex={0}
          onClick={() => setIsModalOpen(true)}
          style={{ alignSelf: 'flex-start' }}
        >
          <Cog6ToothIcon className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium text-sm">Manage Templates</span>
        </button>
      </div>
      {isModalOpen && session?.user?.id && (
        <TemplateManagementModal
          templates={providedTemplates || templates}
          onClose={() => setIsModalOpen(false)}
          userId={session.user.id}
          onTemplatesChange={mutate}
          selectedTemplateId={selectedTemplate?.id}
        />
      )}
    </div>
  );
} 