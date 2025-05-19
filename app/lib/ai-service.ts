import { AIRequest, AIResponse, AIGenerationError, AIGenerationResult } from '@/app/types/AI';
import { PromptTemplate } from '@/app/types/Prompt';
import { adminDb } from './firebase-admin';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class AIService {
  private static instance: AIService;
  private cache: Map<string, AIResponse>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private formatPrompt(template: string, metadata: AIRequest['trackMetadata'], playlistName?: string): string {
    let formattedPrompt = template
      .replace('{trackName}', metadata.name)
      .replace('{artists}', metadata.artists.join(', '))
      .replace('{album}', metadata.album)
      .replace('{releaseDate}', metadata.releaseDate || 'unknown')
      .replace('{genres}', metadata.genres?.join(', ') || 'unknown');

    // Add playlist context if available
    if (playlistName) {
      formattedPrompt = formattedPrompt.replace('{playlistName}', playlistName);
    }

    return formattedPrompt;
  }

  private async generateWithRetry(
    request: AIRequest,
    attempt: number = 1
  ): Promise<AIGenerationResult> {
    try {
      // TODO: Replace with actual Vertex AI call
      // This is a mock implementation
      const response: AIResponse = {
        text: `This is a mock intro for ${request.trackMetadata.name} by ${request.trackMetadata.artists.join(', ')} in playlist ${request.playlistName || request.playlistId}.`,
        duration: 60,
        tokens: 100,
        model: 'gemini-pro'
      };

      return {
        success: true,
        data: response,
        metadata: {
          trackId: request.trackMetadata.id,
          promptId: request.customPrompt || 'template',
          playlistId: request.playlistId,
          timestamp: new Date(),
          attempt
        }
      };
    } catch (error) {
      const aiError: AIGenerationError = {
        code: 'UNKNOWN',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        retryable: attempt < MAX_RETRIES
      };

      if (aiError.retryable) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        return this.generateWithRetry(request, attempt + 1);
      }

      return {
        success: false,
        error: aiError,
        metadata: {
          trackId: request.trackMetadata.id,
          promptId: request.customPrompt || 'template',
          playlistId: request.playlistId,
          timestamp: new Date(),
          attempt
        }
      };
    }
  }

  public async generateIntro(
    trackMetadata: AIRequest['trackMetadata'],
    promptTemplate: PromptTemplate | string,
    playlistId: string,
    playlistName?: string
  ): Promise<AIGenerationResult> {
    // Create cache key that includes playlist context
    const cacheKey = `${playlistId}-${trackMetadata.id}-${typeof promptTemplate === 'string' ? promptTemplate : promptTemplate.id}`;
    
    // Check cache first
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) {
      return {
        success: true,
        data: cachedResponse,
        metadata: {
          trackId: trackMetadata.id,
          promptId: typeof promptTemplate === 'string' ? promptTemplate : promptTemplate.id,
          playlistId,
          timestamp: new Date(),
          attempt: 0
        }
      };
    }

    const template = typeof promptTemplate === 'string' 
      ? promptTemplate 
      : promptTemplate.template;

    const request: AIRequest = {
      trackMetadata,
      promptTemplate: this.formatPrompt(template, trackMetadata, playlistName),
      playlistId,
      playlistName
    };

    const result = await this.generateWithRetry(request);

    // Cache successful results
    if (result.success && result.data) {
      this.cache.set(cacheKey, result.data);
    }

    return result;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public async logGeneration(result: AIGenerationResult): Promise<void> {
    try {
      await adminDb.collection('aiGenerations').add({
        ...result,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging AI generation:', error);
    }
  }
} 