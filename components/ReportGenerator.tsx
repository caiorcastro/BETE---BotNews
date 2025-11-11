
import React, { useState, useMemo } from 'react';
import { Article } from '../types';
import { generateMarkdownReport } from '../services/geminiService';

interface ReportGeneratorProps {
  articles: Article[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ articles }) => {
  const [timeFilter, setTimeFilter] = useState<string>('24h');
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  const timeFilterOptions = {
    '24h': 'Últimas 24 horas',
    '7d': 'Últimos 7 dias',
    '15d': 'Últimos 15 dias',
    '30d': 'Últimos 30 dias',
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setHasGenerated(true);
    setGeneratedReport('Gerando relatório, por favor aguarde...');
    try {
      const periodText = timeFilterOptions[timeFilter];
      const report = await generateMarkdownReport(filteredArticles, periodText);
      setGeneratedReport(report);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      console.error("Report generation failed:", err);
      setGeneratedReport(`Falha ao gerar relatório.\n\nCausa: ${errorMessage}\n\nPor favor, verifique o console para mais detalhes e tente novamente.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedReport || generatedReport.startsWith('Falha')) return;

    const blob = new Blob([generatedReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `Relatorio_BETMGM_${date}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredArticles = useMemo(() => {
    const now = new Date();
    let hoursToGoBack = 24;
    if (timeFilter === '7d') hoursToGoBack = 7 * 24;
    if (timeFilter === '15d') hoursToGoBack = 15 * 24;
    if (timeFilter === '30d') hoursToGoBack = 30 * 24;

    const filterDate = new Date(now.getTime() - hoursToGoBack * 60 * 60 * 1000);

    return articles.filter(article => new Date(article.date) >= filterDate);
  }, [articles, timeFilter]);

  const reportFailed = generatedReport.startsWith('Falha');

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Gerador de Relatórios</h2>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <label htmlFor="timeFilter" className="text-gray-300">Período:</label>
        <select
          id="timeFilter"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2"
        >
          {Object.entries(timeFilterOptions).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating || filteredArticles.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Gerando...' : `Gerar Relatório (${filteredArticles.length} artigos)`}
        </button>
      </div>

      {hasGenerated && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-white mb-2">Resultado</h3>
          <textarea
            readOnly
            value={generatedReport}
            className={`w-full h-96 bg-gray-900 p-4 rounded-md border font-mono text-sm ${
              reportFailed ? 'text-red-400 border-red-500' : 'text-gray-200 border-gray-700'
            }`}
          />
          <button
            onClick={handleDownload}
            disabled={!generatedReport || isGenerating || reportFailed}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Download .md
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
