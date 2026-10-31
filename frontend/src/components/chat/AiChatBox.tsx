import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  ChevronDown,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  time: string;
}

const QUICK_CHIPS = [
  '🎯 What colleges can I get with my rank?',
  '⚖️ Difference between Float and Slide',
  '🏠 How does Home State quota work?',
  '⚠️ Top mistakes students make in choice filling',
  '📊 How does mock seat allotment work?',
];

export default function AiChatBox() {
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Hello! I am **JoSAA Mate AI**, your personal counselling assistant powered by high-speed Groq AI.\n\nAsk me anything about IIT/NIT cutoffs, preference strategy, Float/Freeze/Slide, quotas, or your personal eligibility!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (state.chatOpen) {
      scrollToBottom();
    }
  }, [messages, state.chatOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          profile: state.profile || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I could not generate an answer right now. Please try again.',
        source: data.source,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('AI Chat Error:', err);
      // Fallback response
      const fallbackMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ Could not reach online AI model at this second. Here is quick counselling guidance:\n\n' +
          '• **Freeze**: Permanently locks seat & exits rounds.\n' +
          '• **Float**: Keeps seat as safety backup & stays eligible for higher choices.\n' +
          '• **Slide**: Keeps current institute & seeks better branch within it.\n\n' +
          'Check the **Rank & Cutoff Explorer** to verify past opening/closing ranks!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat cleared. How can I assist with your JoSAA counselling today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Profile tagline
  const profileSnippet = state.profile?.name
    ? `Tailored for ${state.profile.name} (CRL: ${state.profile.jeemainCRL || 'N/A'}, ${state.profile.category})`
    : 'Personalized for your JEE Profile';

  return (
    <>
      {/* Floating Trigger Pill (Amazon Rufus Style) */}
      {!state.chatOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch({ type: 'SET_CHAT_OPEN', payload: true })}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-xl transition-all select-none"
          style={{
            background: 'linear-gradient(135deg, #5145CD 0%, #806BFF 100%)',
            boxShadow: '0 8px 24px -4px rgba(81, 69, 205, 0.45)',
          }}
          aria-label="Open JoSAA AI Chat Assistant"
        >
          <div className="relative">
            <Sparkles size={18} className="animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-600 animate-pulse" />
          </div>
          <span>Ask JoSAA Mate AI</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">GROQ</span>
        </motion.button>
      )}

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {state.chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'bottom-4 right-4 w-[92vw] sm:w-[680px] h-[85vh]'
                : 'bottom-6 right-6 w-[94vw] sm:w-[420px] h-[580px]'
            }`}
          >
            {/* Header */}
            <div
              className="px-4 py-3 text-white flex items-center justify-between shrink-0 select-none"
              style={{
                background: 'linear-gradient(135deg, #101828 0%, #1e1b4b 100%)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-wide">JoSAA Mate AI</h3>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.2 rounded-full font-medium flex items-center gap-1">
                      <Zap size={10} className="text-amber-400" /> Groq AI
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 truncate max-w-[210px]">{profileSnippet}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  title="Clear conversation"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restore size' : 'Expand window'}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                >
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_CHAT_OPEN', payload: false })}
                  title="Close chat"
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            {/* Quick Chips Bar */}
            <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-thin shrink-0">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={isLoading}
                  className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors shrink-0 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin dark:bg-slate-900">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    <div className={`max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-tl-xs border border-gray-200/50 dark:border-slate-700/50'
                        }`}
                      >
                        {/* Format bold, bullets, newlines */}
                        <div
                          className="whitespace-pre-line prose-xs"
                          dangerouslySetInnerHTML={{
                            __html: m.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/^• (.*)$/gm, '<li class="ml-3 list-disc">$1</li>')
                              .replace(/^\* (.*)$/gm, '<li class="ml-3 list-disc">$1</li>'),
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">{m.time}</span>
                        {!isUser && (
                          <button
                            onClick={() => copyToClipboard(m.id, m.content)}
                            title="Copy reply"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {copiedId === m.id ? (
                              <Check size={11} className="text-emerald-500" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about cutoffs, choices, quotas..."
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1.5">
                AI guidance is indicative. Always verify rules at josaa.nic.in.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
