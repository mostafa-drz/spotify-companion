import type { PromptTemplate } from '@/app/types/Prompt';

export const INITIAL_CREDITS = 5; // Demo credits for new users
export const LOW_CREDIT_THRESHOLD = 2; // Warning threshold for low credits

export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'about-artist',
    name: 'About the Artist',
    prompt: 'Give a brief background about the artist of this track.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-story',
    name: 'Track Story',
    prompt: 'Tell the story or inspiration behind this track.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'genre-context',
    name: 'Genre & Context',
    prompt: 'Describe the genre of this track and its cultural or historical context.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
]; 