import { GoogleGenAI } from "@google/genai";

async function verifyApiKey(apiKey: string | undefined) {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Gemini API key is required");
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = await ai.models.list();

  console.log("Available models:", models);
}

export default verifyApiKey;
