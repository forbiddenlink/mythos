"use client";

import { createPortal } from "react-dom";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import type { OracleSourcesPayload } from "@/lib/oracle/citations";
import { isNotInSourcesAnswer } from "@/lib/oracle/coverage";
import { readOracleStream } from "@/lib/oracle/stream-client";
import {
  OracleSources,
  renderOracleText,
} from "@/components/oracle/OracleAnswer";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Loader2, Send, Sparkles, X } from "lucide-react";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Grounding metadata streamed with this reply (entity pages + primary sources). */
  sources?: OracleSourcesPayload | null;
  /** Set once the reply has finished streaming. */
  done?: boolean;
}

export function OracleChat() {
  const locale = useLocale();
  const t = useTranslations("oracle");
  const allMessages = useMessages();
  const suggestedQuestions = (
    allMessages.oracle as { suggestedQuestions?: string[] }
  ).suggestedQuestions ?? [
    "Who is the most powerful Greek god?",
    "Tell me about Norse creation mythology",
    "What are the similarities between Zeus and Jupiter?",
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  useFocusTrap(isOpen, panelRef);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Return focus to the footer opener when the dialog closes
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      openerRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const response = await fetch("/api/oracle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(errorData.error || t("errors.consultFailed"));
        }

        if (!response.body) throw new Error(t("errors.noStream"));

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const update = (patch: Partial<Message>) =>
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, ...patch } : m,
            ),
          );

        let tracked = false;
        const result = await readOracleStream(response.body, {
          onSources: (sources) => {
            // Grounded vs ungrounded is the quality signal worth tracking: an
            // Oracle answering with zero source hits is the failure mode.
            if (!tracked) {
              tracked = true;
              trackEvent("oracle_asked", { grounded: sources.hitCount > 0 });
            }
            update({ sources });
          },
          onText: (content) => update({ content }),
        });

        update({
          content: result.text,
          sources: result.sources,
          done: true,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errors.generic"));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, locale, t],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    void sendMessage(question);
  };

  return (
    <>
      <Button
        ref={openerRef}
        variant="ghost"
        className="min-h-11 px-0 text-muted-foreground"
        onClick={() => setIsOpen(true)}
        aria-label={t("fabOpen")}
      >
        {t("title")}
      </Button>
      {typeof document !== "undefined" &&
        createPortal(
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
                  ref={panelRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="oracle-dialog-title"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-4 md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[32rem] bg-gradient-to-b from-slate-900 to-midnight border border-gold/30 rounded-2xl shadow-2xl shadow-gold/20 z-50 flex flex-col overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gold/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center">
                        <Eye className="w-5 h-5 text-midnight" />
                      </div>
                      <div>
                        <h2
                          id="oracle-dialog-title"
                          className="font-serif text-lg text-parchment"
                        >
                          {t("title")}
                        </h2>
                        <p className="text-xs text-parchment/60">
                          {t("subtitle")}
                        </p>
                        <p className="text-[10px] text-parchment/50 mt-0.5 max-w-[14rem] leading-snug">
                          {t("aiDisclosure")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-parchment/60 hover:text-parchment hover:bg-gold/10"
                      aria-label={t("close")}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions"
                  >
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 text-gold/40 mx-auto mb-4" />
                        <p className="text-parchment/80 mb-6">
                          {t("greeting")}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs text-parchment/40 mb-3">
                            {t("tryAsking")}
                          </p>
                          {suggestedQuestions.slice(0, 3).map((question) => (
                            <button
                              type="button"
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
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                              message.role === "user"
                                ? "bg-gold/20 text-parchment rounded-br-sm"
                                : "bg-slate-800/80 text-parchment/90 rounded-bl-sm border border-gold/10"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.role === "assistant" &&
                              !message.content.trim() &&
                              isLoading ? (
                                <span className="inline-flex items-center gap-2 text-gold/60">
                                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                  {t("loading")}
                                </span>
                              ) : message.role === "assistant" ? (
                                renderOracleText(
                                  message.content,
                                  "text-gold underline underline-offset-2 hover:text-gold-light",
                                )
                              ) : (
                                message.content
                              )}
                            </p>
                            {message.role === "assistant" &&
                              message.done &&
                              message.sources &&
                              message.sources.hitCount > 0 &&
                              !isNotInSourcesAnswer(message.content) && (
                                <p className="mt-2 flex items-center gap-1.5 text-[10px] leading-tight text-parchment/50">
                                  <Sparkles
                                    aria-hidden="true"
                                    className="size-3 shrink-0 text-gold/60"
                                  />
                                  <span className="sr-only">
                                    {t("groundingAria", {
                                      count: message.sources.hitCount,
                                    })}
                                  </span>
                                  <span aria-hidden="true">
                                    {t("groundingLine", {
                                      count: message.sources.hitCount,
                                    })}
                                  </span>
                                </p>
                              )}
                            {message.role === "assistant" && message.done && (
                              <OracleSources
                                sources={message.sources ?? null}
                                notInSources={
                                  message.sources?.hitCount === 0 ||
                                  isNotInSourcesAnswer(message.content)
                                }
                              />
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {error && (
                      <div
                        role="alert"
                        className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm"
                      >
                        {error}
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form
                    onSubmit={handleSubmit}
                    className="p-4 border-t border-gold/20"
                  >
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t("placeholder")}
                        disabled={isLoading}
                        aria-label={t("inputLabel")}
                        maxLength={4000}
                        className="flex-1 bg-slate-800/50 border border-gold/20 rounded-xl px-4 py-3 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors disabled:opacity-50"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-gold hover:bg-gold-light text-midnight rounded-xl px-4 disabled:opacity-50"
                        aria-label={t("sendLabel")}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                    <p
                      className="mt-1 text-right text-[10px] text-parchment/40"
                      aria-live="polite"
                    >
                      {input.length}/4000
                    </p>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
