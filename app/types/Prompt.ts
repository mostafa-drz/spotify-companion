export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  userId?: string;
  isSystem?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPrompt {
  id: string;
  userId: string;
  playlistId: string;
  templateId?: string;
  customPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptMetadata {
  trackId: string;
  promptId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error?: string;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PromptStatus = 'pending' | 'generating' | 'completed' | 'failed';

// New types for Dotprompt integration
export interface IntroPromptInput {
  trackDetailsJSON: string;
  userAreaOfInterest: string;
  language: string;
  tone: string;
  length: string;
}

export interface IntroPromptOutput {
  markdown: string;
  ssml: string;
  duration: number;
}

export interface IntroPromptConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
}

export interface IntroPrompt {
  model: string;
  config: IntroPromptConfig;
  input: {
    schema: IntroPromptInput;
    default: {
      tone: string;
      length: number;
    };
  };
  output: {
    schema: IntroPromptOutput;
  };
}

export interface UserPromptSettings {
  defaultPrompt: string | null;
  templates: PromptTemplate[];
}

// Update TrackIntro to include prompt
export interface TrackIntro {
  trackId: string;
  userId: string;
  introText: string;
  markdown: string;
  ssml: string;
  audioUrl: string;
  duration: number;
  language: string;
  tone: string;
  length: number;
  prompt: string;
  createdAt?: string;
  updatedAt?: string;
} 