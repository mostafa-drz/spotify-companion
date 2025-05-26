'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid';
import type { PromptTemplate } from '@/app/types/Prompt';

interface TemplateSelectorProps {
  onSelect: (template: PromptTemplate) => void;
  selectedTemplate?: PromptTemplate;
  onCreateNew?: () => void;
  templates: PromptTemplate[];
}

export default function TemplateSelector({
  onSelect,
  selectedTemplate,
  onCreateNew,
  templates
}: TemplateSelectorProps) {

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
          {selectedTemplate?.name || 'Select Template'}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {/* System Templates */}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              System Templates
            </div>
            {templates
              .filter(t => t.isSystem)
              .map((template) => (
                <Menu.Item key={template.id}>
                  {({ active }) => (
                    <button
                      onClick={() => onSelect(template)}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } ${
                        selectedTemplate?.id === template.id
                          ? 'bg-gray-50 dark:bg-gray-700'
                          : ''
                      } block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200`}
                    >
                      {template.name}
                    </button>
                  )}
                </Menu.Item>
              ))}

            {/* User Templates */}
            {templates.some(t => !t.isSystem) && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Your Templates
                </div>
                {templates
                  .filter(t => !t.isSystem)
                  .map((template) => (
                    <Menu.Item key={template.id}>
                      {({ active }) => (
                        <button
                          onClick={() => onSelect(template)}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } ${
                            selectedTemplate?.id === template.id
                              ? 'bg-gray-50 dark:bg-gray-700'
                              : ''
                          } block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200`}
                        >
                          {template.name}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
              </>
            )}

            {/* Create New Template */}
            {onCreateNew && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onCreateNew}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      <PlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                      Create New Template
                    </button>
                  )}
                </Menu.Item>
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 