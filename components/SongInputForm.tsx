
import React, { useState, useRef, useEffect } from 'react';
import { SongInputFormProps } from '../types';

const SongInputForm: React.FC<SongInputFormProps> = ({ 
  songDetails, 
  onSongDetailsChange, 
  onSubmit, 
  isLoading, 
  isLookingUpLyrics, 
  onLookupLyrics 
}) => {
  const [step, setStep] = useState(0); // 0: Title, 1: Artist, 2: Lyrics
  const [fade, setFade] = useState(true);
  // Separate refs for input and textarea to avoid type conflicts, though a union type ref is also possible
  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus logic
  useEffect(() => {
    if (fade) {
      // Small delay to ensure render is complete
      const timer = setTimeout(() => {
        if (step < 2 && inputRef.current) inputRef.current.focus();
        if (step === 2 && textAreaRef.current) textAreaRef.current.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step, fade]);

  const changeStep = (direction: 'next' | 'prev') => {
    setFade(false);
    setTimeout(() => {
      setStep(prev => direction === 'next' ? prev + 1 : prev - 1);
      setFade(true);
    }, 300); // Match transition duration
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onSongDetailsChange({ ...songDetails, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent default only for single-line inputs
        if (step === 0 && songDetails.title.trim()) {
            e.preventDefault();
            changeStep('next');
        }
        if (step === 1 && songDetails.artist.trim()) {
             e.preventDefault();
             changeStep('next');
        }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="w-full text-center">
            <label htmlFor="title" className="block text-2xl md:text-4xl font-light text-gray-200 mb-8 tracking-wide">
              What is the song title?
            </label>
            <input
              ref={inputRef}
              type="text"
              name="title"
              value={songDetails.title}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full max-w-2xl bg-transparent border-b-2 border-white/30 focus:border-white text-center text-3xl md:text-5xl text-white outline-none pb-4 transition-colors placeholder-white/10"
              placeholder="e.g. Bohemian Rhapsody"
              autoComplete="off"
            />
            <div className="mt-10">
              <button 
                onClick={() => changeStep('next')}
                disabled={!songDetails.title.trim()}
                className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all disabled:opacity-0 disabled:translate-y-4"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="w-full text-center">
            <label htmlFor="artist" className="block text-2xl md:text-4xl font-light text-gray-200 mb-8 tracking-wide">
              Who is the artist?
            </label>
            <input
              ref={inputRef}
              type="text"
              name="artist"
              value={songDetails.artist}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full max-w-2xl bg-transparent border-b-2 border-white/30 focus:border-white text-center text-3xl md:text-5xl text-white outline-none pb-4 transition-colors placeholder-white/10"
              placeholder="e.g. Queen"
              autoComplete="off"
            />
             <div className="mt-10 flex items-center justify-center space-x-6">
               <button 
                 onClick={() => changeStep('prev')}
                 className="text-white/40 hover:text-white transition-colors"
               >
                 Back
               </button>
              <button 
                onClick={() => changeStep('next')}
                disabled={!songDetails.artist.trim()}
                className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all disabled:opacity-0 disabled:translate-y-4"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full flex flex-col items-center">
            <label className="block text-2xl md:text-4xl font-light text-gray-200 mb-6 tracking-wide">
              {songDetails.lyrics ? "The Lyrics" : "Let's find the lyrics"}
            </label>

            {!songDetails.lyrics && !isLookingUpLyrics && (
               <button
                  type="button"
                  onClick={onLookupLyrics}
                  className="mb-8 px-6 py-3 bg-indigo-500/80 hover:bg-indigo-500 rounded-full text-white font-semibold shadow-lg backdrop-blur-sm transition-all hover:scale-105 flex items-center gap-2"
               >
                  <span>✨</span> Auto-Lookup Lyrics
               </button>
            )}

            {isLookingUpLyrics && (
                <div className="mb-8 flex flex-col items-center text-indigo-300 animate-pulse">
                    <span className="text-xl">Searching the musical archives...</span>
                </div>
            )}

            <div className="w-full max-w-3xl relative">
                <textarea
                  ref={textAreaRef}
                  name="lyrics"
                  value={songDetails.lyrics}
                  onChange={handleChange}
                  className="w-full bg-black/20 rounded-xl p-6 text-lg text-white/90 outline-none border border-white/10 focus:border-white/30 transition-all resize-none h-80 backdrop-blur-md shadow-2xl"
                  placeholder="Or paste them manually here..."
                />
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-6 w-full max-w-md">
                <button 
                 onClick={() => changeStep('prev')}
                 className="text-white/40 hover:text-white transition-colors"
               >
                 Back
               </button>
                <button
                    onClick={onSubmit}
                    disabled={!songDetails.lyrics.trim() || isLoading}
                    className="flex-1 px-8 py-4 bg-white text-gray-900 rounded-full font-bold shadow-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:-translate-y-1"
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Dreaming up Storyboard...
                    </>
                    ) : (
                    'Generate Visuals'
                    )}
                </button>
            </div>
             {songDetails.lyricsSourceUrls && songDetails.lyricsSourceUrls.length > 0 && (
                <div className="mt-4 text-xs text-white/40">
                  Found on: {new URL(songDetails.lyricsSourceUrls[0]).hostname}
                </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center min-h-[70vh] transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
        {renderStep()}
        
        {/* Minimal Progress Dots */}
        <div className="fixed bottom-10 flex space-x-3">
            {[0, 1, 2].map(i => (
                <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                />
            ))}
        </div>
    </div>
  );
};

export default SongInputForm;
