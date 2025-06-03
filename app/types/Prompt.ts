export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  isSystem?: boolean;
  createdAt: string;
  updatedAt?: string;
  tone?: string;
  length?: number;
  language?: string;
}

// UserPrompt, PromptMetadata, PromptStatus, IntroPromptConfig, IntroPrompt are not used in the main flow. Remove or comment as future use.

export interface IntroPromptInput {
  trackDetailsJSON: string;
  language: string;
  tone: Tone;
  length: string;
  templatePrompt: string;
}

export interface IntroPromptOutput {
  markdown: string;
  ssml: string;
  duration: number;
}

export interface UserPromptSettings {
  defaultPrompt: string | null;
  templates: PromptTemplate[];
}

// Update TrackIntro to remove userId and standardize timestamps
export interface TrackIntro {
  trackId: string;
  introText: string;
  markdown: string;
  ssml: string;
  audioUrl: string;
  duration: number;
  language: string;
  tone: string;
  length: number;
  prompt: string;
  templateId?: string;  // ID of the template used to generate this intro
  templateName?: string;  // Name of the template for display purposes
  createdAt?: string;
  updatedAt?: string;
} 

export enum Tone {
  Casual = 'casual',
  Academic = 'academic',
  Storytelling = 'storytelling',
  Conversational = 'conversational',
  Professional = 'professional',
}