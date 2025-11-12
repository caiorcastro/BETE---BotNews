
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, ChatMessageAuthor, ChatMode, GroundingSource, Article } from "../types";

let ai: GoogleGenAI | null = null;
try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// --- CORE AI CLASSIFICATION ENGINE ---

const classificationSystemPrompt = `
You are a top-tier market intelligence analyst for BETMGM, a major player in the Brazilian online betting (iGaming) industry.
Your sole task is to analyze a JSON list of news articles and return a new JSON list containing ONLY the articles that are relevant to BETMGM's interests.

**Your analysis must follow these strict rules:**

0.  **LANGUAGE:** You MUST discard any article that is not written in Brazilian Portuguese (pt-BR). This is your most important filtering rule. Do not include articles in English, Spanish, or any other language.

1.  **FILTERING:** After filtering by language, you MUST discard any article that is NOT DIRECTLY related to the following topics:
    *   **Industry & Regulation:** Betting/iGaming regulation in Brazil, licensing, compliance, taxes (SIGAP, etc.), government decrees (Ministério da Fazenda).
    *   **Competitors:** Any news about our main competitors.
    *   **Marketing & Sponsorship:** Competitor marketing campaigns, new sponsorships (especially football clubs), brand ambassadors, advertising news.
    *   **Product & Technology:** New features from competitors (apps, cashout, new betting types), payment methods (PIX), technology trends.
    *   **Market & Economy:** Market share data, revenue reports, economic projections for the betting sector in Brazil/LATAM.
    *   **Major Sports Business:** News about major football leagues (Brasileirão, Libertadores) that directly impacts betting or sponsorships.
    *   **STRICTLY IGNORE:** General sports news (match results, player injuries unless it's a massive market-moving event), celebrity gossip, general politics, and anything not directly tied to the business of betting.

2.  **CLASSIFICATION:** For each relevant article, you MUST assign a relevance level based on these criteria:
    *   **'High':** Immediate action/awareness required.
        *   Critical regulation changes (new laws, licensing lists, site blocks).
        *   Major moves by Top-Tier competitors (bet365, Betano, Stake, Sportingbet, Betfair).
        *   Major sponsorships (Série A clubs, Seleção Brasileira).
    *   **'Medium':** Important for monitoring.
        *   Moves by Mid-Tier/Emerging competitors.
        *   General marketing campaigns, influencer partnerships.
        *   Industry events (e.g., Brazilian iGaming Summit).
    *   **'Low':** Informative, good to know.
        *   General market trends, international news with potential future impact, minor product updates from smaller competitors.

3.  **COMPETITOR IDENTIFICATION:** If an article mentions any of these competitors, you MUST list their names in the 'competitors' array:
    *   **Top Tier:** bet365, Betano, Stake, Sportingbet, Betfair
    *   **Mid Tier:** Novibet, Betsson, F12.Bet, Parimatch, VBET
    *   **Emergentes:** Superbet, Multibet, Esportivabet, BetBoom, Brazino777

4.  **REASON (in Portuguese):** Provide a very brief, concise reason (max 15 words) **in Brazilian Portuguese** for your classification decision. Example: "Grande mudança na regulamentação de licenças." or "Novo patrocínio de concorrente Top-Tier."

5.  **OUTPUT:** You MUST return a single JSON object with one key: "articles". The value must be an array of article objects conforming to the provided JSON schema. If no articles are relevant, return an empty array.
`;

const classificationSchema = {
  type: Type.OBJECT,
  properties: {
    articles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          link: { type: Type.STRING },
          date: { type: Type.STRING },
          source: { type: Type.STRING },
          relevance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          reason: { type: Type.STRING },
          competitors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['id', 'title', 'description', 'link', 'date', 'source', 'relevance', 'reason'],
      },
    },
  },
};


export const classifyAndFilterArticles = async (
  rawArticles: Omit<Article, 'relevance' | 'reason' | 'competitors'>[]
): Promise<Article[]> => {
  if (!ai) {
    throw new Error("Gemini AI not initialized.");
  }
  if (rawArticles.length === 0) {
    return [];
  }

  const prompt = `Here is the list of articles to analyze:\n\n${JSON.stringify(rawArticles, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: classificationSystemPrompt,
        responseMimeType: 'application/json',
        responseSchema: classificationSchema,
      },
    });
    
    const jsonText = response.text;
    const result = JSON.parse(jsonText);
    return result.articles as Article[];
  } catch (error) {
      console.error("Error in Gemini classification:", error);
      throw new Error("Failed to classify articles using Gemini AI.");
  }
};


// --- CHATBOT FUNCTIONALITY ---

let chatInstance: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!ai) {
        throw new Error("Gemini AI not initialized. Please provide an API key.");
    }
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash-lite',
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
        
        let mockText = `Esta é uma resposta simulada para o seu prompt: "${prompt}" no modo ${mode}. `;
        if(mode === ChatMode.GROUNDED) {
            return {
                text: mockText + "Encontrei algumas fontes para você na web.",
                sources: [
                    { title: "Fonte Simulada 1: Notícias da Indústria", uri: "#"},
                    { title: "Fonte Simulada 2: Análise de Mercado", uri: "#"}
                ]
            }
        }
        return { text: mockText };
    }

    try {
        switch (mode) {
            case ChatMode.FLASH:
                const chat = getChatInstance();
                const result = await chat.sendMessage({ message: prompt });
                return { text: result.text };

            case ChatMode.GROUNDED:
                const groundedResponse = await ai.models.generateContent({
                    model: "gemini-2.5-flash-lite",
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
        return { text: `Ocorreu um erro ao tentar obter uma resposta. Por favor, verifique o console para detalhes.` };
    }
};
