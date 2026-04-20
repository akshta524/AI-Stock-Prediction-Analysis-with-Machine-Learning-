import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, User, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithAI } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  selectedTicker: string;
  stockData: any[];
  watchlist: any[];
  embedded?: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({ selectedTicker, stockData, watchlist, embedded = false }) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your StockPro AI analyst. Ask me anything about the market or your current portfolio.",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(input, {
        ticker: selectedTicker,
        data: stockData,
        watchlist: watchlist,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={embedded ? "h-full w-full" : "fixed bottom-6 right-6 z-[100]"}>
      <AnimatePresence>
        {!isOpen && !embedded && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-[#00d4aa] hover:bg-[#00b894] shadow-[0_0_20px_rgba(0,212,170,0.4)] flex items-center justify-center group"
            >
              <MessageSquare className="w-6 h-6 text-[#0e1117] group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={embedded ? { opacity: 0 } : { y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={embedded ? { opacity: 0 } : { y: 100, opacity: 0, scale: 0.9 }}
            className={`flex flex-col bg-[#1e2130] border border-[#334155] shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
              embedded ? 'h-full w-full' : isMinimized ? 'h-16 w-72' : 'h-[500px] w-[380px]'
            }`}
          >
            <Card className="h-full border-none bg-transparent flex flex-col rounded-none">
              <CardHeader className="p-4 border-b border-[#334155] flex flex-row items-center justify-between bg-[#0e1117]/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#00d4aa]/10 rounded-lg flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-[#00d4aa]" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-white">Market AI Assistant</CardTitle>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse"></div>
                      <span className="text-[10px] text-[#94a3b8]">Live Analysis</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!embedded && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#94a3b8] hover:text-white"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </Button>
                  )}
                  {!embedded && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#94a3b8] hover:text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                msg.role === 'user' ? 'bg-[#334155]' : 'bg-[#00d4aa]/20'
                              }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#00d4aa]" />}
                              </div>
                              <div className={`p-3 rounded-2xl text-sm ${
                                msg.role === 'user' 
                                  ? 'bg-[#00d4aa] text-[#0e1117] rounded-tr-none' 
                                  : 'bg-[#0e1117] text-[#e2e8f0] border border-[#334155] rounded-tl-none'
                              }`}>
                                <div className="prose prose-invert prose-sm max-w-none">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                                <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-[#0e1117]' : 'text-[#94a3b8]'}`}>
                                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#00d4aa]/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-[#00d4aa]" />
                              </div>
                              <div className="bg-[#0e1117] border border-[#334155] p-3 rounded-2xl rounded-tl-none flex gap-1">
                                <div className="w-1.5 h-1.5 bg-[#00d4aa] rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-[#00d4aa] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-[#00d4aa] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    <div className="p-4 bg-[#0e1117]/50 border-t border-[#334155]">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSend();
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask about AAPL, market trends..."
                          className="flex-1 bg-[#0e1117] border border-[#334155] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                        />
                        <Button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          className="bg-[#00d4aa] hover:bg-[#00b894] text-[#0e1117] rounded-xl px-3"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
