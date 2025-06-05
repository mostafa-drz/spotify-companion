import { Switch } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface AIIntroToggleProps {
  introsEnabled: boolean;
  setIntrosEnabled: (enabled: boolean) => void;
  isLowCredits?: boolean;
}

export default function AIIntroToggle({
  introsEnabled,
  setIntrosEnabled,
  isLowCredits = false,
}: AIIntroToggleProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3">
        <Switch.Group>
          <Switch
            checked={introsEnabled}
            onChange={setIntrosEnabled}
            aria-label="Enable AI Intros for Now Playing"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
              introsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow ${
                introsEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
              aria-hidden="true"
            />
          </Switch>
          <Switch.Label className="ml-4 text-base font-medium text-foreground cursor-pointer select-none transition-colors duration-200">
            Enable AI Intros for Now Playing
          </Switch.Label>
        </Switch.Group>
        {isLowCredits && (
          <span className="ml-2 flex items-center text-yellow-600 text-xs">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            Low credits
          </span>
        )}
      </div>
      <p className="text-sm text-neutral ml-14">
        {introsEnabled
          ? 'AI will generate and play an intro before each track'
          : 'Tracks will play normally without AI intros'}
      </p>
    </div>
  );
}
