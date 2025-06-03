import useSWRMutation from 'swr/mutation';
import { generateIntroText, generateIntroAudio } from '@/app/actions/ai';
import { Tone } from '@/app/types/Prompt';
import { SpotifyTrack } from '@/app/types/Spotify';
import { useSession } from 'next-auth/react';

interface GenerateIntroParams {
  trackId: string;
  track: SpotifyTrack;
  templateId: string;
  templateName: string;
  templatePrompt: string;
  language?: string;
  tone?: Tone;
  length?: number;
}

export function useGenerateIntro() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    'generate-intro',
    async (_key, { arg }: { arg: GenerateIntroParams }) => {
      if (!userId) throw new Error('User not authenticated');
      const intro = await generateIntroText(
        userId,
        arg.trackId,
        arg.track,
        arg.templateId,
        arg.templateName,
        arg.templatePrompt,
        arg.language || 'en',
        arg.tone || Tone.Conversational,
        arg.length || 60
      );

      const audioUrl = await generateIntroAudio(userId, arg.trackId, arg.templateId, intro.markdown);

      return { ...intro, audioUrl };
    }
  );
  return {
    generateIntro: trigger,
    data,
    error,
    isLoading: isMutating,
    reset,
  };
} 