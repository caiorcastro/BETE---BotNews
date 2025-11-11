
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
    selectedRelevance: string[];
    setSelectedRelevance: (relevance: string[]) => void;
    filterByCompetitors: boolean;
    setFilterByCompetitors: (filter: boolean) => void;
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
    selectedRelevance,
    setSelectedRelevance,
    filterByCompetitors,
    setFilterByCompetitors
}) => {

    const handleExport = () => {
        if (filteredArticles.length === 0) {
            alert("Nenhum artigo para exportar.");
            return;
        }
        const headers = ["Title", "Description", "Source", "Date", "Link", "Relevance", "Reason", "Competitors"];
        const rows = filteredArticles.map(article => 
            [
                `"${article.title.replace(/"/g, '""')}"`,
                `"${article.description.replace(/"/g, '""')}"`,
                article.source,
                new Date(article.date).toLocaleString('pt-BR'),
                article.link,
                article.relevance,
                `"${article.reason.replace(/"/g, '""')}"`,
                `"${article.competitors?.join(', ') || ''}"`
            ].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\r\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bete_news_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRelevanceToggle = (relevance: string) => {
        const currentIndex = selectedRelevance.indexOf(relevance);
        const newRelevance = [...selectedRelevance];
        if (currentIndex === -1) {
            newRelevance.push(relevance);
        } else {
            newRelevance.splice(currentIndex, 1);
        }
        setSelectedRelevance(newRelevance);
    };

    const setDateRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    };

    const ControlInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
        <input 
            {...props}
            className="bg-card-dark text-gray-300 placeholder-gray-500 border border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
        />
    );

    const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {icon: string}> = ({children, icon, ...props}) => (
         <button
            {...props}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors text-sm"
        >
            <span className="material-icons text-base">{icon}</span>
            {children}
        </button>
    );

    const RelevanceButton: React.FC<{level: string, selected: boolean, onToggle: () => void}> = ({level, selected, onToggle}) => {
        const styles: {[key: string]: { base: string, selected: string }} = {
            High: { base: 'border-red-500/50 hover:bg-red-500/20', selected: 'bg-red-500/20 text-red-400' },
            Medium: { base: 'border-amber-500/50 hover:bg-amber-500/20', selected: 'bg-amber-500/20 text-amber-400' },
            Low: { base: 'border-blue-500/50 hover:bg-blue-500/20', selected: 'bg-blue-500/20 text-blue-400' }
        };
        const style = styles[level];
        return (
            <button onClick={onToggle} className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${style.base} ${selected ? style.selected : 'text-gray-300'}`}>
                {level}
            </button>
        )
    };

    const DatePresetButton: React.FC<{days: number, label: string, onClick: (days: number) => void}> = ({days, label, onClick}) => (
        <button onClick={() => onClick(days)} className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
            {label}
        </button>
    );

    return (
        <div className="mb-6 p-4 bg-card-dark rounded-lg shadow-md flex flex-col gap-4">
            {/* Top row for main actions */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-grow min-w-[250px] relative">
                    <input
                        type="search"
                        placeholder="Buscar artigos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm text-gray-400">De:</label>
                    <ControlInput id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="text-sm text-gray-400">Até:</label>
                    <ControlInput id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <ActionButton onClick={onRefresh} icon="refresh">Atualizar Fontes</ActionButton>
                    <ActionButton onClick={handleExport} icon="download">Exportar CSV</ActionButton>
                </div>
            </div>
            
            {/* Bottom row for filters */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-400">Interesse:</span>
                    <RelevanceButton level="High" selected={selectedRelevance.includes('High')} onToggle={() => handleRelevanceToggle('High')} />
                    <RelevanceButton level="Medium" selected={selectedRelevance.includes('Medium')} onToggle={() => handleRelevanceToggle('Medium')} />
                    <RelevanceButton level="Low" selected={selectedRelevance.includes('Low')} onToggle={() => handleRelevanceToggle('Low')} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-400">Período:</span>
                    <DatePresetButton days={1} label="24h" onClick={setDateRange} />
                    <DatePresetButton days={7} label="7d" onClick={setDateRange} />
                    <DatePresetButton days={15} label="15d" onClick={setDateRange} />
                    <DatePresetButton days={30} label="30d" onClick={setDateRange} />
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => setFilterByCompetitors(!filterByCompetitors)}
                        className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                            filterByCompetitors ? 'bg-primary/20 text-primary' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                    >
                        <span className="material-icons text-sm">{filterByCompetitors ? 'check_box' : 'check_box_outline_blank'}</span>
                        Apenas Concorrentes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticleControls;
