
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

  // Basic markdown-like rendering for headings and paragraphs
  // This is a simplified approach, for full markdown rendering a library would be used.
  // For now, we'll split by lines and apply basic styling.
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h2 key={index} className="text-2xl font-semibold text-blue-400 mt-8 mb-4">{line.substring(4)}</h2>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-xl font-semibold text-blue-400 mt-6 mb-3">{line.substring(3)}</h3>;
      }
      if (line.startsWith('---')) {
        return <hr key={index} className="border-gray-600 my-8" />;
      }
      if (line.startsWith('* ')) {
        // Check if it's a bolded list item, like scene headers
        if (line.startsWith('*   **')) {
          return <p key={index} className="mb-2 text-gray-200 leading-relaxed">{line.substring(2)}</p>;
        }
        return <li key={index} className="ml-5 list-disc text-gray-300">{line.substring(2)}</li>;
      }
      if (line.startsWith('    * ')) { // Nested list item
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
    resolution: '720p', // Default to 720p for now
  };

  return (
    <div className="mt-10 p-6 bg-gray-800 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-white mb-6 text-center">Generated Storyboard</h2>
      <div className="prose prose-invert max-w-none text-gray-300">
        {renderContent(storyboard)}
      </div>

      <hr className="border-gray-600 my-8" />

      <div className="video-generation-section mt-8">
        <h2 className="text-3xl font-extrabold text-blue-400 mb-6 text-center">Video Generation (Veo 3)</h2>

        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300">Aspect Ratio:</label>
          <select
            id="aspect-ratio"
            value={videoAspectRatio}
            onChange={(e) => onVideoAspectRatioChange(e.target.value as '16:9' | '9:16')}
            disabled={isGeneratingOverallVideo || isGeneratingCustomVideo}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Select video aspect ratio"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
          </select>
        </div>

        {/* Overall Video Generation */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-inner mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">Generate Overall Video</h3>
          <p className="text-gray-300 mb-4">
            This will generate a video based on the core themes of your storyboard.
          </p>
          <p className="text-gray-400 italic mb-4">Prompt: "{overallVideoPrompt}"</p>
          <button
            onClick={() => onGenerateOverallVideo(overallVideoPrompt, videoConfig)}
            disabled={isGeneratingOverallVideo || !overallVideoPrompt}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Generate overall video"
          >
            {isGeneratingOverallVideo ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Overall Video... (This may take a few minutes)
              </>
            ) : (
              'Generate Overall Video'
            )}
          </button>

          {overallVideoError && (
            <div className="mt-4 p-3 bg-red-600 text-white rounded-lg text-center">
              <p className="font-bold">Error generating overall video:</p>
              <p>{overallVideoError}</p>
            </div>
          )}

          {overallVideoUrl && (
            <div className="mt-6">
              <h4 className="text-xl font-semibold text-white mb-2">Generated Video:</h4>
              <video controls src={overallVideoUrl} className="w-full h-auto rounded-lg shadow-lg" autoPlay loop muted>
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        {/* Custom Scene Video Generation */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-bold text-white mb-4">Generate Custom Scene Video</h3>
          <p className="text-gray-300 mb-4">
            Enter or paste a specific visual direction from your storyboard (e.g., from a "Visual Direction" section)
            to generate a video for that scene.
          </p>
          <textarea
            id="custom-video-prompt"
            name="custom-video-prompt"
            value={customVideoPrompt}
            onChange={(e) => onCustomVideoPromptChange(e.target.value)}
            rows={5}
            disabled={isGeneratingCustomVideo}
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., 'A lone cowboy rides his horse across a vast, dusty desert at sunset, dramatic shadows stretching before them.'"
            aria-label="Custom video generation prompt"
          ></textarea>
          <button
            onClick={() => onGenerateCustomVideo(customVideoPrompt, videoConfig)}
            disabled={isGeneratingCustomVideo || !customVideoPrompt.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
            aria-label="Generate custom scene video"
          >
            {isGeneratingCustomVideo ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Custom Video... (This may take a few minutes)
              </>
            ) : (
              'Generate Custom Scene Video'
            )}
          </button>

          {customVideoError && (
            <div className="mt-4 p-3 bg-red-600 text-white rounded-lg text-center">
              <p className="font-bold">Error generating custom video:</p>
              <p>{customVideoError}</p>
            </div>
          )}

          {customVideoUrl && (
            <div className="mt-6">
              <h4 className="text-xl font-semibold text-white mb-2">Generated Video:</h4>
              <video controls src={customVideoUrl} className="w-full h-auto rounded-lg shadow-lg" autoPlay loop muted>
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryboardDisplay;
