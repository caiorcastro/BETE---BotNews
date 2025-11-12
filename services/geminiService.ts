
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, ChatMessageAuthor, ChatMode, GroundingSource, Article } from "../types";
import { COMPETITOR_LIST } from "../constants";

let ai: GoogleGenAI | null = null;
let chatInstance: Chat | null = null;

// Helper function for lazy initialization of the AI client.
// This prevents initialization errors if the API key isn't immediately available on module load.
const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    if (process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return ai;
    }
    throw new Error("A chave da API Gemini não é válida ou está faltando. Verifique a configuração.");
};


// --- CHATBOT FUNCTIONALITY ---

const chatSystemInstruction = `
You are a specialized market intelligence analyst for the Brazilian iGaming and Sportsbook industry. 
Your knowledge is focused on market regulation, competitor activities, sponsorships, and technology trends related to online betting in Brazil.
Answer questions concisely, providing strategic insights based on the context of recent news. 
Do not answer questions outside of this scope. If asked about an unrelated topic, politely state that you are specialized in the Brazilian betting market.
`;

const getChatInstance = (): Chat => {
    const currentAi = getAiClient();
    if (!chatInstance) {
        chatInstance = currentAi.chats.create({
            model: 'gemini-2.5-flash', // Corrected model name based on new guidelines
            history: [],
            config: {
                systemInstruction: chatSystemInstruction,
            },
        });
    }
    return chatInstance;
};

export const getGeminiResponse = async (
    prompt: string, 
    mode: ChatMode, 
    history: ChatMessage[]
): Promise<{ text: string, sources?: GroundingSource[] }> => {

    try {
        const currentAi = getAiClient();

        switch (mode) {
            case ChatMode.FLASH:
                const chat = getChatInstance();
                const result = await chat.sendMessage({ message: prompt });
                return { text: result.text };

            case ChatMode.GROUNDED:
                const groundedResponse = await currentAi.models.generateContent({
                    model: "gemini-2.5-flash", // Corrected model name based on new guidelines
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
                const thinkingResponse = await currentAi.models.generateContent({
                    model: "gemini-2.5-pro",
                    contents: prompt,
                });
                return { text: thinkingResponse.text };
            
            default:
                throw new Error(`Invalid chat mode: ${mode}`);
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Propagate a more specific error message if available
        if (error instanceof Error && error.message.includes("API key")) {
             throw new Error("A chave da API Gemini não é válida. Por favor, verifique-a.");
        }
        throw new Error("Falha ao obter resposta do Gemini.");
    }
};


// --- ARTICLE CLASSIFICATION ---

const classificationSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        relevance: { 
            type: Type.STRING,
            enum: ['High', 'Medium', 'Low'],
            description: "A relevância da notícia para a indústria de apostas online e iGaming no Brasil. 'High' para notícias sobre regulamentação, grandes patrocínios, fusões/aquisições, ou atividades de concorrentes diretos. 'Medium' para notícias gerais do esporte que impactam o mercado. 'Low' para notícias não relacionadas."
        },
        reason: { 
            type: Type.STRING,
            description: 'Uma explicação concisa (máximo 15 palavras) para a classificação de relevância.'
        },
        competitors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Liste quais dos seguintes concorrentes são mencionados no artigo: ${COMPETITOR_LIST.join(', ')}. Se nenhum for mencionado, retorne um array vazio [].`
        }
      },
      required: ['id', 'relevance', 'reason', 'competitors']
    }
};

export const classifyAndFilterArticles = async (
    rawArticles: Omit<Article, 'relevance' | 'reason' | 'competitors'>[]
): Promise<Article[]> => {
    const currentAi = getAiClient();
    if (rawArticles.length === 0) {
        return [];
    }
    
    const articlesForPrompt = rawArticles.map(a => ({ 
        id: a.id, 
        title: a.title, 
        description: a.description 
    }));

    const prompt = `
        Analise a seguinte lista de artigos de notícias. Para cada artigo, determine sua relevância para o mercado brasileiro de apostas esportivas e iGaming, e identifique quaisquer concorrentes mencionados.

        Critérios de Relevância:
        - High: Notícias sobre regulamentação do mercado, grandes patrocínios de times/eventos, fusões e aquisições, lançamentos de grandes produtos, ou atividades diretas dos concorrentes listados.
        - Medium: Notícias gerais sobre o cenário esportivo (ex: resultados importantes, transferências) que podem influenciar o volume de apostas, ou notícias de tecnologia que podem impactar o setor.
        - Low: Notícias de esportes sem impacto direto no mercado de apostas, política geral, ou outros tópicos não relacionados.

        Concorrentes a serem identificados: ${COMPETITOR_LIST.join(', ')}

        Forneça a saída como um objeto JSON que corresponda ao esquema fornecido. Retorne apenas os artigos com relevância 'High' ou 'Medium'. Se nenhum artigo for relevante, retorne um array vazio.

        Artigos para análise:
        ${JSON.stringify(articlesForPrompt)}
    `;

    try {
        const response = await currentAi.models.generateContent({
            model: "gemini-2.5-flash", // Corrected model name based on new guidelines
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: classificationSchema,
            },
        });

        const jsonStr = response.text.trim();
        const classifiedData = JSON.parse(jsonStr) as { id: string; relevance: 'High' | 'Medium' | 'Low'; reason: string; competitors?: string[] }[];
        
        const classifiedArticlesMap = new Map(classifiedData.map(item => [item.id, item]));
        
        const mergedArticles: Article[] = [];
        for (const rawArticle of rawArticles) {
            const classification = classifiedArticlesMap.get(rawArticle.id);
            if (classification) {
                mergedArticles.push({
                    ...rawArticle,
                    relevance: classification.relevance,
                    reason: classification.reason,
                    competitors: classification.competitors || [],
                });
            }
        }
        
        return mergedArticles;

    } catch (error) {
        console.error("Error classifying articles with Gemini:", error);
        if (error instanceof Error && error.message.includes("API key")) {
             throw new Error("A chave da API Gemini não é válida. Por favor, verifique-a e atualize a página.");
        }
        throw new Error("Falha ao classificar artigos com a IA.");
    }
};
