
import React from 'react';
import { StoryboardDisplayProps, VideoGenerationConfig } from '../types';

const StoryboardDisplay: React.FC<StoryboardDisplayProps> = ({ 
  storyboard,
  overallVideoPrompt,
  onGenerateOverallVideo,
  isGeneratingOverallVideo,
  overallVideoUrl,
  overallVideoError,
  customVideoPrompt,
  onCustomVideoPromptChange,
  onGenerateCustomVideo,
  isGeneratingCustomVideo,
  customVideoUrl,
  customVideoError,
  videoAspectRatio,
  onVideoAspectRatioChange,
}) => {
  if (!storyboard) {
    return null;
  }

  // Basic markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h2 key={index} className="text-2xl font-semibold text-blue-300 mt-8 mb-4 tracking-wide">{line.substring(4)}</h2>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-xl font-semibold text-blue-300 mt-6 mb-3">{line.substring(3)}</h3>;
      }
      if (line.startsWith('---')) {
        return <hr key={index} className="border-white/10 my-8" />;
      }
      if (line.startsWith('* ')) {
        if (line.startsWith('*   **')) {
          return <p key={index} className="mb-2 text-gray-100 font-medium leading-relaxed">{line.substring(2)}</p>;
        }
        return <li key={index} className="ml-5 list-disc text-gray-300">{line.substring(2)}</li>;
      }
      if (line.startsWith('    * ')) {
        return <li key={index} className="ml-10 list-disc text-gray-400">{line.substring(6)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2 text-gray-300 leading-relaxed">{line}</p>;
    });
  };

  const videoConfig: VideoGenerationConfig = {
    aspectRatio: videoAspectRatio,
    resolution: '720p',
  };

  return (
    <div className="mt-4 p-8 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-5xl mx-auto">
      <h2 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-md">Generated Storyboard</h2>
      <div className="prose prose-invert max-w-none text-gray-300">
        {renderContent(storyboard)}
      </div>

      <hr className="border-white/20 my-12" />

      <div className="video-generation-section mt-8">
        <h2 className="text-3xl font-extrabold text-blue-300 mb-8 text-center">Bring it to Life (Veo 3)</h2>

        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300">Aspect Ratio:</label>
          <select
            id="aspect-ratio"
            value={videoAspectRatio}
            onChange={(e) => onVideoAspectRatioChange(e.target.value as '16:9' | '9:16')}
            disabled={isGeneratingOverallVideo || isGeneratingCustomVideo}
            className="px-4 py-2 bg-black/40 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed outline-none"
            aria-label="Select video aspect ratio"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Video Generation */}
            <div className="bg-black/20 p-6 rounded-xl border border-white/5 shadow-inner flex flex-col">
            <h3 className="text-xl font-bold text-white mb-3">Overall Concept</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">
                Generate a video capturing the core themes and mood of the entire song.
            </p>
            <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">"{overallVideoPrompt}"</p>
            <button
                onClick={() => onGenerateOverallVideo(overallVideoPrompt, videoConfig)}
                disabled={isGeneratingOverallVideo || !overallVideoPrompt}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                aria-label="Generate overall video"
            >
                {isGeneratingOverallVideo ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                </>
                ) : (
                'Generate Video'
                )}
            </button>

            {overallVideoError && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500/30 text-red-200 text-sm rounded-lg text-center">
                <p>{overallVideoError}</p>
                </div>
            )}

            {overallVideoUrl && (
                <div className="mt-6">
                <video controls src={overallVideoUrl} className="w-full h-auto rounded-lg shadow-lg border border-white/10" autoPlay loop muted>
                    Your browser does not support the video tag.
                </video>
                </div>
            )}
            </div>

            {/* Custom Scene Video Generation */}
            <div className="bg-black/20 p-6 rounded-xl border border-white/5 shadow-inner flex flex-col">
            <h3 className="text-xl font-bold text-white mb-3">Specific Scene</h3>
            <p className="text-sm text-gray-400 mb-4">
                Visualize a specific scene. Edit the prompt below to refine the direction.
            </p>
            <textarea
                id="custom-video-prompt"
                name="custom-video-prompt"
                value={customVideoPrompt}
                onChange={(e) => onCustomVideoPromptChange(e.target.value)}
                rows={3}
                disabled={isGeneratingCustomVideo}
                className="w-full px-4 py-2 bg-black/40 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex-grow text-sm minimalist-scroll"
                placeholder="Describe the scene..."
                aria-label="Custom video generation prompt"
            ></textarea>
            <button
                onClick={() => onGenerateCustomVideo(customVideoPrompt, videoConfig)}
                disabled={isGeneratingCustomVideo || !customVideoPrompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                aria-label="Generate custom scene video"
            >
                {isGeneratingCustomVideo ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                </>
                ) : (
                'Generate Scene'
                )}
            </button>

            {customVideoError && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500/30 text-red-200 text-sm rounded-lg text-center">
                <p>{customVideoError}</p>
                </div>
            )}

            {customVideoUrl && (
                <div className="mt-6">
                <video controls src={customVideoUrl} className="w-full h-auto rounded-lg shadow-lg border border-white/10" autoPlay loop muted>
                    Your browser does not support the video tag.
                </video>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StoryboardDisplay;
