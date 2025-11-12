import { Feed } from './types';

// This combined list is de-duplicated from all user-provided sources.
// It has been cleaned to remove feeds that were causing persistent errors (404, 403, 530, parsing errors) and updated with correct URLs.
export const INITIAL_FEEDS: Feed[] = [
  // =======================================================================
  // == Portais Brasileiros de iGaming e Mídia Esportiva
  // =======================================================================
  { id: '2', name: 'BNL Data', url: 'https://www.bnldata.com.br/feed/' },
  { id: '3', name: 'iGaming Brazil', url: 'https://igamingbrazil.com/feed/' },
  { id: '4', name: 'SBC Notícias - BR', url: 'https://sbcnoticias.com/br/feed/' },
  { id: '5', name: 'MKT Esportivo', url: 'https://www.mktesportivo.com/feed/' },
  { id: '7', name: 'Gaming365', url: 'https://gaming365.com.br/feed/' },
  { id: '13', name: 'Globo Esporte', url: 'https://ge.globo.com/rss/ge/' },
  { id: '14', name: 'InfoMoney', url: 'https://www.infomoney.com.br/feed/' },
  { id: '16', name: 'Exame', url: 'https://exame.com/feed/' },
  { id: '17', name: 'Folha - Esporte', url: 'https://feeds.folha.uol.com.br/esporte/rss091.xml' },
  { id: '18', name: 'Folha - Em Cima da Hora', url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml' },
  { id: '19', name: 'Motorsport UOL', url: 'https://motorsport.uol.com.br/rss/all/news/' },

  // =======================================================================
  // == Fontes Internacionais de iGaming
  // =======================================================================
  { id: '20', name: 'SBC News', url: 'https://sbcnews.co.uk/feed/' },
  { id: '21', name: 'iGaming Business', url: 'https://igamingbusiness.com/feed/' },
  { id: '22', name: 'EGR Global', url: 'https://egr.global/intel/feed/' },
  { id: '25', name: 'CalvinAyre', url: 'https://calvinayre.com/feed/' },
  { id: '26', name: 'G3 Newswire', url: 'https://g3newswire.com/feed/' },
  { id: '29', name: 'European Gaming News', url: 'https://europeangaming.eu/portal/feed/' },
  
  // =======================================================================
  // == Fontes Governamentais e Regulatórias
  // =======================================================================
  { id: '34', name: 'JOTA', url: 'https://www.jota.info/feed' },

  // =======================================================================
  // == Futebol Brasileiro e Competições (GE)
  // =======================================================================
  { id: '35', name: 'GE - Futebol', url: 'https://ge.globo.com/rss/ge/futebol/' },
  { id: '36', name: 'GE - Corinthians', url: 'https://ge.globo.com/rss/ge/futebol/times/corinthians/' },
  { id: '37', name: 'GE - Flamengo', url: 'https://ge.globo.com/rss/ge/futebol/times/flamengo/' },
  { id: '38', name: 'GE - Palmeiras', url: 'https://ge.globo.com/rss/ge/futebol/times/palmeiras/' },
  { id: '39', name: 'GE - São Paulo', url: 'https://ge.globo.com/rss/ge/futebol/times/sao-paulo/' },
  { id: '40', name: 'GE - Vasco', url: 'https://ge.globo.com/rss/ge/futebol/times/vasco/' },
  { id: '41', name: 'GE - Atlético-MG', url: 'https://ge.globo.com/rss/ge/futebol/times/atletico-mg/' },
  { id: '42', name: 'GE - Cruzeiro', url: 'https://ge.globo.com/rss/ge/futebol/times/cruzeiro/' },
  { id: '43', name: 'GE - Botafogo', url: 'https://ge.globo.com/rss/ge/futebol/times/botafogo/' },
  { id: '44', name: 'GE - Futebol Internacional', url: 'https://ge.globo.com/rss/ge/futebol-internacional/' },
  { id: '45', name: 'GE - Brasileirão Série A', url: 'https://ge.globo.com/rss/ge/futebol/brasileirao-serie-a/' },
  { id: '46', name: 'GE - Copa do Brasil', url: 'https://ge.globo.com/rss/ge/futebol/copa-do-brasil/' },
  { id: '47', name: 'GE - Libertadores', url: 'https://ge.globo.com/rss/ge/futebol/libertadores/' },
  { id: '48', name: 'GE - Sul-Americana', url: 'https://ge.globo.com/rss/ge/futebol/sul-americana/' },
  { id: '49', name: 'GE - Brasileirão Série B', url: 'https://ge.globo.com/rss/ge/futebol/brasileirao-serie-b/' },
  { id: '50', name: 'GE - Brasileirão Série C', url: 'https://ge.globo.com/rss/ge/futebol/brasileirao-serie-c/' },
  { id: '51', name: 'GE - Brasileirão Série D', url: 'https://ge.globo.com/rss/ge/futebol/brasileirao-serie-d/' },
  
  // =======================================================================
  // == Outros Esportes e Notícias Gerais
  // =======================================================================
  { id: '52', name: 'GE - Basquete', url: 'https://ge.globo.com/rss/ge/basquete/' },
  { id: '53', name: 'GE - Vôlei', url: 'https://ge.globo.com/rss/ge/volei/' },
  { id: '54', name: 'GE - Tênis', url: 'https://ge.globo.com/rss/ge/tenis/' },
  { id: '55', name: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml' },
  { id: '56', name: 'Jovem Pan', url: 'https://jovempan.com.br/feed' },
  { id: '57', name: 'CNN Brasil', url: 'https://www.cnnbrasil.com.br/feed/' },
  { id: '58', name: 'DC News', url: 'https://www.agenciadcnews.com.br/feed/' },
  { id: '59', name: 'Jornal da Unesp', url: 'https://jornal.unesp.br/feed/' },
  { id: '60', name: 'Jornal da USP', url: 'https://jornal.usp.br/feed/' },
  { id: '61', name: 'The Rio Times', url: 'https://www.riotimesonline.com/feed/' },
];

export const COMPETITOR_LIST = [
    'SuperBet','Betano','Bet365','7kbet','Novibet','EstrelaBet','Sportingbet','H2Bet','Stake','Betfair','Betsson','F12.Bet','Parimatch','VBET','Multibet','Esportivabet','BetBoom','Brazino777'
];