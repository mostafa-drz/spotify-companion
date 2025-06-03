import { MusicalNoteIcon } from '@heroicons/react/24/solid';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import React from 'react';

export function RobotIcon(props: React.ComponentProps<'svg'>) {
  // Using CpuChipIcon as a stand-in for a robot icon
  return <CpuChipIcon {...props} />;
}

export function MusicNoteIcon(props: React.ComponentProps<'svg'>) {
  return <MusicalNoteIcon {...props} />;
}
