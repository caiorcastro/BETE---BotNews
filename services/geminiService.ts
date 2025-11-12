
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, ChatMessageAuthor, ChatMode, GroundingSource, Article } from "../types";

let ai: GoogleGenAI | null = null;
const apiKey = import.meta.env.VITE_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }
} else {
  console.warn("VITE_API_KEY not found in .env file. Please add it to use Gemini features.");
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

5.  **OUTPUT:** Your response MUST be a single, raw JSON object and nothing else. It should start with \{ and end with \}. The JSON object must have one key: "articles". The value must be an array of article objects. If no articles are relevant, return an empty array.
`;

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
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: classificationSystemPrompt,
      },
    });
    
    const textResponse = response.text;
    
    // Find the start and end of the JSON object
    const startIndex = textResponse.indexOf('{');
    const endIndex = textResponse.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      throw new Error("Could not find a valid JSON object in the response.");
    }
    
    const jsonText = textResponse.substring(startIndex, endIndex + 1);

    const result = JSON.parse(jsonText);
    return result.articles as Article[];
  } catch (error) {
      console.error("Error in Gemini classification:", error);
      throw new Error("Failed to classify articles using Gemini AI.");
  }
};

// --- REPORT GENERATION ENGINE ---

const reportSystemPrompt = `
You are a top-tier market intelligence analyst for BETMGM, preparing a high-level executive summary for leadership.
Your task is to synthesize a list of classified news articles into a concise, insightful, and well-structured Markdown report.

**Report Structure and Formatting Rules:**

1.  **Main Title:** Start with a main title, e.g., "# Relatório de Inteligência de Mercado".
2.  **Subtitle:** Add a subtitle indicating the time period covered, e.g., "## Período: Últimos 7 dias".
3.  **Executive Summary (TL;DR):**
    *   Begin with a section "### 🚀 Resumo Executivo (TL;DR)".
    *   Write 3-5 bullet points summarizing the most critical information and key trends from the provided articles. Focus on what a C-level executive needs to know immediately.
4.  **Key Insights by Relevance:**
    *   Structure the main body with sections for each relevance level found in the articles.
    *   Use the following headers: "### 🔴 Alta Relevância", "### 🟡 Média Relevância", "### 🔵 Baixa Relevância".
    *   Only include a relevance section if there are articles for it.
5.  **Article Summaries:**
    *   Under each relevance heading, list the articles.
    *   For each article, create a single, concise paragraph that:
        *   Starts with the article title in bold: **[Article Title]**.
        *   Briefly summarizes the key information.
        *   Mentions any competitors involved.
        *   Ends with the source and date in italics: *([Source] - [Date])*.
    *   Example: "**Novo Patrocínio da Betano no Brasileirão.** A Betano fechou um acordo de patrocínio master com a Série A do Campeonato Brasileiro, aumentando significativamente sua visibilidade. A ação pressiona a BetMGM a reavaliar sua estratégia de marketing esportivo. * (SBC Notícias - 2024-10-28)*"
6.  **Tone and Style:**
    *   Be objective, analytical, and concise.
    *   Use professional language suitable for executives.
    *   The entire output MUST be in Brazilian Portuguese.
    *   The output MUST be a single string of valid Markdown.
`;

export const generateMarkdownReport = async (articles: Article[], period: string): Promise<string> => {
    if (!ai) {
        throw new Error("Gemini AI not initialized.");
    }
    if (articles.length === 0) {
        return "# Relatório de Inteligência de Mercado\n\nNenhum artigo relevante encontrado para o período selecionado.";
    }

    // Sort articles by relevance: High > Medium > Low
    const sortedArticles = [...articles].sort((a, b) => {
        const relevanceOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
    });

    const prompt = `
Here is the list of articles to be summarized in the report for the period "${period}":

${JSON.stringify(sortedArticles, null, 2)}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using Pro for higher quality summary
            contents: prompt,
            config: {
                systemInstruction: reportSystemPrompt,
                responseMimeType: 'text/plain',
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error in Gemini report generation:", error);
        throw new Error("Failed to generate report using Gemini AI.");
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
            model: 'gemini-2.5-pro',
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

    if (!apiKey || !ai) {
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
                    model: "gemini-2.5-pro",
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