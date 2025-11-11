import { Feed } from './types';

export const INITIAL_FEEDS: Feed[] = [
  // Categoria 1: Notícias da Indústria de Bets
  { id: '1', name: 'BNL Data', url: 'https://www.bnldata.com.br/feed/' },
  { id: '2', name: 'Games Magazine Brasil', url: 'https://gamesbras.com/rss' },
  { id: '3', name: 'iGaming Brazil', url: 'https://igamingbrazil.com/feed/' },
  { id: '4', name: 'SBC Notícias', url: 'https://sbcnoticias.com/feed/' },

  // Categoria 2: Marketing e Negócios do Esporte
  { id: '5', name: 'Máquina do Esporte', url: 'https://maquinadoesporte.com.br/feed/' },
  { id: '6', name: 'MKT Esportivo', url: 'https://www.mktesportivo.com/feed/' },
  { id: '7', name: 'Propmark', url: 'https://propmark.com.br/feed/' },
  { id: '8', name: 'Janela Publicitária', url: 'https://www.janela.com.br/feed/' },

  // Categoria 3: Política, Leis e Economia
  { id: '9', name: 'JOTA', url: 'https://www.jota.info/feed' },
  { id: '10', name: 'Valor Econômico', url: 'https://valor.globo.com/rss/' },
  { id: '11', name: 'Exame', url: 'https://exame.com/feed/' },
  { id: '12', name: 'Conjur', url: 'https://www.conjur.com.br/feed.xml' },

  // Categoria 4: Grandes Portais Esportivos
  { id: '13', name: 'Globo Esporte', url: 'https://ge.globo.com/rss/ge/' },
  { id: '14', name: 'ESPN Brasil', url: 'https://www.espn.com.br/rss' },
  { id: '15', name: 'Lance!', url: 'https://www.lance.com.br/feed' },
  { id: '16', name: 'UOL Esporte', url: 'http://rss.esporte.uol.com.br/ultimas/' },
];
