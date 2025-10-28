
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SongDetails, VideoGenerationConfig } from '../types';

declare global {
  interface Window {
    // Fix: Using the globally expected type 'AIStudio' for window.aistudio to resolve conflicts.
    // The error message "Property 'aistudio' must be of type 'AIStudio'" suggests that 'AIStudio'
    // is already a known type in the environment's global declarations.
    aistudio: AIStudio; 
  }
}

/**
 * Initializes the GoogleGenAI client.
 * Assumes process.env.API_KEY is pre-configured and available.
 */
const getGenerativeModel = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Looks up lyrics based on song title and artist using Google Search grounding.
 * @param title The song title.
 * @param artist The song artist.
 * @returns A promise that resolves to an object containing the lyrics string and an array of source URLs.
 */
export async function lookupLyrics(title: string, artist: string): Promise<{ lyrics: string; sourceUrls: string[] }> {
  const ai = getGenerativeModel();
  const model = "gemini-2.5-flash"; // Flash model with Google Search for up-to-date info

  const prompt = `Find the full song lyrics for the song titled "${title}" by the artist "${artist}".
If you find multiple versions, prioritize the most official or widely accepted version.
Do not generate lyrics, only find existing ones. Provide the exact lyrics.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Use Google Search grounding
      }
    });

    const lyrics = response.text;
    const sourceUrls: string[] = [];

    // Extract URLs from grounding chunks
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sourceUrls.push(chunk.web.uri);
        }
      }
    }

    return { lyrics, sourceUrls };
  } catch (error) {
    console.error("Error looking up lyrics:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      throw new Error(`Error: API key might be invalid or there was an API issue during lyric lookup. Please ensure your API key is correct and try again. Original error: ${error.message}`);
    }
    throw new Error(`Failed to look up lyrics: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates a comprehensive storyboard and visual treatment based on song details.
 * @param songDetails The song's title, artist, and lyrics.
 * @returns A promise that resolves to the generated storyboard as a markdown string.
 */
export async function generateStoryboard(songDetails: SongDetails): Promise<string> {
  const ai = getGenerativeModel();
  const model = "gemini-2.5-pro"; // Using pro model for complex reasoning and structured output.

  const prompt = `
ROLE: You are an expert Visual Storyteller and Music Video Director.

TASK: Generate a comprehensive storyboard and visual treatment for a 2-minute animated video based on the song provided. Your output must be highly structured and detailed to ensure scene-to-scene consistency.

SONG DETAILS:
* Title: ${songDetails.title}
* Artist: ${songDetails.artist}
* Lyrics:
"""
${songDetails.lyrics}
"""

CONSTRAINTS:
* Total Length: 2 minutes.
* Visual Style: "School of Remington" (emphasis on dramatic lighting, rugged emotion, and dynamic compositions).
* Aspect Ratio: 16:9.

REQUIRED OUTPUT (Follow this 3-part structure exactly):

---

### Part 1: Lyrical & Narrative Analysis

1.  **Core Theme(s):** (e.g., Betrayal, Redemption, Loss, Wanderlust)
2.  **Tone & Mood:** (e.g., Somber, Aggressive, Hopeful, Nostalgic)
3.  **Key Visual Imagery:** (List of 5-10 strong visual motifs from the lyrics. e.g., "broken glass," "dusty road," "setting sun")
4.  **The Hook:** (Identify the song's key lyrical and emotional climax).
5.  **Narrative Arc (Hero's Journey):** Map the song's story to a simplified Hero's Journey, even if it's for an anti-hero.
    *   **The Call:**
    *   **The Ordeal/Conflict:**
    *   **The Resolution/Return:**

---

### Part 2: Character Profiles

Create detailed, consistent profiles for all main characters.

*   **Character 1: [Archetype, e.g., "The Outlaw"]**
    *   **Age:**
    *   **Physical Attributes:** (Height, build, hair, face. Must align with Remington style).
    *   **Key Attire/Features:** (Consistent items they always wear, e.g., "a worn, wide-brimmed hat," "a silver locket," "a scar over the left eye").

*   **Character 2: [Archetype, e.g., "The Pursuer"]**
    *   **Age:**
    *   **Physical Attributes:**
    *   **Key Attire/Features:**

---

### Part 3: Scene-by-Scene Storyboard (Approx. 8-12 Scenes)

Generate the complete list of all scenes required for the 2-minute video.

*   **Scene 1**
    *   **Est. Timecode:** 0:00 - 0:15
    *   **Relevant Lyrics:** [Quote the lyric(s) this scene visualizes]
    *   **Scene Description:** [Describe the action, character emotion, and camera movement.]
    *   **Visual Direction (Remington Style):** [Describe the setting, lighting, and composition. Be specific about shadows, color palette, and character placement.]

*   **Scene 2**
    *   **Est. Timecode:** 0:15 - 0:30
    *   **Relevant Lyrics:** [...]
    *   **Scene Description:** [...]
    *   **Visual Direction (Remington Style):** [...]
    
(Continue for all scenes, mapping out the full 2-minute video)
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.9, // A bit higher temperature for creative output.
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 2048, // A reasonable limit for a detailed storyboard
        thinkingConfig: { thinkingBudget: 512 } // Reserve some tokens for thinking
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating storyboard:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      throw new Error(`Error: API key might be invalid or there was an API issue during storyboard generation. Please ensure your API key is correct and try again. Original error: ${error.message}`);
    }
    throw new Error(`Failed to generate storyboard: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates a video using the Veo 3 model.
 * @param prompt The text prompt for video generation.
 * @param config Video generation configuration (aspect ratio, resolution).
 * @returns A promise that resolves to the URL of the generated video.
 */
export async function generateVideo(prompt: string, config: VideoGenerationConfig): Promise<string> {
  // Ensure API key is selected as per Veo guidelines
  // This function assumes window.aistudio is available in the execution context.
  if (!await window.aistudio.hasSelectedApiKey()) {
    console.warn("No API key selected for video generation. Opening key selection dialog.");
    await window.aistudio.openSelectKey(); // User needs to select an API key.
    // The guideline states: "You can assume the key selection was successful after triggering openSelectKey()."
    // Also, "Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key from the dialog."
  }
  
  // Re-initialize GoogleGenAI to ensure the latest API key from the dialog is used.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set after selection. Please try again.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'veo-3.1-fast-generate-preview';

  console.log(`Generating video with prompt: "${prompt}" and aspect ratio: ${config.aspectRatio}`);

  try {
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio,
      },
    });

    console.log("Video generation initiated. Polling for completion...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log(`Video generation status: ${operation.done ? 'Done' : 'Processing...'}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Video generation completed, but no download link was found in the response.");
    }

    console.log("Video generation successful. Download link obtained.");
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Error generating video:", error);
    // Specifically handle "Requested entity was not found." for API key re-selection
    if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
      throw new Error("API Key might be invalid or has expired. Please try selecting your API key again. (Billing info: ai.google.dev/gemini-api/docs/billing)");
    }
    throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : String(error)}`);
  }
}
    