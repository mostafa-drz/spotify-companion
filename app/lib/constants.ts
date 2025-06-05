import type { PromptTemplate } from '@/app/types/Prompt';

export const INITIAL_CREDITS = 5; // Demo credits for new users
export const LOW_CREDIT_THRESHOLD = 2; // Warning threshold for low credits

export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'about-artist',
    name: 'About the Artist',
    prompt:
      'Provide a brief, engaging background about the artist of this track, focusing on their musical journey and notable achievements.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-story',
    name: 'Track Story',
    prompt:
      'Share the story or inspiration behind this track, including any interesting facts about its creation or meaning.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'genre-context',
    name: 'Genre & Context',
    prompt:
      'Explain the genre of this track and its cultural or historical significance, including how it fits into the broader musical landscape.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
];
