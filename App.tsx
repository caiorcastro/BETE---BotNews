
import React, { useState, useEffect, useCallback } from 'react';
import { Feed, Article } from './types';
import { INITIAL_FEEDS } from './constants';
import { fetchArticles as fetchLiveArticles } from './services/rssService';
import Header from './components/Header';
import FeedManager from './components/FeedManager';
import ArticleList from './components/ArticleList';
import ChatBot from './components/ChatBot';
import ArticleControls from './components/ArticleControls';

export default function App() {
  const [feeds, setFeeds] = useState<Feed[]>(INITIAL_FEEDS);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChatBotOpen, setIsChatBotOpen] = useState<boolean>(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // State for controls
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRelevance, setSelectedRelevance] = useState<string[]>([]);
  const [filterByCompetitors, setFilterByCompetitors] = useState<boolean>(false);
  const [feedCounts, setFeedCounts] = useState<Record<string, number>>({});


  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const fetchedArticles = await fetchLiveArticles(feeds);
        // Sort by date descending
        fetchedArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setArticles(fetchedArticles);

        // Calculate counts for each feed
        const counts: Record<string, number> = {};
        feeds.forEach(feed => {
            counts[feed.name] = 0;
        });
        fetchedArticles.forEach(article => {
            if (counts[article.source] !== undefined) {
                counts[article.source]++;
            }
        });
        setFeedCounts(counts);

    } catch (err) {
        console.error("Error fetching articles:", err);
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Falha ao buscar artigos. Um erro desconhecido ocorreu.");
        }
    } finally {
        setIsLoading(false);
    }
  }, [feeds]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    let currentArticles = articles;

    // 1. Filter by selected feed
    if (selectedFeed !== 'all') {
      currentArticles = currentArticles.filter(article => article.source === selectedFeed);
    }

    // 2. Filter by search term (case-insensitive)
    if (searchTerm) {
        currentArticles = currentArticles.filter(article => 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // 3. Filter by date range
    if (startDate) {
        // Create date in local timezone to avoid UTC interpretation issues
        const [year, month, day] = startDate.split('-').map(Number);
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        currentArticles = currentArticles.filter(article => new Date(article.date) >= start);
    }
    if (endDate) {
        // Create date in local timezone to avoid UTC interpretation issues
        const [year, month, day] = endDate.split('-').map(Number);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        currentArticles = currentArticles.filter(article => new Date(article.date) <= end);
    }
    
    // 4. Filter by relevance
    if (selectedRelevance.length > 0) {
        currentArticles = currentArticles.filter(article => selectedRelevance.includes(article.relevance));
    }

    // 5. Filter by competitors
    if (filterByCompetitors) {
        currentArticles = currentArticles.filter(article => article.competitors && article.competitors.length > 0);
    }

    setFilteredArticles(currentArticles);
  }, [selectedFeed, articles, searchTerm, startDate, endDate, selectedRelevance, filterByCompetitors]);

  const addFeed = (name: string, url: string) => {
    if (name && url && !feeds.some(feed => feed.url === url)) {
      const newFeed: Feed = { id: Date.now().toString(), name, url };
      setFeeds(prevFeeds => [...prevFeeds, newFeed]);
    }
  };

  const handleAnalyzeArticle = (article: Article) => {
    setInitialChatPrompt(`Por favor, forneça um resumo conciso e uma análise do seguinte artigo para um executivo:\n\nTítulo: "${article.title}"\nDescrição: "${article.description}"`);
    setIsChatBotOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4 xl:w-1/5">
            <FeedManager
              feeds={feeds}
              selectedFeed={selectedFeed}
              setSelectedFeed={setSelectedFeed}
              addFeed={addFeed}
              feedCounts={feedCounts}
            />
          </aside>
          <section className="flex-1">
            <ArticleControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onRefresh={fetchArticles}
                filteredArticles={filteredArticles}
                selectedRelevance={selectedRelevance}
                setSelectedRelevance={setSelectedRelevance}
                filterByCompetitors={filterByCompetitors}
                setFilterByCompetitors={setFilterByCompetitors}
            />
            <ArticleList
              articles={filteredArticles}
              isLoading={isLoading}
              onAnalyzeArticle={handleAnalyzeArticle}
              error={error}
            />
          </section>
        </div>
      </main>
      <ChatBot 
        isOpen={isChatBotOpen} 
        setIsOpen={setIsChatBotOpen} 
        initialPrompt={initialChatPrompt}
        setInitialPrompt={setInitialChatPrompt}
      />
    </div>
  );
}