import React, { useState } from 'react';
import { Feed } from '../types';

interface FeedManagerProps {
  feeds: Feed[];
  selectedFeed: string;
  setSelectedFeed: (feedName: string) => void;
  addFeed: (name: string, url: string) => void;
  feedCounts: Record<string, number>;
}

const FeedManager: React.FC<FeedManagerProps> = ({ feeds, selectedFeed, setSelectedFeed, addFeed, feedCounts }) => {
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    addFeed(newFeedName, newFeedUrl);
    setNewFeedName('');
    setNewFeedUrl('');
    setIsAdding(false);
  };

  const FeedItem: React.FC<{ name: string; isAll?: boolean; count?: number }> = ({ name, isAll = false, count }) => (
    <button
      onClick={() => setSelectedFeed(isAll ? 'all' : name)}
      className={`block w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
        (isAll && selectedFeed === 'all') || selectedFeed === name
          ? 'bg-primary/20 text-primary font-bold'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="truncate pr-2">{name}</span>
        {typeof count !== 'undefined' && (
          <span className="flex-shrink-0 text-xs text-gray-400 font-medium">{count}</span>
        )}
      </div>
    </button>
  );

  // Fix: Explicitly type the parameters in the `reduce` function to resolve a type inference issue.
  const totalCount = Object.values(feedCounts).reduce((sum: number, count: number) => sum + count, 0);

  return (
    <div className="bg-card-dark p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
        <h2 className="text-lg font-display font-bold text-white">Fontes de Notícias</h2>
        <button className="text-gray-400 hover:text-primary">
          <span className="material-icons text-xl">unfold_more</span>
        </button>
      </div>
      <nav className="space-y-1 text-sm">
        <FeedItem name="Todas as Fontes" isAll={true} count={totalCount} />
        {feeds.map(feed => (
          <FeedItem key={feed.id} name={feed.name} count={feedCounts[feed.name]} />
        ))}
      </nav>

      {isAdding ? (
        <form onSubmit={handleAddFeed} className="space-y-3 mt-6">
            <input
              type="text"
              placeholder="Nome da Fonte"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              required
            />
            <input
              type="url"
              placeholder="URL da Fonte"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              required
            />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full bg-primary hover:opacity-90 text-black font-semibold text-sm rounded-md py-2 transition-all"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm rounded-md py-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-md transition-colors text-sm"
        >
          <span className="material-icons text-base">add</span>
          Adicionar Nova Fonte
        </button>
      )}
    </div>
  );
};

export default FeedManager;