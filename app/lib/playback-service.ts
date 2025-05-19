import { PlaybackState, TrackPlayback, PlaybackError, PlaybackEvent, PlaybackAnalytics } from '../types/Playback';
import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

class PlaybackService {
  private audio: HTMLAudioElement | null = null;
  private introAudio: HTMLAudioElement | null = null;
  private currentTrack: TrackPlayback | null = null;
  private analytics: PlaybackAnalytics | null = null;
  private eventListeners: Map<string, Set<(event: PlaybackEvent) => void>> = new Map();

  constructor() {
    // Initialize event listeners map
    ['play', 'pause', 'seek', 'volume', 'rate', 'end', 'error'].forEach(eventType => {
      this.eventListeners.set(eventType, new Set());
    });
  }

  async loadTrack(track: TrackPlayback): Promise<void> {
    try {
      // Clean up existing audio elements
      this.cleanup();

      // Create new audio elements
      this.audio = new Audio(track.trackUrl);
      if (track.hasIntro && track.introUrl) {
        this.introAudio = new Audio(track.introUrl);
      }

      // Set up event listeners
      this.setupEventListeners();

      // Initialize analytics
      this.analytics = {
        trackId: track.trackId,
        playlistId: track.playlistId,
        introPlayed: false,
        introSkipped: false,
        introDuration: track.introDuration,
        trackDuration: track.trackDuration,
        totalPlayTime: 0,
        events: []
      };

      this.currentTrack = track;
    } catch (error) {
      console.error('Error loading track:', error);
      throw this.createError('LOAD_FAILED', 'Failed to load track');
    }
  }

  private setupEventListeners(): void {
    if (!this.audio || !this.introAudio) return;

    // Track audio events
    this.audio.addEventListener('timeupdate', () => {
      this.emitEvent('seek', { 
        currentTime: this.audio?.currentTime,
        playlistId: this.currentTrack?.playlistId
      });
    });

    this.audio.addEventListener('volumechange', () => {
      this.emitEvent('volume', { 
        volume: this.audio?.volume,
        playlistId: this.currentTrack?.playlistId
      });
    });

    this.audio.addEventListener('ratechange', () => {
      this.emitEvent('rate', { 
        rate: this.audio?.playbackRate,
        playlistId: this.currentTrack?.playlistId
      });
    });

    this.audio.addEventListener('ended', () => {
      this.emitEvent('end', { 
        type: 'track',
        playlistId: this.currentTrack?.playlistId
      });
    });

    // Intro audio events
    this.introAudio.addEventListener('ended', () => {
      this.emitEvent('end', { 
        type: 'intro',
        playlistId: this.currentTrack?.playlistId
      });
      if (this.audio) {
        this.audio.play().catch(error => {
          console.error('Error playing track after intro:', error);
          this.emitEvent('error', { 
            error,
            playlistId: this.currentTrack?.playlistId
          });
        });
      }
    });
  }

  async play(): Promise<void> {
    try {
      if (!this.currentTrack || !this.audio) {
        throw this.createError('PLAYBACK_FAILED', 'No track loaded');
      }

      if (this.currentTrack.hasIntro && this.introAudio) {
        await this.introAudio.play();
        this.analytics!.introPlayed = true;
      } else {
        await this.audio.play();
      }

      this.emitEvent('play', { 
        timestamp: Date.now(),
        playlistId: this.currentTrack.playlistId
      });
    } catch (error) {
      console.error('Error playing track:', error);
      throw this.createError('PLAYBACK_FAILED', 'Failed to play track');
    }
  }

  pause(): void {
    if (this.introAudio) {
      this.introAudio.pause();
    }
    if (this.audio) {
      this.audio.pause();
    }
    this.emitEvent('pause', { 
      timestamp: Date.now(),
      playlistId: this.currentTrack?.playlistId
    });
  }

  skipIntro(): void {
    if (this.introAudio) {
      this.introAudio.pause();
      this.introAudio.currentTime = 0;
      this.analytics!.introSkipped = true;
      if (this.audio) {
        this.audio.play().catch(error => {
          console.error('Error playing track after skipping intro:', error);
          this.emitEvent('error', { 
            error,
            playlistId: this.currentTrack?.playlistId
          });
        });
      }
    }
  }

  seek(time: number): void {
    if (this.audio) {
      this.audio.currentTime = time;
      this.emitEvent('seek', { 
        time,
        playlistId: this.currentTrack?.playlistId
      });
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
      this.emitEvent('volume', { 
        volume,
        playlistId: this.currentTrack?.playlistId
      });
    }
  }

  setPlaybackRate(rate: number): void {
    if (this.audio) {
      this.audio.playbackRate = rate;
      this.emitEvent('rate', { 
        rate,
        playlistId: this.currentTrack?.playlistId
      });
    }
  }

  getState(): PlaybackState {
    if (!this.audio) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        playbackRate: 1
      };
    }

    return {
      isPlaying: !this.audio.paused,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration,
      volume: this.audio.volume,
      isMuted: this.audio.muted,
      playbackRate: this.audio.playbackRate
    };
  }

  on(event: string, callback: (event: PlaybackEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(callback);
    }
  }

  off(event: string, callback: (event: PlaybackEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emitEvent(type: PlaybackEvent['type'], data?: unknown): void {
    const event: PlaybackEvent = {
      type,
      timestamp: Date.now(),
      data
    };

    // Add to analytics
    if (this.analytics) {
      this.analytics.events.push(event);
    }

    // Emit to listeners
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  private createError(code: PlaybackError['code'], message: string): PlaybackError {
    return { code, message };
  }

  private cleanup(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    if (this.introAudio) {
      this.introAudio.pause();
      this.introAudio.src = '';
      this.introAudio = null;
    }
  }

  async saveAnalytics(): Promise<void> {
    if (!this.analytics) return;

    try {
      await adminDb.collection('playbackAnalytics').add({
        ...this.analytics,
        timestamp: FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving playback analytics:', error);
    }
  }
}

// Export singleton instance
export const playbackService = new PlaybackService(); 