export interface TrackMetadata {
  id: string;
  name: string;
  artists: string[];
  album?: string;
  duration: number;
  releaseDate?: string;
  genres?: string[];
  popularity?: number;
  playlistId?: string | null;
  createdAt: string;
  updatedAt: string;
} 