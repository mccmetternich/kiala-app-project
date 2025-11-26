'use client';

import AudioPlayer from '@/components/AudioPlayer';
import { AudioPlayerBlock as AudioPlayerBlockType } from '@/types/blocks';

interface AudioPlayerBlockProps {
  block: AudioPlayerBlockType;
}

export default function AudioPlayerBlock({ block }: AudioPlayerBlockProps) {
  const { settings } = block;

  return (
    <div className="flex justify-center">
      <AudioPlayer
        audioUrl={settings.audioUrl}
        title={settings.title}
        subtitle={settings.subtitle}
        showWaveform={settings.showWaveform}
        className="max-w-2xl w-full"
      />
    </div>
  );
}