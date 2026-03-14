'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Send, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Who is the most powerful Greek god?",
  "Tell me about Norse creation mythology",
  "What are the similarities between Zeus and Jupiter?",
  "Who guards the underworld in Egyptian mythology?",
  "What is the story of Ragnarok?",
];

export function OracleChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to consult the Oracle');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };
      setMessages(prev => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id ? { ...m, content: fullContent } : m
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      {/* Floating Oracle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light hover:from-gold hover:via-gold-light hover:to-gold text-midnight shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/40 transition-all duration-300"
          aria-label="Ask the Oracle"
        >
          <Eye className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Oracle Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[32rem] bg-gradient-to-b from-slate-900 to-midnight border border-gold/30 rounded-2xl shadow-2xl shadow-gold/20 z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gold/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center">
                    <Eye className="w-5 h-5 text-midnight" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg text-parchment">Oracle of Delphi</h2>
                    <p className="text-xs text-parchment/60">Ask about ancient mythology</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-parchment/60 hover:text-parchment hover:bg-gold/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                    <p className="text-parchment/80 mb-6">
                      Greetings, seeker of wisdom. What mysteries of the ancient world do you wish to unravel?
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs text-parchment/40 mb-3">Try asking:</p>
                      {SUGGESTED_QUESTIONS.slice(0, 3).map((question) => (
                        <button
                          key={question}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="block w-full text-left text-sm text-gold/70 hover:text-gold bg-gold/5 hover:bg-gold/10 rounded-lg px-3 py-2 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gold/20 text-parchment rounded-br-sm'
                            : 'bg-slate-800/80 text-parchment/90 rounded-bl-sm border border-gold/10'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/80 rounded-2xl rounded-bl-sm px-4 py-3 border border-gold/10">
                      <div className="flex items-center gap-2 text-gold/60">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">The Oracle speaks...</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gold/20">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the Oracle..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-800/50 border border-gold/20 rounded-xl px-4 py-3 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gold hover:bg-gold-light text-midnight rounded-xl px-4 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default OracleChat;
