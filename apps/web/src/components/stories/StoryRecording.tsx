import storyAudio from "@/data/story-audio.json";

const RECORDINGS = storyAudio as Record<
  string,
  { bytes: number; seconds: number }
>;

/** True when a narrated recording exists for this story slug. */
export function hasStoryRecording(slug: string): boolean {
  return Object.hasOwn(RECORDINGS, slug);
}

interface StoryRecordingProps {
  slug: string;
}

/**
 * Native audio player for a recorded narration. Renders nothing when no file
 * exists for the slug, so story pages never point at a missing asset. The
 * recording is not fetched until the reader presses play.
 */
export function StoryRecording({ slug }: Readonly<StoryRecordingProps>) {
  if (!hasStoryRecording(slug)) return null;
  const minutes = Math.max(1, Math.round(RECORDINGS[slug].seconds / 60));
  return (
    <div className="space-y-2">
      <p className="type-ui font-medium text-foreground">
        Listen to the recording{" "}
        <span className="font-normal text-muted-foreground">
          (about {minutes} min, AI-narrated)
        </span>
      </p>
      <audio
        controls
        preload="none"
        src={`/audio/stories/${slug}.mp3`}
        className="w-full"
      >
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
