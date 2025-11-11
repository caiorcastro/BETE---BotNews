
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatMessageAuthor, ChatMode } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialPrompt: string;
  setInitialPrompt: (prompt: string) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, setIsOpen, initialPrompt, setInitialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>(ChatMode.FLASH);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
        setMessages([
            { author: ChatMessageAuthor.SYSTEM, content: `Analyzing article...` },
        ]);
        handleSendMessage(initialPrompt, ChatMode.FLASH); // Default to Flash for analysis
        setInitialPrompt(''); // Clear after use
    } else if (!isOpen) {
        setMessages([]); // Clear messages when closed
    }
  }, [initialPrompt, isOpen]);

  const handleSendMessage = async (prompt: string, chatMode: ChatMode = mode) => {
    if (!prompt.trim()) return;

    const userMessage: ChatMessage = { author: ChatMessageAuthor.USER, content: prompt };
    setMessages(prev => [...prev.filter(m => m.author !== ChatMessageAuthor.SYSTEM), userMessage]);
    setIsLoading(true);

    try {
        const { text, sources } = await getGeminiResponse(prompt, chatMode, messages);
        const geminiMessage: ChatMessage = { author: ChatMessageAuthor.GEMINI, content: text || "I couldn't find a response for that.", sources };
        setMessages(prev => [...prev, geminiMessage]);
    } catch (error) {
        console.error("Failed to get response from Gemini:", error);
        const errorMessage: ChatMessage = { 
            author: ChatMessageAuthor.SYSTEM, 
            content: 'Sorry, I encountered an error. Please check the console for details and try again.' 
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
        inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput('');
  };
  
  if (!isOpen) return null;

  const ModeButton: React.FC<{ current: ChatMode; target: ChatMode; label: string, description: string }> = ({ current, target, label, description }) => (
    <button
        title={description}
        onClick={() => setMode(target)}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            current === target ? 'bg-primary text-black' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="chatbot-title" className="fixed inset-0 bg-black/80 z-40 flex justify-center items-center backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div className="bg-background-dark border border-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 id="chatbot-title" className="text-lg font-bold font-display text-white">Gemini Chat</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close Chat">
                <span className="material-icons">close</span>
            </button>
        </header>

        <div className="p-4 flex-grow overflow-y-auto">
            <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.author === ChatMessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg ${
                            msg.author === ChatMessageAuthor.USER ? 'bg-primary text-black' : 
                            msg.author === ChatMessageAuthor.SYSTEM ? 'bg-gray-700 text-gray-300 text-sm italic' :
                            'bg-card-dark text-gray-200'
                        }`}>
                            <div className="prose prose-sm prose-invert max-w-none prose-p:my-2">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-700">
                                    <h4 className="text-xs font-bold mb-1">Sources:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {msg.sources.map((source, i) => (
                                            <li key={i} className="text-xs">
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:underline">
                                                    {source.title || source.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-md p-3 rounded-lg bg-card-dark text-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
        </div>
        
        <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-2" role="radiogroup" aria-label="Chat Mode">
                <span className="text-xs font-medium text-gray-400">Mode:</span>
                <ModeButton current={mode} target={ChatMode.FLASH} label="Flash" description="Fast responses for general tasks and summarization. (gemini-2.5-flash)" />
                <ModeButton current={mode} target={ChatMode.GROUNDED} label="Grounded" description="Get up-to-date, factual answers grounded in Google Search. (gemini-2.5-flash)" />
                <ModeButton current={mode} target={ChatMode.THINKING} label="Thinking" description="Handles complex queries needing advanced reasoning. (gemini-2.5-pro)" />
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-grow bg-card-dark text-gray-200 placeholder-gray-500 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    disabled={isLoading}
                    aria-label="Chat input"
                />
                <button
                    type="submit"
                    className="bg-primary hover:opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-md p-2 transition-colors"
                    disabled={isLoading || !input.trim()}
                    aria-label="Send Message"
                >
                    <span className="material-icons text-lg">send</span>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
