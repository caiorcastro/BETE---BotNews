
import React from 'react';
import { Article } from '../types';

interface ArticleListProps {
  articles: Article[];
  isLoading: boolean;
  onAnalyzeArticle: (article: Article) => void;
  error: string | null;
}

const RelevanceBadge: React.FC<{ relevance: 'High' | 'Medium' | 'Low'; reason: string }> = ({ relevance, reason }) => {
  const relevanceClasses = {
    High: 'bg-[#4B1D1F] text-red-500',
    Medium: 'bg-[#4A2E10] text-amber-500',
    Low: 'bg-[#1E2E4B] text-blue-500',
  };

  return (
    <span
      title={reason}
      className={`px-2 py-1 text-xs font-bold rounded ${relevanceClasses[relevance]}`}
    >
      {relevance.toUpperCase()}
    </span>
  );
};

const CompetitorTag: React.FC<{ name: string }> = ({ name }) => (
  <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">
    {name}
  </span>
);

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
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold uppercase text-primary tracking-wider truncate pr-2">{article.source}</span>
          <span className="text-gray-400 flex-shrink-0">{formatDate(article.date)}</span>
        </div>
        <div className="mb-2">
           <RelevanceBadge relevance={article.relevance} reason={article.reason} />
        </div>
        <h3 className="text-lg font-bold font-display text-white mb-2 leading-tight">
           <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {article.title}
           </a>
        </h3>
        <p className="text-sm text-gray-400 line-clamp-4 flex-grow">
          {article.description}
        </p>

        {article.competitors && article.competitors.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-gray-500">Concorrentes:</span>
                {article.competitors.map(c => <CompetitorTag key={c} name={c} />)}
            </div>
          </div>
        )}
      </div>
      <div className="bg-card-footer-dark px-5 py-3 text-right mt-auto">
        <button onClick={onAnalyze} className="text-sm font-bold text-primary hover:underline">
          Analisar →
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
        <div className="text-center py-10 bg-card-dark rounded-lg">
             <div className="flex justify-center items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-300">BETE está caçando notícias...</h3>
            <p className="text-gray-400 mt-2">Analisando e classificando artigos com a IA Gemini.</p>
        </div>
      );
    }

    if (error) {
         return (
            <div className="text-center py-20 bg-card-dark rounded-lg">
                <span className="material-icons text-5xl text-red-500">error_outline</span>
                <h3 className="mt-4 text-xl font-semibold text-gray-300">Falha ao Carregar as Fontes</h3>
                <p className="text-gray-400 mt-2">{error}</p>
            </div>
        );
    }
  
    if (articles.length === 0) {
      return (
        <div className="text-center py-20 bg-card-dark rounded-lg">
          <span className="material-icons text-5xl text-gray-600">inbox</span>
          <h3 className="mt-4 text-xl font-semibold text-gray-300">Nenhum Artigo Relevante Encontrado</h3>
          <p className="text-gray-400 mt-2">Ajuste os filtros ou aguarde novas notícias. BETE não encontrou nada com os critérios atuais.</p>
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
