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
        return [];
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
        const xmlString = await response.text();
        return parseRSS(xmlString, feed.name);
    } catch (error) {
        console.error(`Error processing feed ${feed.name}:`, error);
        return [];
    }
};

export const fetchArticles = async (feeds: Feed[]): Promise<Article[]> => {
    console.log("Fetching and classifying articles from feeds in parallel...");

    const classificationPromises = feeds.map(async (feed) => {
        const rawArticles = await fetchAndParseRss(feed);
        if (rawArticles.length === 0) {
            return [];
        }
        console.log(`-> Found ${rawArticles.length} raw articles from ${feed.name}. Classifying...`);
        return classifyAndFilterArticles(rawArticles);
    });

    const results = await Promise.allSettled(classificationPromises);

    const allClassifiedArticles: Article[] = [];
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allClassifiedArticles.push(...result.value);
        } else {
            console.error(`Error classifying articles for feed ${feeds[index].name}:`, result.reason);
        }
    });

    console.log(`Finished classification. Total relevant articles: ${allClassifiedArticles.length}`);
    return allClassifiedArticles;
};