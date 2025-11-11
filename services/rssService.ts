
import { Feed, Article } from '../types';

// Use a CORS proxy to fetch feeds from the client-side.
// This is suitable for a demo/prototype. For production, a dedicated backend is recommended.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const parseRSS = (xmlString: string, feedName: string): Article[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const articles: Article[] = [];

    // Handle parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        console.error(`Error parsing XML for feed ${feedName}:`, parseError.textContent);
        return []; // Return empty array if XML is malformed
    }
    
    const items = doc.querySelectorAll('item, entry');

    items.forEach(item => {
        const title = item.querySelector('title')?.textContent?.trim() || 'No title';
        const link = item.querySelector('link')?.getAttribute('href') || item.querySelector('link')?.textContent || '#';
        
        // Sanitize description from HTML tags
        let description = item.querySelector('description')?.textContent || item.querySelector('content')?.textContent || '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        description = tempDiv.textContent || tempDiv.innerText || '';

        const dateString = item.querySelector('pubDate')?.textContent || item.querySelector('updated')?.textContent || new Date().toISOString();
        
        articles.push({
            id: `${feedName}-${link}-${title}`,
            title,
            link,
            description: description.substring(0, 250) + (description.length > 250 ? '...' : ''), // Truncate description
            date: new Date(dateString).toISOString(),
            source: feedName,
        });
    });

    return articles;
}


export const fetchAndParseRss = async (feed: Feed): Promise<Article[]> => {
    try {
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feed.url)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch feed ${feed.name}: ${response.statusText}`);
        }
        const xmlString = await response.text();
        return parseRSS(xmlString, feed.name);
    } catch (error) {
        console.error(`Error processing feed ${feed.name}:`, error);
        return []; // Return empty array for this feed on error, so other feeds can still load
    }
};

export const fetchArticles = async (feeds: Feed[]): Promise<Article[]> => {
    console.log("Fetching live articles for feeds:", feeds);
    
    const allArticlePromises = feeds.map(feed => fetchAndParseRss(feed));
    
    const results = await Promise.allSettled(allArticlePromises);

    let allArticles: Article[] = [];
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allArticles = [...allArticles, ...result.value];
        }
    });

    return allArticles;
};
