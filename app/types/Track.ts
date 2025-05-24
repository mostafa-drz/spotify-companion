export interface TrackMetadata {
  id: string;
  userId?: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  playlistId?: string | null;
  createdAt: Date;
  updatedAt: Date;
} 