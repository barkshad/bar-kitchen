import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AppData, GalleryImage } from './types';
import { initialData } from './initialData';
import { supabase } from './supabase';

const SETTINGS_KEY = 'main_config';

// --- Supabase Service for App Data ---

/**
 * Fetches all app data from Supabase site_settings table.
 * Falls back to initialData if no data is found or if the table hasn't been created.
 */
export const loadAppData = async (): Promise<AppData> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('content')
      .eq('key', SETTINGS_KEY)
      .single();

    if (error) {
      // PGRST116 means "no rows found", which is expected on first load
      if (error.code !== 'PGRST116') {
        console.error("Supabase error fetching data:", error.message);
      }
      return initialData;
    }

    if (!data || !data.content) {
      return initialData;
    }

    return data.content as AppData;
  } catch (error) {
    console.error("Critical error loading data from Supabase:", error);
    return initialData;
  }
};

/**
 * Saves/Upserts the entire AppData object into Supabase.
 */
export const saveAppDataToSupabase = async (data: AppData): Promise<void> => {
  try {
    // 1. Sanitize the data to ensure it's a clean JSON object
    const cleanData = JSON.parse(JSON.stringify(data));

    // 2. Perform the upsert
    // 'onConflict' ensures that we update the existing 'main_config' row instead of trying to insert a duplicate.
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
      console.error("Supabase Save Error:", error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error("Detailed catch in saveAppDataToSupabase:", error);
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