

import React from 'react';
import { SongDetails, SongInputFormProps } from '../types';

const SongInputForm: React.FC<SongInputFormProps> = ({ 
  songDetails, 
  onSongDetailsChange, 
  onSubmit, 
  isLoading, 
  isLookingUpLyrics, // Renamed prop
  onLookupLyrics // Renamed prop
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onSongDetailsChange({ ...songDetails, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleLookupLyricsClick = (e: React.FormEvent) => { // Renamed handler
    e.preventDefault();
    onLookupLyrics(); // Called renamed prop
  };

  const isAnyLoading = isLoading || isLookingUpLyrics;
  const isLyricsEmpty = songDetails.lyrics.trim() === '';
  const isTitleArtistEmpty = songDetails.title.trim() === '' || songDetails.artist.trim() === '';

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-800 rounded-lg shadow-xl space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white mb-2">Music Video Storyboard Generator</h2>
        <p className="text-gray-400">Enter your song details to generate a detailed visual treatment.</p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Song Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={songDetails.title}
          onChange={handleChange}
          required
          disabled={isAnyLoading}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g., 'Whispers in the Wind'"
          aria-label="Song Title"
        />
      </div>

      <div>
        <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">Artist/Band</label>
        <input
          type="text"
          id="artist"
          name="artist"
          value={songDetails.artist}
          onChange={handleChange}
          required
          disabled={isAnyLoading}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g., 'The Lonesome Drifters'"
          aria-label="Artist/Band"
        />
      </div>

      <button
        type="button"
        onClick={handleLookupLyricsClick} // Updated handler
        disabled={isAnyLoading || isTitleArtistEmpty}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
        aria-label="Look Up Lyrics"
      >
        {isLookingUpLyrics ? ( // Updated loading state
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Looking Up Lyrics...
          </>
        ) : (
          'Look Up Lyrics'
        )}
      </button>

      <div>
        <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300 mb-1 mt-4">Full Song Lyrics</label>
        <textarea
          id="lyrics"
          name="lyrics"
          value={songDetails.lyrics}
          onChange={handleChange}
          rows={10}
          required
          disabled={isAnyLoading}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Lyrics will appear here after lookup, or paste them manually."
          aria-label="Full Song Lyrics"
        ></textarea>
        {songDetails.lyricsSourceUrls && songDetails.lyricsSourceUrls.length > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            <p><strong>Sources:</strong></p>
            <ul className="list-disc ml-5">
              {songDetails.lyricsSourceUrls.map((url, index) => (
                <li key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isAnyLoading || isLyricsEmpty}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        aria-label="Generate Storyboard"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Storyboard...
          </>
        ) : (
          'Generate Storyboard'
        )}
      </button>
    </form>
  );
};

export default SongInputForm;
