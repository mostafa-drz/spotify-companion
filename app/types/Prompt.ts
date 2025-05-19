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