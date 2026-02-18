import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Set to true to disable AI features and continue development
const DISABLE_AI = true;

// Expanded list of models to try in case of 404
const MODEL_FALLBACKS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-1.5-flash-8b"
];

export const getMedicalInsight = async (condition: string, medicines: string[]) => {
  if (DISABLE_AI) {
    return "AI Assistant temporarily disabled. Enable in geminiService.ts";
  }

  console.log("API_KEY loaded:", API_KEY ? `${API_KEY.substring(0, 15)}...` : "MISSING");

  if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY' || API_KEY.trim() === '') {
    return "AI Assistant configuration missing.";
  }

  const prompt = `Provide a very brief (2 sentence) medical insight for a patient with ${condition} taking ${medicines.join(', ')}. Mention any potential interactions or dietary advice.`;

  console.log("Starting Gemini Insight generation...");

  for (const modelName of MODEL_FALLBACKS) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text) {
        console.log(`Successfully used model: ${modelName}`);
        return text;
      }
    } catch (error: any) {
      if (error.message?.includes('404')) {
        console.warn(`Model ${modelName} returned 404 (Not Found).`);
        continue;
      }
      console.error(`Gemini Error with ${modelName}:`, error.message);
      return `AI Assistant Error: ${error.message}`;
    }
  }
  return "AI Assistant Error: No compatible models found. Please check your API key permissions in Google AI Studio.";
};

export const validatePrescriptionAI = async (prescriptionData: any) => {
  if (DISABLE_AI) {
    return { isValid: true, warning: "AI validation disabled.", suggestion: "Enable in geminiService.ts" };
  }

  if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY' || API_KEY.trim() === '') {
    return { isValid: true, warning: "Validation skipped.", suggestion: "AI configuration missing." };
  }

  const prompt = `Review this prescription: Paracetamol: ${prescriptionData.paracetamol}, Azithromycin: ${prescriptionData.azithromycin}, Revital: ${prescriptionData.revital}. Is this a standard combination for common ailments? Answer with a JSON object: { "isValid": boolean, "warning": "string", "suggestion": "string" }`;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr || '{}');
    } catch (error: any) {
      if (error.message?.includes('404')) continue;
      console.error(`Gemini Validation Error (${modelName}):`, error.message);
      break;
    }
  }
  return { isValid: true, warning: "Validation skipped.", suggestion: "System busy or model error." };
};