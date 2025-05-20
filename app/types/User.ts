import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
    playlists: {
        id: string;
        name: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        tracks: {
            id: string;
            name: string;
            artists: string[];
            album: string;
            introScript?: string;
            introAudioUrl?: string;
        }[];
    }[];
} 