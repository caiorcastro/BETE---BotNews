import { Feed } from './types';

export const INITIAL_FEEDS: Feed[] = [
  // Portais Brasileiros de iGaming (10)
  { id: '1', name: 'Games Magazine Brasil', url: 'https://gamesbras.com/rss' }, // Note: May fail intermittently due to Cloudflare
  { id: '2', name: 'BNL Data', url: 'https://www.bnldata.com.br/feed/' },
  { id: '3', name: 'iGaming Brazil', url: 'https://igamingbrazil.com/feed/' },
  { id: '4', name: 'SBC Notícias', url: 'https://sbcnoticias.com/feed/' },
  { id: '5', name: 'MKT Esportivo', url: 'https://www.mktesportivo.com/feed/' },
  { id: '6', name: 'Focus Brasil', url: 'https://focus.jor.br/feed/' }, // Changed to main feed
  { id: '7', name: 'Gaming365', url: 'https://gaming365.com.br/feed/' },
  { id: '8', name: 'Brasil247', url: 'https://www.brasil247.com/feed' }, // Changed to main feed, Gemini will filter
  { id: '9', name: 'Lance!', url: 'https://www.lance.com.br/feed' }, // Replaced Goal Brasil Apostas
  { id: '10', name: 'Conjur', url: 'https://www.conjur.com.br/feed.xml' }, // Replaced OneFootball

  // Portais de Notícias Gerais Brasileiros (5)
  { id: '11', name: 'Terra Esportes', url: 'https://www.terra.com.br/rss/Controller?channel=esportes' }, // Corrected URL
  { id: '12', name: 'UOL Esporte', url: 'https://esporte.uol.com.br/ultimas/rss.xml' }, // Corrected URL
  { id: '13', name: 'Globo Esporte', url: 'https://ge.globo.com/rss/ge/' },
  { id: '14', name: 'InfoMoney', url: 'https://www.infomoney.com.br/feed/' },
  { id: '15', name: 'Valor Econômico', url: 'https://valor.globo.com/rss/valor-economico/' }, // Corrected URL
  
  // Fontes Internacionais de iGaming (10)
  { id: '16', name: 'SBC News', url: 'https://sbcnews.co.uk/feed/' },
  { id: '17', name: 'iGaming Business', url: 'https://igamingbusiness.com/feed/' },
  { id: '18', name: 'EGR Global', url: 'https://egr.global/intel/feed/' },
  { id: '19', name: 'Gambling Insider', url: 'https://www.gamblinginsider.com/rss' }, // Corrected URL
  { id: '20', name: 'Yogonet LATAM', url: 'https://www.yogonet.com/latam/rss' }, // Corrected URL
  { id: '21', name: 'CalvinAyre', url: 'https://calvinayre.com/feed/' },
  { id: '22', name: 'G3 Newswire', url: 'https://g3newswire.com/feed/' },
  { id: '23', name: 'Casino Guru News', url: 'https://news.casino.guru/rss/list' }, // Note: May fail intermittently due to server issues (530 error)
  { id: '24', name: 'iGaming News', url: 'https://igamingnews.com/feed/' }, // Replaced Gambling.com
  { id: '25', name: 'Exame', url: 'https://exame.com/feed/' },

  // Fontes Governamentais e Regulatórias (5)
  { id: '26', name: 'Ministério da Fazenda', url: 'https://www.gov.br/fazenda/pt-br/canais_atendimento/imprensa/noticias/RSS' }, // Corrected URL
  { id: '27', name: 'Serpro', url: 'https://www.serpro.gov.br/menu/noticias/ultimas-noticias/RSS' }, // Corrected URL
  { id: '28', name: 'Senado Federal', url: 'https://www12.senado.leg.br/noticias/rss/senado-agencia' },
  { id: '29', name: 'Câmara dos Deputados', url: 'https://www.camara.leg.br/noticias/rss' }, // Corrected URL
  { id: '30', name: 'JOTA', url: 'https://www.jota.info/feed' },
];