
import React, { useState, useCallback, useEffect } from 'react';
import { SongDetails, VideoGenerationConfig } from './types';
import SongInputForm from './components/SongInputForm';
import StoryboardDisplay from './components/StoryboardDisplay';
import { generateStoryboard, lookupLyrics, generateVideo } from './services/geminiService';

function App() {
  const [songDetails, setSongDetails] = useState<SongDetails>({
    title: '',
    artist: '',
    lyrics: '',
    lyricsSourceUrls: null,
  });
  const [storyboard, setStoryboard] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLookingUpLyrics, setIsLookingUpLyrics] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Video generation states
  const [overallVideoPrompt, setOverallVideoPrompt] = useState<string>('');
  const [isGeneratingOverallVideo, setIsGeneratingOverallVideo] = useState<boolean>(false);
  const [overallVideoUrl, setOverallVideoUrl] = useState<string | null>(null);
  const [overallVideoError, setOverallVideoError] = useState<string | null>(null);

  const [customVideoPrompt, setCustomVideoPrompt] = useState<string>('');
  const [isGeneratingCustomVideo, setIsGeneratingCustomVideo] = useState<boolean>(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoError, setCustomVideoError] = useState<string | null>(null);

  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const handleSongDetailsChange = useCallback((details: SongDetails) => {
    setSongDetails(details);
  }, []);

  const handleLookupLyrics = useCallback(async () => {
    setIsLookingUpLyrics(true);
    setError(null);
    setStoryboard('');
    setOverallVideoUrl(null);
    setOverallVideoError(null);
    setCustomVideoUrl(null);
    setCustomVideoError(null);
    try {
      if (!songDetails.title.trim() || !songDetails.artist.trim()) {
        throw new Error("Please provide both song title and artist to look up lyrics.");
      }
      const { lyrics, sourceUrls } = await lookupLyrics(songDetails.title, songDetails.artist);
      setSongDetails(prevDetails => ({ ...prevDetails, lyrics: lyrics, lyricsSourceUrls: sourceUrls }));
    } catch (err) {
      console.error('Failed to look up lyrics:', err);
      setError(`Failed to look up lyrics. Please try again. ${err instanceof Error ? err.message : String(err)}`);
      setSongDetails(prevDetails => ({ ...prevDetails, lyrics: '', lyricsSourceUrls: null }));
    } finally {
      setIsLookingUpLyrics(false);
    }
  }, [songDetails.title, songDetails.artist]);

  const handleGenerateStoryboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOverallVideoUrl(null);
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
  }, [songDetails]);

  useEffect(() => {
    if (storyboard) {
      const coreThemeMatch = storyboard.match(/Core Theme\(s\):\s*\(([^)]+)\)/);
      if (coreThemeMatch && coreThemeMatch[1]) {
        setOverallVideoPrompt(`Create a music video reflecting the themes: ${coreThemeMatch[1]}.`);
      } else {
        setOverallVideoPrompt('Create an animated music video based on the provided storyboard themes.');
      }

      const scene1VisualDirectionMatch = storyboard.match(/\*\*Scene 1\*\*[\s\S]*?\*\*Visual Direction \(Remington Style\):\s*([^]+?)(?=(?:\s*\*\*\s*Scene \d+\s*\*\*|\s*---|$))/);
      if (scene1VisualDirectionMatch && scene1VisualDirectionMatch[1]) {
        let vd = scene1VisualDirectionMatch[1].trim();
        vd = vd.split('\n').filter(line => !line.startsWith('* ')).join('\n').trim();
        setCustomVideoPrompt(vd);
      } else {
        setCustomVideoPrompt('Enter a visual direction from a scene to generate its video.');
      }
    } else {
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
      if (err instanceof Error && err.message.includes("API Key might be invalid")) {
        console.warn("Attempting to re-open API key selection due to reported invalid key.");
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsGeneratingCustomVideo(false);
    }
  }, []);

  const handleReset = () => {
    setStoryboard('');
    setSongDetails({ title: '', artist: '', lyrics: '', lyricsSourceUrls: null });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-8 relative">
      <main className="w-full max-w-6xl z-10">
        {!storyboard ? (
           <div className="animate-fade-in">
              <SongInputForm
                songDetails={songDetails}
                onSongDetailsChange={handleSongDetailsChange}
                onSubmit={handleGenerateStoryboard}
                isLoading={isLoading}
                isLookingUpLyrics={isLookingUpLyrics}
                onLookupLyrics={handleLookupLyrics}
              />
              
              {error && (
                <div className="mt-8 p-4 bg-red-500/80 backdrop-blur-sm text-white rounded-lg max-w-md mx-auto text-center shadow-lg">
                  <p>{error}</p>
                </div>
              )}
           </div>
        ) : (
          <div className="relative animate-fade-in">
             <div className="absolute top-0 right-0 -mt-12 md:-mr-4 z-50">
               <button 
                 onClick={handleReset}
                 className="text-white/60 hover:text-white text-sm bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur transition-all"
               >
                 Start New Story
               </button>
             </div>
             
             {/* Add a semi-transparent background wrapper for readability if needed, but StoryboardDisplay has its own styling. 
                 We will let StoryboardDisplay handle its card look. */}
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
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
