
import React, { useState, useEffect, useCallback } from 'react';
import { Feed, Article } from './types';
import { INITIAL_FEEDS } from './constants';
import { fetchArticles as fetchLiveArticles } from './services/rssService';
import Header from './components/Header';
import FeedManager from './components/FeedManager';
import ArticleList from './components/ArticleList';
import ChatBot from './components/ChatBot';
import ArticleControls from './components/ArticleControls';
import LandingPage from './components/LandingPage';

export default function App() {
  // Check localStorage for an existing session on initial load
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // State for the main application
  const [feeds, setFeeds] = useState<Feed[]>(INITIAL_FEEDS);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChatBotOpen, setIsChatBotOpen] = useState<boolean>(false);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRelevance, setSelectedRelevance] = useState<string[]>([]);
  const [filterByCompetitors, setFilterByCompetitors] = useState<boolean>(false);
  const [feedCounts, setFeedCounts] = useState<Record<string, number>>({});
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);

  const handleLoginSuccess = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    // Optional: Reset state on logout
    setArticles([]);
    setFilteredArticles([]);
  };

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setArticles([]);
    setFeedCounts({});
    
    const initialCounts: Record<string, number> = {};
    feeds.forEach(feed => {
        initialCounts[feed.name] = 0;
    });
    setFeedCounts(initialCounts);

    const handleNewArticles = (newlyClassifiedArticles: Article[]) => {
        if (newlyClassifiedArticles.length > 0) {
            setArticles(prevArticles => {
                const updated = [...prevArticles, ...newlyClassifiedArticles];
                updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                return updated;
            });
            setFeedCounts(prevCounts => {
                const newCounts = { ...prevCounts };
                newlyClassifiedArticles.forEach(article => {
                    newCounts[article.source] = (newCounts[article.source] || 0) + 1;
                });
                return newCounts;
            });
        }
    };

    try {
        await fetchLiveArticles(feeds, handleNewArticles);
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
    if (isAuthenticated) {
        fetchArticles();
    }
  }, [isAuthenticated, fetchArticles]);

  useEffect(() => {
    if (!isAuthenticated) return;
  
    let timerId: number;
  
    const scheduleNextRefresh = () => {
      const now = new Date();
      // Horários: 8:30, 12:00, 16:30
      const schedule = [8.5, 12, 16.5]; 
  
      const getNextScheduledTime = () => {
        for (const hour of schedule) {
          const targetTime = new Date();
          targetTime.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
          if (targetTime > now) {
            return targetTime;
          }
        }
        // Se todos os horários de hoje já passaram, agenda para o primeiro de amanhã
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const firstHour = schedule[0];
        tomorrow.setHours(Math.floor(firstHour), (firstHour % 1) * 60, 0, 0);
        return tomorrow;
      };
  
      const nextTime = getNextScheduledTime();
      setNextRefresh(nextTime);
  
      const delay = nextTime.getTime() - now.getTime();
  
      timerId = window.setTimeout(() => {
        console.log(`Automatic refresh triggered at ${new Date().toLocaleTimeString()}`);
        fetchArticles();
        scheduleNextRefresh(); // Reagenda para o próximo horário
      }, delay);
    };
  
    scheduleNextRefresh();
  
    return () => clearTimeout(timerId);
  
  }, [isAuthenticated, fetchArticles]);

  useEffect(() => {
    let currentArticles = articles;
    if (selectedFeed !== 'all') {
      currentArticles = currentArticles.filter(article => article.source === selectedFeed);
    }
    if (searchTerm) {
        currentArticles = currentArticles.filter(article => 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!isAuthenticated) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
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
                onRefresh={fetchArticles}
                filteredArticles={filteredArticles}
                selectedRelevance={selectedRelevance}
                setSelectedRelevance={setSelectedRelevance}
                filterByCompetitors={filterByCompetitors}
                setFilterByCompetitors={setFilterByCompetitors}
                nextRefresh={nextRefresh}
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
