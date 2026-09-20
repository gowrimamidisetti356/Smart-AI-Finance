import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  Zap,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { aiApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PROMPT_SUGGESTIONS = [
  { id: 1, text: "What is my biggest expense category?", icon: Zap },
  { id: 2, text: "How much have I spent on food?", icon: TrendingDown },
  { id: 3, text: "Am I overspending based on my income?", icon: ShieldCheck },
  { id: 4, text: "Give me 3 actionable tips to save money.", icon: Sparkles },
];

export default function AIAssistantView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your AI Financial Advisor. I analyze your live PostgreSQL transactions and accounts in real-time. Ask me about your spending patterns, budgeting strategies, or category deep-dives!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history from backend
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await aiApi.getHistory();
        if (Array.isArray(history) && history.length > 0) {
          const formatted = [];
          // Backend returns rows ordered by created_at DESC, so reverse for timeline
          const reversed = [...history].reverse();
          reversed.forEach(item => {
            if (item.message) {
              formatted.push({
                id: `u-${item.id}`,
                role: 'user',
                text: item.message,
                time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
              });
            }
            if (item.response) {
              formatted.push({
                id: `a-${item.id}`,
                role: 'assistant',
                text: item.response,
                time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
              });
            }
          });
          if (formatted.length > 0) {
            setMessages(prev => [prev[0], ...formatted]);
          }
        }
      } catch (err) {
        console.warn("Could not fetch chat history:", err.message);
      } finally {
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiApi.chat(query);
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.reply || "I analyzed your data, but could not generate a specific response.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI chat error:", err);
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: "I'm having trouble analyzing your database records right now. Please verify your backend connection and try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] glass-card overflow-hidden">
      {/* AI Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Smart AI Financial Advisor
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Live DB Context
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Contextual advice powered by your PostgreSQL transaction history
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Clear Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-600/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                {msg.time && (
                  <div
                    className={`mt-1.5 text-[10px] ${
                      isUser ? 'text-indigo-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analyzing your financial data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Suggested:
        </span>
        {PROMPT_SUGGESTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSendMessage(item.text)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm cursor-pointer"
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#131A29] flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your expenses, savings advice, or spending summary..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
