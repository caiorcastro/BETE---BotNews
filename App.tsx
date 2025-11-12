
import React, { useState, useEffect, useCallback } from 'react';
import { Feed, Article } from './types';
import { INITIAL_FEEDS } from './constants';
import Header from './components/Header';
import FeedManager from './components/FeedManager';
import ArticleList from './components/ArticleList';
import ChatBot from './components/ChatBot';
import ArticleControls from './components/ArticleControls';
import LandingPage from './components/LandingPage';
import { supabase } from './services/supabase';
import { fetchArticles } from './services/rssService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [feeds, setFeeds] = useState<Feed[]>(INITIAL_FEEDS);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState<boolean>(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRelevance, setSelectedRelevance] = useState<string[]>([]);
  const [filterByCompetitors, setFilterByCompetitors] = useState<boolean>(false);
  const [feedCounts, setFeedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setArticles([]);
        setFilteredArticles([]);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  const handleRefresh = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      setArticles([]);
      setFilteredArticles([]);
      setFeedCounts({});
      
      try {
          const fetchedArticles = await fetchArticles(feeds);

          const uniqueArticles = Array.from(new Map(fetchedArticles.map(item => [item.id, item])).values())
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setArticles(uniqueArticles);

          const counts: Record<string, number> = {};
          feeds.forEach(feed => { counts[feed.name] = 0; });
          uniqueArticles.forEach(article => {
              if (counts[article.source] !== undefined) {
                  counts[article.source]++;
              }
          });
          setFeedCounts(counts);
          setError(null);

      } catch (error) {
          console.error("Error during refresh:", error);
          setError(error instanceof Error ? error.message : "Ocorreu um erro desconhecido durante a atualização.");
      } finally {
          setIsLoading(false);
      }
  }, [feeds]);


  useEffect(() => {
    if (isAuthenticated) {
        handleRefresh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    let currentArticles = articles;
    if (selectedFeed !== 'all') {
      currentArticles = currentArticles.filter(article => article.source === selectedFeed);
    }
    if (searchTerm) {
        currentArticles = currentArticles.filter(article => 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    if (startDate) {
        const [year, month, day] = startDate.split('-').map(Number);
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        currentArticles = currentArticles.filter(article => new Date(article.date) >= start);
    }
    if (endDate) {
        const [year, month, day] = endDate.split('-').map(Number);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        currentArticles = currentArticles.filter(article => new Date(article.date) <= end);
    }
    if (selectedRelevance.length > 0) {
        currentArticles = currentArticles.filter(article => 
            article.relevance && selectedRelevance.includes(article.relevance.trim())
        );
    }
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

  if (isAuthenticated === null) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen">
      <Header onLogout={handleLogout} />
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
                onRefresh={handleRefresh}
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
       {isAuthenticated && !isChatBotOpen && (
          <button
            onClick={() => setIsChatBotOpen(true)}
            className="fixed bottom-6 right-6 bg-primary text-black rounded-full p-4 shadow-lg hover:scale-110 transition-transform z-30 animate-pulse"
            aria-label="Abrir Chat com Gemini"
            title="Abrir Chat com Gemini"
          >
            <span className="material-icons text-2xl">chat</span>
          </button>
        )}
    </div>
  );
}
