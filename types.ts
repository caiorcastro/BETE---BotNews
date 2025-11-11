
export interface Feed {
  id: string;
  name: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  date: string;
  source: string;
}

export enum ChatMessageAuthor {
  USER = 'user',
  GEMINI = 'gemini',
  SYSTEM = 'system',
}

export interface ChatMessage {
  author: ChatMessageAuthor;
  content: string;
  sources?: GroundingSource[];
}

export enum ChatMode {
  FLASH = 'flash',
  GROUNDED = 'grounded',
  THINKING = 'thinking',
}

export interface GroundingSource {
    uri: string;
    title: string;
}
