import type { PromptTemplate } from '@/app/types/Prompt';

export const INITIAL_CREDITS = 10; // Demo credits for new users
export const LOW_CREDIT_THRESHOLD = 2; // Warning threshold for low credits

export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'artist-background',
    name: 'Artist Background',
    prompt:
      'Provide a brief, engaging background on the artist—highlighting their musical journey, influences, and major achievements relevant to this track.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track-meaning',
    name: 'Track Meaning & Story',
    prompt:
      'Explore the meaning or story behind this track. Include known inspiration, themes, or speculate thoughtfully based on lyrics and style.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'genre-explainer',
    name: 'Genre & Style Explainer',
    prompt:
      'Explain the genre of this track, key musical traits, and how it fits into the broader cultural or historical context of that style.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'musical-elements',
    name: 'Musical Highlights',
    prompt:
      'Break down key musical elements—such as instrumentation, rhythm, structure, or production—that make this track stand out.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
];
