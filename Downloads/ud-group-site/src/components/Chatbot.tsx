import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MagneticButton } from "./MagneticButton";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const TypingIndicator = () => (
  <div className="flex space-x-1.5 p-1 items-center h-5">
    <motion.div
      className="w-1.5 h-1.5 bg-gold rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
    />
    <motion.div
      className="w-1.5 h-1.5 bg-gold rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
    />
    <motion.div
      className="w-1.5 h-1.5 bg-gold rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
    />
  </div>
);

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Welcome to Amara Garden City. I am your Virtual Concierge. How may I assist you today with information about Amarapura, our sustainability commitments, or the project itself?",
    },
  ]);
  const [input, setInput] = useState("");
  // "isLoading" = waiting on the request to start responding at all;
  // "isStreaming" = tokens are actively arriving. Previously these were one
  // flag, so the typing indicator and the message bubble would both want
  // to show at once once streaming starts. Split so the UI hands off
  // cleanly: indicator while waiting, live text once it starts.
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading, isStreaming]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
    };

    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, history }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      // /api/chat streams back plain UTF-8 text chunks (the edge function
      // already unwraps Anthropic's SSE event framing server-side), so the
      // client just appends bytes as they arrive — no JSON parsing needed
      // per chunk, no waiting for the full response before showing anything.
      setIsLoading(false);
      setIsStreaming(true);
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + chunk } : m))
        );
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("Chat error:", error);
      setMessages((prev) => {
        const withoutEmpty = prev.filter((m) => m.id !== assistantId || m.text);
        return [
          ...withoutEmpty,
          {
            id: assistantId + "-error",
            role: "assistant",
            text: "I apologize, but I'm having trouble connecting right now. Please try again later.",
          },
        ];
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <MagneticButton strength={0.4} className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-50">
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={() => setIsOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-gold shadow-xl backdrop-blur-sm transition-transform hover:bg-[#2a2a2a] hover:scale-110 active:scale-95 border border-gold/20"
              aria-label="Open Virtual Concierge"
            >
              <MessageSquare className="h-6 w-6" strokeWidth={1.5} />
            </motion.button>
          </MagneticButton>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 flex flex-col w-full sm:w-[420px] h-[100dvh] bg-paper shadow-2xl border-l border-gold/30"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-ink text-white border-b border-gold/20 shrink-0">
              <div>
                <h3 className="font-sans font-medium text-base tracking-[0.15em] text-gold">VIRTUAL CONCIERGE</h3>
                <p className="text-[10px] text-white/60 uppercase tracking-[0.2em] mt-1">Amara Garden City AI</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div 
                    className={`max-w-[85%] px-5 py-4 text-[15px] font-light leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user" 
                        ? "bg-ink text-white rounded-2xl rounded-br-sm shadow-md" 
                        : "bg-white text-neutral-800 border border-gold/20 rounded-2xl rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.text}
                    {msg.role === "assistant" && msg.text === "" && isStreaming && (
                      <TypingIndicator />
                    )}
                  </div>
                  <span className={`text-[9px] mt-2 uppercase tracking-widest px-1 font-medium ${msg.role === "user" ? "text-neutral-400" : "text-gold"}`}>
                    {msg.role === "user" ? "You" : "Concierge"}
                  </span>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="bg-white border border-gold/20 rounded-2xl rounded-bl-sm shadow-sm px-6 py-4">
                    <TypingIndicator />
                  </div>
                  <span className="text-[9px] text-gold mt-2 uppercase tracking-widest px-1 font-medium">
                    Concierge typing...
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-neutral-200 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-3 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Amara Garden City..."
                  className="flex-1 bg-paper border border-neutral-200 rounded-full pl-5 pr-12 py-3.5 text-[15px] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-neutral-400"
                  disabled={isLoading || isStreaming}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || isStreaming}
                  className="absolute right-1.5 top-1.5 bg-ink text-gold h-10 w-10 rounded-full hover:bg-gold hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
