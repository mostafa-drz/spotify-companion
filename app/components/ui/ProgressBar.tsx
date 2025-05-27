import { useEffect, useRef, useState } from 'react';
import { cn } from '@/app/lib/utils';

interface ProgressBarProps {
  value?: number; // starting value (ms)
  max?: number;   // duration (ms)
  showLabel?: boolean;
  className?: string;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
}

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  showLabel = false,
  className,
  audioRef,
  isPlaying
}: ProgressBarProps) {
  const [progress, setProgress] = useState(value);
  const [duration, setDuration] = useState(max);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // For audio element progress (intro audio)
  useEffect(() => {
    if (!audioRef || !audioRef.current) return;
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime * 1000); // ms
      setDuration((audio.duration || max) * 1000); // ms
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    // Set initial values
    setProgress(audio.currentTime * 1000);
    setDuration((audio.duration || max) * 1000);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audioRef, max]);

  // For generic progress (e.g., Spotify player)
  useEffect(() => {
    if (audioRef) return; // skip if using audioRef
    setProgress(value);
    setDuration(max);
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (!isPlaying || prev >= max) return prev;
        return Math.min(prev + 500, max); // update every 500ms
      });
    }, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [audioRef, isPlaying, value, max]);

  // Reset progress if value or max changes (e.g., on track change)
  useEffect(() => {
    if (!audioRef) {
      setProgress(value);
      setDuration(max);
    }
  }, [value, max, audioRef]);

  const percentage = Math.min(100, Math.max(0, (progress / duration) * 100));
  
  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-[#1DB954] transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={duration}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-sm text-neutral text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
} 