
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, ChatMessageAuthor, ChatMode, GroundingSource } from "../types";

// IMPORTANT: This service is a mock. It simulates Gemini API calls.
// In a real application, replace the mock logic with actual API calls.
// The API key is assumed to be available via process.env.API_KEY.

let ai: GoogleGenAI | null = null;
try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

let chatInstance: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!ai) {
        throw new Error("Gemini AI not initialized. Please provide an API key.");
    }
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: [],
        });
    }
    return chatInstance;
};

export const getGeminiResponse = async (
    prompt: string, 
    mode: ChatMode, 
    history: ChatMessage[]
): Promise<{ text: string, sources?: GroundingSource[] }> => {

    if (!process.env.API_KEY || !ai) {
        console.warn("API_KEY not found. Using mock response.");
        await new Promise(res => setTimeout(res, 1500));
        
        let mockText = `This is a mock response for your prompt: "${prompt}" in ${mode} mode. `;
        if(mode === ChatMode.GROUNDED) {
            return {
                text: mockText + "I have found some sources for you from the web.",
                sources: [
                    { title: "Mock Source 1: Industry News", uri: "#"},
                    { title: "Mock Source 2: Market Analysis", uri: "#"}
                ]
            }
        }
        return { text: mockText };
    }

    try {
        switch (mode) {
            case ChatMode.FLASH:
                // Using a simplified chat history for this mode
                const chat = getChatInstance();
                const result = await chat.sendMessage({ message: prompt });
                return { text: result.text };

            case ChatMode.GROUNDED:
                const groundedResponse = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        tools: [{googleSearch: {}}],
                    },
                });

                const groundingChunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
                const sources = groundingChunks
                    .filter(chunk => chunk.web)
                    .map(chunk => ({
                        uri: chunk.web.uri,
                        title: chunk.web.title,
                    })) as GroundingSource[];
                
                return { text: groundedResponse.text, sources: sources.length > 0 ? sources : undefined };

            case ChatMode.THINKING:
                const thinkingResponse = await ai.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: prompt,
                    config: {
                        thinkingConfig: { thinkingBudget: 32768 },
                    },
                });
                return { text: thinkingResponse.text };

            default:
                throw new Error(`Unknown chat mode: ${mode}`);
        }
    } catch (error) {
        console.error(`Error fetching Gemini response in ${mode} mode:`, error);
        return { text: `An error occurred while trying to get a response. Please check the console for details.` };
    }
};
