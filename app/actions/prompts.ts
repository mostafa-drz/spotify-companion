'use server';

import { adminDb } from '@/app/lib/firebase-admin';
import { verifyAuth } from '@/app/lib/firebase-admin';
import { PromptTemplate, UserPrompt, PromptMetadata } from '@/app/types/Prompt';
import { AuthError } from '@/app/lib/AuthError';

const PROMPT_TEMPLATES_COLLECTION = 'promptTemplates';
const USER_PROMPTS_COLLECTION = 'userPrompts';
const PROMPT_METADATA_COLLECTION = 'promptMetadata';

// Get all prompt templates
export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  try {
    const snapshot = await adminDb
      .collection(PROMPT_TEMPLATES_COLLECTION)
      .orderBy('isDefault', 'desc')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromptTemplate));
  } catch (error) {
    console.error('Error fetching prompt templates:', error);
    throw new AuthError('Failed to fetch prompt templates', 'FETCH_TEMPLATES_FAILED');
  }
}

// Save user prompt for a playlist
export async function saveUserPrompt(
  playlistId: string,
  templateId?: string,
  customPrompt?: string
): Promise<UserPrompt> {
  try {
    const userId = await verifyAuth();

    if (!templateId && !customPrompt) {
      throw new AuthError('Either templateId or customPrompt must be provided', 'INVALID_PROMPT');
    }

    const userPrompt: Omit<UserPrompt, 'id'> = {
      userId,
      playlistId,
      templateId,
      customPrompt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection(USER_PROMPTS_COLLECTION).add(userPrompt);

    return {
      id: docRef.id,
      ...userPrompt
    };
  } catch (error) {
    console.error('Error saving user prompt:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Failed to save user prompt', 'SAVE_PROMPT_FAILED');
  }
}

// Get user prompt for a playlist
export async function getUserPrompt(playlistId: string): Promise<UserPrompt | null> {
  try {
    const userId = await verifyAuth();

    const snapshot = await adminDb
      .collection(USER_PROMPTS_COLLECTION)
      .where('userId', '==', userId)
      .where('playlistId', '==', playlistId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as UserPrompt;
  } catch (error) {
    console.error('Error fetching user prompt:', error);
    throw new AuthError('Failed to fetch user prompt', 'FETCH_PROMPT_FAILED');
  }
}

// Save prompt metadata for a track
export async function savePromptMetadata(
  trackId: string,
  promptId: string,
  status: PromptMetadata['status'],
  error?: string,
  audioUrl?: string
): Promise<PromptMetadata> {
  try {
    const userId = await verifyAuth();

    const metadata: Omit<PromptMetadata, 'id'> = {
      trackId,
      promptId,
      status,
      error,
      audioUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection(PROMPT_METADATA_COLLECTION).add(metadata);

    return {
      id: docRef.id,
      ...metadata
    };
  } catch (error) {
    console.error('Error saving prompt metadata:', error);
    throw new AuthError('Failed to save prompt metadata', 'SAVE_METADATA_FAILED');
  }
} 