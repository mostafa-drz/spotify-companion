export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  tone?: 'casual' | 'academic' | 'storytelling' | 'conversational' | 'professional';
  length?: number;
}

export interface IntroPromptOutput {
  markdown: string;
  ssml: string;
  duration: number;
  error?: string;
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