import { UserPromptSettings } from "./Prompt";

export interface User extends UserPromptSettings {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  updatedAt: string;
  availableCredits: number;
  usedCredits: number;
}

export enum UserTransaction {
  GENERATE_TRACK_INTRO = 'GENERATE_TRACK_INTRO',
}