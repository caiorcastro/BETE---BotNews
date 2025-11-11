
import React from 'react';
import { Article } from '../types';

interface ArticleControlsProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    onRefresh: () => void;
    filteredArticles: Article[];
}

const ArticleControls: React.FC<ArticleControlsProps> = ({
    searchTerm,
    setSearchTerm,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onRefresh,
    filteredArticles,
}) => {

    const handleExport = () => {
        if (filteredArticles.length === 0) {
            alert("No articles to export.");
            return;
        }
        const headers = ["Title", "Description", "Source", "Date", "Link"];
        const rows = filteredArticles.map(article => 
            [
                `"${article.title.replace(/"/g, '""')}"`,
                `"${article.description.replace(/"/g, '""')}"`,
                article.source,
                new Date(article.date).toLocaleString(),
                article.link
            ].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\r\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `betmgm_news_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ControlInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
        <input 
            {...props}
            className="bg-card-dark text-gray-300 placeholder-gray-500 border border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
        />
    );

    const ControlButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {icon: string}> = ({children, icon, ...props}) => (
         <button
            {...props}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors text-sm"
        >
            <span className="material-icons text-base">{icon}</span>
            {children}
        </button>
    );

    return (
        <div className="mb-6 p-4 bg-card-dark rounded-lg shadow-md flex flex-wrap items-center gap-4">
            <div className="flex-grow min-w-[200px] relative">
                <input
                    type="search"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
                 <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="start-date" className="text-sm text-gray-400">From:</label>
                <ControlInput id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
             <div className="flex items-center gap-2">
                <label htmlFor="end-date" className="text-sm text-gray-400">To:</label>
                <ControlInput id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 ml-auto">
                <ControlButton onClick={onRefresh} icon="refresh">Refresh Feeds</ControlButton>
                <ControlButton onClick={handleExport} icon="download">Export CSV</ControlButton>
            </div>
        </div>
    );
};

export default ArticleControls;
