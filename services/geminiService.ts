
import { GoogleGenAI } from "@google/genai";

// Create a timeout promise that resolves with a default value after ms
const timeout = <T>(ms: number, fallback: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(fallback), ms));
};

export const moderateContent = async (text: string): Promise<boolean> => {
  if (!process.env.API_KEY || !text.trim()) return true;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Race between the API call and a 5-second timeout
    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت مراقب محتوى لنادي إعلام مدرسي. هل النص التالي مقبول تربوياً؟ أجب بكلمة "نعم" فقط إذا كان مقبولاً و "لا" إذا كان سيئاً جداً: "${text}"`,
      }),
      timeout(5000, { text: 'نعم' }) // Fallback to 'safe' if it takes too long
    ]);

    // Use type assertion as response might be the fallback object
    const result = (response as any).text?.trim() || "نعم";
    return !result.includes('لا');
  } catch (error) {
    console.error("Gemini Moderation Error:", error);
    return true; // Fail safe: allow posting if service is down
  }
};

export const suggestCaption = async (description: string): Promise<string> => {
  if (!process.env.API_KEY || !description.trim()) return description;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `حول هذا النص إلى تعليق إعلامي مشوق واحترافي للنشر في تطبيق النادي: "${description}"`,
      }),
      timeout(5000, { text: description })
    ]);

    return (response as any).text?.trim() || description;
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return description;
  }
};
