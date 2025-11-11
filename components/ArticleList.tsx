
import React from 'react';
import { Article } from '../types';

interface ArticleListProps {
  articles: Article[];
  isLoading: boolean;
  onAnalyzeArticle: (article: Article) => void;
  error: string | null;
}

const ArticleItem: React.FC<{ article: Article; onAnalyze: () => void }> = ({ article, onAnalyze }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card-dark rounded-lg shadow-md overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
      <div className="p-5 flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-primary tracking-wider">{article.source}</span>
          <span className="text-xs text-gray-400">{formatDate(article.date)}</span>
        </div>
        <h3 className="text-lg font-bold font-display text-white mb-2 leading-tight">
           <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {article.title}
           </a>
        </h3>
        <p className="text-sm text-gray-400 line-clamp-4">
          {article.description}
        </p>
      </div>
      <div className="bg-card-footer-dark px-5 py-3 text-right">
        <button onClick={onAnalyze} className="text-sm font-bold text-primary hover:underline">
          Analyze →
        </button>
      </div>
    </div>
  );
};

const SkeletonLoader: React.FC = () => (
    <div className="bg-card-dark rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/5"></div>
        </div>
        <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="bg-card-footer-dark px-5 py-3 h-11">
      </div>
    </div>
);

const ArticleList: React.FC<ArticleListProps> = ({ articles, isLoading, onAnalyzeArticle, error }) => {

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-live="polite" aria-busy="true">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonLoader key={i} />)}
        </div>
      );
    }

    if (error) {
         return (
            <div className="text-center py-20 bg-card-dark rounded-lg">
                <span className="material-icons text-5xl text-red-500">error_outline</span>
                <h3 className="mt-4 text-xl font-semibold text-gray-300">Failed to Load Feeds</h3>
                <p className="text-gray-400 mt-2">{error}</p>
            </div>
        );
    }
  
    if (articles.length === 0) {
      return (
        <div className="text-center py-20 bg-card-dark rounded-lg">
          <span className="material-icons text-5xl text-gray-600">inbox</span>
          <h3 className="mt-4 text-xl font-semibold text-gray-300">No Articles Found</h3>
          <p className="text-gray-400 mt-2">There are no articles for the selected filters.</p>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {articles.map(article => (
          <ArticleItem key={article.id} article={article} onAnalyze={() => onAnalyzeArticle(article)} />
        ))}
      </div>
    );
  }

  return (
    <div>
        {renderContent()}
    </div>
  );
};

export default ArticleList;