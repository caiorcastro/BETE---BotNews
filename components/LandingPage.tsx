
import React from 'react';
import Auth from './Auth';

const FeatureCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-card-dark p-6 rounded-lg border border-gray-800 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
        <span className="material-icons text-primary text-5xl mb-4 inline-block">{icon}</span>
        <h3 className="font-display text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{children}</p>
    </div>
);


const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-dark">
      <header className="bg-[#1a1a1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                    <span className="material-icons text-primary text-3xl">newspaper</span>
                    <h1 className="text-xl font-display font-bold text-white tracking-wider">BETE</h1>
                </div>
                <div className="text-sm text-gray-400 font-semibold">
                    Artplan
                </div>
            </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 lg:py-32 px-4 overflow-hidden">
             <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background-dark"></div>
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-5 gap-16 items-center">
                    <div className="lg:col-span-3 text-center lg:text-left">
                         <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white leading-tight tracking-tighter">
                            <span className="block">Inteligência de Mercado para</span>
                            <span className="text-primary">iGaming & Sportsbook.</span>
                        </h1>
                        <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-gray-300">
                            Análise estratégica para a BetMGM.
                        </h2>
                        <p className="mt-8 text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0">
                            BETE é sua analista de IA dedicada, rastreando notícias, concorrentes e a regulamentação do mercado de apostas no Brasil para transformar dados em decisões estratégicas.
                        </p>
                    </div>
                    <div className="lg:col-span-2 max-w-md mx-auto lg:mx-0 w-full lg:justify-self-end">
                        <Auth />
                    </div>
                </div>
            </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-[#0a0a0a]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">Uma Plataforma, Vantagem Completa</h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                        Ferramentas projetadas para fornecer a inteligência que você precisa para se manter à frente.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon="query_stats" title="Agregação Inteligente">
                        Monitoramos dezenas de fontes de notícias relevantes em tempo real para que você não precise fazer isso.
                    </FeatureCard>
                    <FeatureCard icon="smart_toy" title="Classificação com IA">
                        O Gemini analisa e classifica cada artigo por relevância e identifica menções a concorrentes, economizando seu tempo.
                    </FeatureCard>
                    <FeatureCard icon="dashboard_customize" title="Painel Intuitivo">
                        Filtre, pesquise e analise as notícias com controles avançados. Exporte relatórios em CSV para análises offline.
                    </FeatureCard>
                    <FeatureCard icon="chat" title="Chat com Gemini">
                        Aprofunde-se em qualquer notícia. Peça resumos, análises ou informações adicionais ao chatbot integrado.
                    </FeatureCard>
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-[#1a1a1a] py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} BETE - BETMGM Feed Intelligence. Desenvolvido por Artplan.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;