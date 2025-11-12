
import { Feed, Article } from '../types';
import { classifyAndFilterArticles } from './geminiService';

const CORS_PROXY = 'https://corsproxy.io/?';

const parseRSS = (xmlString: string, feedName: string): Omit<Article, 'relevance' | 'reason' | 'competitors'>[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const articles: Omit<Article, 'relevance' | 'reason' | 'competitors'>[] = [];

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        console.error(`Error parsing XML for feed ${feedName}:`, parseError.textContent);
        const cleanedXmlString = xmlString.replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');
        const cleanedDoc = parser.parseFromString(cleanedXmlString, 'application/xml');
        const newParseError = cleanedDoc.querySelector('parsererror');
        if (newParseError) {
            console.error(`Still failed to parse XML for ${feedName} after cleaning.`);
            return [];
        }
        doc.documentElement.innerHTML = cleanedDoc.documentElement.innerHTML; 
    }
    
    const items = doc.querySelectorAll('item, entry');

    items.forEach(item => {
        const title = item.querySelector('title')?.textContent?.trim() || 'No title';
        const link = item.querySelector('link')?.getAttribute('href') || item.querySelector('link')?.textContent || '#';
        
        const descriptionHTML = item.querySelector('description')?.textContent 
                           || item.querySelector('content')?.textContent 
                           || item.getElementsByTagName('content:encoded')[0]?.textContent 
                           || '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = descriptionHTML;
        let description = (tempDiv.textContent || tempDiv.innerText || '').trim();

        if (!description) {
            description = 'Sem resumo disponível.';
        }

        const dateString = item.querySelector('pubDate')?.textContent || item.querySelector('updated')?.textContent;
        let finalDate = new Date(); 

        if (dateString) {
            const parsedDate = new Date(dateString);
            if (!isNaN(parsedDate.getTime())) {
                finalDate = parsedDate;
            }
        }
        
        articles.push({
            id: `${feedName}-${link}-${title}`,
            title,
            link,
            description: description.substring(0, 300) + (description.length > 300 ? '...' : ''),
            date: finalDate.toISOString(),
            source: feedName,
        });
    });

    return articles;
}

export const fetchAndParseRss = async (feed: Feed): Promise<Omit<Article, 'relevance' | 'reason' | 'competitors'>[]> => {
    try {
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feed.url)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch feed ${feed.name}: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type') || '';
        let xmlString: string;

        if (contentType.toLowerCase().includes('iso-8859-1')) {
            const buffer = await response.arrayBuffer();
            const decoder = new TextDecoder('iso-8859-1');
            xmlString = decoder.decode(buffer);
        } else {
            xmlString = await response.text();
        }

        return parseRSS(xmlString, feed.name);
    } catch (error) {
        console.error(`Error processing feed ${feed.name}:`, error);
        return [];
    }
};

export const fetchArticles = async (feeds: Feed[]): Promise<Article[]> => {
    console.log("Fetching and classifying articles from all feeds in parallel...");

    const processingPromises = feeds.map(async (feed) => {
        try {
            const rawArticles = await fetchAndParseRss(feed);
            if (rawArticles.length === 0) {
                return []; // No articles found, not an error
            }
            console.log(`-> Found ${rawArticles.length} raw articles from ${feed.name}. Classifying...`);
            const classifiedArticles = await classifyAndFilterArticles(rawArticles);
            return classifiedArticles;
        } catch (error) {
            console.error(`Error processing feed ${feed.name} in parallel:`, error);
            // If one feed fails, we return an empty array for it but let others continue.
            return []; 
        }
    });

    try {
        const results = await Promise.all(processingPromises);
        const allArticles = results.flat(); // Flatten the array of arrays
        console.log(`Finished processing all feeds. Found ${allArticles.length} relevant articles.`);
        return allArticles;
    } catch (error) {
        console.error("A critical error occurred during parallel article processing:", error);
        // This catch block might be redundant if individual promises handle their errors,
        // but it's good for catching issues with Promise.all itself.
        if (error instanceof Error && error.message.includes("API key")) {
            throw new Error("A chave da API Gemini não é válida ou está faltando. Verifique a configuração.");
        }
        throw new Error(`Falha ao processar as fontes de notícias.`);
    }
};
