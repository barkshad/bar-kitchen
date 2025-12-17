import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AppData, GalleryImage } from './types';
import { initialData } from './initialData';
import { supabase } from './supabase';

const SETTINGS_KEY = 'main_config';

// --- Supabase Service for App Data ---

/**
 * Fetches all app data from Supabase site_settings table.
 * Falls back to initialData if the network is down or the table is missing.
 */
export const loadAppData = async (): Promise<AppData> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('content')
      .eq('key', SETTINGS_KEY)
      .single();

    if (error) {
      // PGRST116 means "no rows found", which is fine for first-time users.
      if (error.code !== 'PGRST116') {
        console.warn(`Supabase query error (${error.code}): ${error.message}`);
      }
      return initialData;
    }

    if (!data || !data.content) {
      return initialData;
    }

    return data.content as AppData;
  } catch (err: any) {
    // Catching network errors like "Failed to fetch"
    if (err.message === 'Failed to fetch' || err instanceof TypeError) {
      console.error("Supabase Unreachable: Connection failed. This usually means the SUPABASE_URL is incorrect, the project is paused, or an Ad-Blocker is active.");
    } else {
      console.error("Unexpected error loading data:", err);
    }
    return initialData;
  }
};

/**
 * Saves/Upserts the entire AppData object into Supabase.
 */
export const saveAppDataToSupabase = async (data: AppData): Promise<void> => {
  try {
    const cleanData = JSON.parse(JSON.stringify(data));

    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { 
          key: SETTINGS_KEY, 
          content: cleanData,
          updated_at: new Date().toISOString()
        }, 
        { onConflict: 'key' }
      );

    if (error) {
      console.error("Supabase Save Error Details:", error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    if (error.message === 'Failed to fetch' || error instanceof TypeError) {
      throw new Error("Network Error: Could not reach Supabase. Check your internet or Supabase URL.");
    }
    throw error;
  }
};

// --- AI Service (Gemini API) ---
const VISION_MODEL = 'gemini-3-flash-preview'; 

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const generateCaptionSuggestions = async (imageDataUrl: string): Promise<string[]> => {
    if (!imageDataUrl) return [];
    const base64Data = imageDataUrl.split(',')[1];
    if (!base64Data) return [];

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    {
                        text: `Generate 3 diverse, short, and engaging caption suggestions for this image, suitable for a restaurant's social media gallery. Return as a JSON array of strings.`,
                    },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data,
                        },
                    },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            },
        });
        
        return JSON.parse(response.text || "[]") as string[];
    } catch (error) {
        console.error("Error generating caption suggestions:", error);
        return ["Delicious moment captured!", "Come and experience our atmosphere!", "Taste the good life!"];
    }
};

export const generateSingleCaption = async (imageDataUrl: string): Promise<string> => {
    if (!imageDataUrl) return "A beautiful moment at Generali's.";
    const base64Data = imageDataUrl.split(',')[1];
    if (!base64Data) return "A beautiful moment at Generali's.";

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: VISION_MODEL,
            contents: {
                parts: [
                    {
                        text: `Generate a single, short, and engaging caption for this image, suitable for a restaurant's social media gallery.`,
                    },
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Data,
                        },
                    },
                ],
            },
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error generating single caption:", error);
        return "A beautiful moment at Generali's.";
    }
};