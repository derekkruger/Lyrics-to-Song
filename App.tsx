

import React, { useState, useCallback, useEffect } from 'react';
import { SongDetails, VideoGenerationConfig } from './types';
import SongInputForm from './components/SongInputForm';
import StoryboardDisplay from './components/StoryboardDisplay';
import { generateStoryboard, lookupLyrics, generateVideo } from './services/geminiService'; // Changed generateLyrics to lookupLyrics

function App() {
  const [songDetails, setSongDetails] = useState<SongDetails>({
    title: '',
    artist: '',
    lyrics: '',
    lyricsSourceUrls: null, // Initialize lyricsSourceUrls
  });
  const [storyboard, setStoryboard] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // For storyboard generation
  const [isLookingUpLyrics, setIsLookingUpLyrics] = useState<boolean>(false); // Renamed from isGeneratingLyrics
  const [error, setError] = useState<string | null>(null); // For general errors (lyrics, storyboard)

  // Video generation states
  const [overallVideoPrompt, setOverallVideoPrompt] = useState<string>('');
  const [isGeneratingOverallVideo, setIsGeneratingOverallVideo] = useState<boolean>(false);
  const [overallVideoUrl, setOverallVideoUrl] = useState<string | null>(null);
  const [overallVideoError, setOverallVideoError] = useState<string | null>(null);

  const [customVideoPrompt, setCustomVideoPrompt] = useState<string>('');
  const [isGeneratingCustomVideo, setIsGeneratingCustomVideo] = useState<boolean>(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoError, setCustomVideoError] = useState<string | null>(null);

  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9'); // Default aspect ratio

  const handleSongDetailsChange = useCallback((details: SongDetails) => {
    setSongDetails(details);
  }, []);

  const handleLookupLyrics = useCallback(async () => { // Renamed handler
    setIsLookingUpLyrics(true); // Updated state setter
    setError(null); // Clear any previous errors
    setStoryboard(''); // Clear any previous storyboard
    setOverallVideoUrl(null); // Clear video states
    setOverallVideoError(null);
    setCustomVideoUrl(null);
    setCustomVideoError(null);
    try {
      if (!songDetails.title.trim() || !songDetails.artist.trim()) {
        throw new Error("Please provide both song title and artist to look up lyrics.");
      }
      const { lyrics, sourceUrls } = await lookupLyrics(songDetails.title, songDetails.artist); // Call renamed service function
      setSongDetails(prevDetails => ({ ...prevDetails, lyrics: lyrics, lyricsSourceUrls: sourceUrls }));
    } catch (err) {
      console.error('Failed to look up lyrics:', err);
      setError(`Failed to look up lyrics. Please try again. ${err instanceof Error ? err.message : String(err)}`);
      setSongDetails(prevDetails => ({ ...prevDetails, lyrics: '', lyricsSourceUrls: null })); // Clear lyrics and sources on error
    } finally {
      setIsLookingUpLyrics(false); // Updated state setter
    }
  }, [songDetails.title, songDetails.artist]); // Depend on title and artist for lyric lookup

  const handleGenerateStoryboard = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors
    setOverallVideoUrl(null); // Clear video states
    setOverallVideoError(null);
    setCustomVideoUrl(null);
    setCustomVideoError(null);
    try {
      if (!songDetails.lyrics.trim()) {
        throw new Error("Lyrics are required to generate a storyboard. Please look up or paste them.");
      }
      const generatedContent = await generateStoryboard(songDetails);
      setStoryboard(generatedContent);
    } catch (err) {
      console.error('Failed to generate storyboard:', err);
      setError(`Failed to generate storyboard. Please try again. ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [songDetails]); // Ensure `songDetails` is in the dependency array.

  // Effect to parse storyboard for video prompts
  useEffect(() => {
    if (storyboard) {
      // Parse Core Theme(s) for overall video prompt
      const coreThemeMatch = storyboard.match(/Core Theme\(s\):\s*\(([^)]+)\)/);
      if (coreThemeMatch && coreThemeMatch[1]) {
        setOverallVideoPrompt(`Create a music video reflecting the themes: ${coreThemeMatch[1]}.`);
      } else {
        setOverallVideoPrompt('Create an animated music video based on the provided storyboard themes.');
      }

      // Parse Visual Direction for Scene 1 for custom video prompt default
      const scene1VisualDirectionMatch = storyboard.match(/\*\*Scene 1\*\*[\s\S]*?\*\*Visual Direction \(Remington Style\):\s*([^]+?)(?=(?:\s*\*\*\s*Scene \d+\s*\*\*|\s*---|$))/);
      if (scene1VisualDirectionMatch && scene1VisualDirectionMatch[1]) {
        let vd = scene1VisualDirectionMatch[1].trim();
        // Clean up potential trailing list items or extra newlines from the regex match
        vd = vd.split('\n').filter(line => !line.startsWith('* ')).join('\n').trim();
        setCustomVideoPrompt(vd);
      } else {
        setCustomVideoPrompt('Enter a visual direction from a scene to generate its video.');
      }
    } else {
      // Clear prompts if storyboard is cleared
      setOverallVideoPrompt('');
      setCustomVideoPrompt('');
    }
  }, [storyboard]);

  const handleVideoAspectRatioChange = useCallback((ratio: '16:9' | '9:16') => {
    setVideoAspectRatio(ratio);
  }, []);

  const handleCustomVideoPromptChange = useCallback((prompt: string) => {
    setCustomVideoPrompt(prompt);
  }, []);

  const handleGenerateOverallVideo = useCallback(async (prompt: string, config: VideoGenerationConfig) => {
    setIsGeneratingOverallVideo(true);
    setOverallVideoError(null);
    setOverallVideoUrl(null);
    try {
      const videoUrl = await generateVideo(prompt, config);
      setOverallVideoUrl(videoUrl);
    } catch (err) {
      console.error('Failed to generate overall video:', err);
      setOverallVideoError(`Failed to generate video: ${err instanceof Error ? err.message : String(err)}. Please try again.`);
      // If API key error, try to reopen the key selection dialog.
      if (err instanceof Error && err.message.includes("API Key might be invalid")) {
        console.warn("Attempting to re-open API key selection due to reported invalid key.");
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGeneratingOverallVideo(false);
    }
  }, []);

  const handleGenerateCustomVideo = useCallback(async (prompt: string, config: VideoGenerationConfig) => {
    setIsGeneratingCustomVideo(true);
    setCustomVideoError(null);
    setCustomVideoUrl(null);
    try {
      const videoUrl = await generateVideo(prompt, config);
      setCustomVideoUrl(videoUrl);
    } catch (err) {
      console.error('Failed to generate custom video:', err);
      setCustomVideoError(`Failed to generate video: ${err instanceof Error ? err.message : String(err)}. Please try again.`);
      // If API key error, try to reopen the key selection dialog.
      if (err instanceof Error && err.message.includes("API Key might be invalid")) {
        console.warn("Attempting to re-open API key selection due to reported invalid key.");
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGeneratingCustomVideo(false);
    }
  }, []);


  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-900 font-sans">
      <header className="w-full max-w-4xl text-center py-8">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
          Gemini Music Video Storyteller
        </h1>
        <p className="text-lg text-gray-400 mt-3">
          Craft detailed visual treatments for your songs with AI.
        </p>
      </header>

      <main className="w-full max-w-4xl flex-grow">
        <SongInputForm
          songDetails={songDetails}
          onSongDetailsChange={handleSongDetailsChange}
          onSubmit={handleGenerateStoryboard}
          isLoading={isLoading}
          isLookingUpLyrics={isLookingUpLyrics} // Updated prop name
          onLookupLyrics={handleLookupLyrics} // Updated prop name
        />

        {error && (
          <div className="mt-8 p-4 bg-red-600 text-white rounded-lg max-w-2xl mx-auto text-center">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <StoryboardDisplay
          storyboard={storyboard}
          overallVideoPrompt={overallVideoPrompt}
          onGenerateOverallVideo={handleGenerateOverallVideo}
          isGeneratingOverallVideo={isGeneratingOverallVideo}
          overallVideoUrl={overallVideoUrl}
          overallVideoError={overallVideoError}
          customVideoPrompt={customVideoPrompt}
          onCustomVideoPromptChange={handleCustomVideoPromptChange}
          onGenerateCustomVideo={handleGenerateCustomVideo}
          isGeneratingCustomVideo={isGeneratingCustomVideo}
          customVideoUrl={customVideoUrl}
          customVideoError={customVideoError}
          videoAspectRatio={videoAspectRatio}
          onVideoAspectRatioChange={handleVideoAspectRatioChange}
        />
      </main>
    </div>
  );
}

export default App;
