
export interface SongDetails {
  title: string;
  artist: string;
  lyrics: string;
  lyricsSourceUrls: string[] | null; // Added for search grounding
}

export interface SongInputFormProps {
  songDetails: SongDetails;
  onSongDetailsChange: (details: SongDetails) => void;
  onSubmit: () => void; // This will now be for storyboard submission
  isLoading: boolean; // For storyboard generation
  isLookingUpLyrics: boolean; // Renamed from isGeneratingLyrics
  onLookupLyrics: () => void; // Renamed from onGenerateLyrics
}

export interface VideoGenerationConfig {
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface StoryboardDisplayProps {
  storyboard: string;
  // Video generation props
  overallVideoPrompt: string;
  onGenerateOverallVideo: (prompt: string, config: VideoGenerationConfig) => Promise<void>;
  isGeneratingOverallVideo: boolean;
  overallVideoUrl: string | null;
  overallVideoError: string | null;

  customVideoPrompt: string;
  onCustomVideoPromptChange: (prompt: string) => void;
  onGenerateCustomVideo: (prompt: string, config: VideoGenerationConfig) => Promise<void>;
  isGeneratingCustomVideo: boolean;
  customVideoUrl: string | null;
  customVideoError: string | null;

  videoAspectRatio: '16:9' | '9:16';
  onVideoAspectRatioChange: (ratio: '16:9' | '9:16') => void;
}
