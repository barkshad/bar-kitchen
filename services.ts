
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AppData, GalleryImage } from './types';
import { initialData } from './initialData';

const DB_NAME = 'GeneralisDB';
const DB_VERSION = 1;
const GALLERY_STORE_NAME = 'gallery';
const DATA_KEY = 'generalis_data';

// --- IndexedDB Service for Gallery ---

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Error opening DB');
    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(GALLERY_STORE_NAME)) {
        dbInstance.createObjectStore(GALLERY_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveGalleryToDB = async (gallery: GalleryImage[]): Promise<void> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(GALLERY_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE_NAME);
    store.clear();
    gallery.forEach(image => store.add(image));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject('Error saving gallery');
  });
};

export const loadGalleryFromDB = async (): Promise<GalleryImage[] | null> => {
  const dbInstance = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction(GALLERY_STORE_NAME, 'readonly');
    const store = transaction.objectStore(GALLERY_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
        if (request.result && request.result.length > 0) {
            resolve(request.result);
        } else {
            resolve(null);
        }
    };
    request.onerror = () => reject('Error loading gallery');
  });
};


// --- LocalStorage Service for other data ---

export const saveDataToLocalStorage = (data: Omit<AppData, 'gallery'>): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(DATA_KEY, serializedData);
  } catch (error) {
    console.error("Could not save data to localStorage", error);
  }
};

export const loadDataFromLocalStorage = (): Omit<AppData, 'gallery'> | null => {
  try {
    const serializedData = localStorage.getItem(DATA_KEY);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error("Could not load data from localStorage", error);
    return null;
  }
};

// --- Combined Data Loader ---

export const loadAppData = async (): Promise<AppData> => {
    const localData = loadDataFromLocalStorage();
    const galleryData = await loadGalleryFromDB();

    if (localData && galleryData) {
        return { ...localData, gallery: galleryData };
    }
    // If anything is missing, return the full initial data set
    return initialData;
};


// --- Gemini API Service ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const base64ToGenerativePart = (base64String: string, mimeType: string) => {
    return {
      inlineData: {
        data: base64String.split(',')[1],
        mimeType: mimeType,
      },
    };
};

export const generateCaptionSuggestions = async (base64Image: string): Promise<string[]> => {
    try {
        const imagePart = base64ToGenerativePart(base64Image, 'image/jpeg');
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: "Generate 3 diverse, concise, and appealing captions for this image for a restaurant's website gallery."}] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        captions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.captions || [];

    } catch (error) {
        console.error("Error generating captions:", error);
        return ["Could not generate captions.", "Please try again.", "AI model error."];
    }
};

export const generateSingleCaption = async (base64Image: string): Promise<string> => {
     try {
        const imagePart = base64ToGenerativePart(base64Image, 'image/jpeg');
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: "Generate a single, concise, and appealing caption for this image for a restaurant's website gallery."}] }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating single caption:", error);
        return "Caption generation failed.";
    }
}


// --- Utility Functions ---

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};
