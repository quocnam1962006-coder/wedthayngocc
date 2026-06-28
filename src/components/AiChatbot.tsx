/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';

interface AiChatbotProps {
  darkMode: boolean;
  onViewProduct?: (productId: string) => void;
}

export default function AiChatbot({ darkMode, onViewProduct }: AiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! Mình là **Trợ lý Kềm Bến Thành AI** 24/7. Mình có thể giúp gì cho bạn hôm nay?\n- Tư vấn chọn kềm cắt móng & cắt da phù hợp\n- Báo giá kềm & hướng dẫn mua hàng trực tuyến\n- Tra cứu trạng thái đơn hàng (ví dụ: **HD8899**)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'Sản phẩm nào tốt nhất?',
    'Kềm nào dùng cắt da?',
    'Giá bao nhiêu?',
    'Có bảo hành không?',
    'Có ship toàn quốc không?',
    'Tra cứu đơn hàng HD8899'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history })
      });

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: 'msg-bot-' + Date.now(),
        sender: 'bot',
        text: data.text || 'Dạ shop rất tiếc, hệ thống gặp chút sự cố kết nối. Bạn thử lại nhé!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'bot',
        text: 'Không thể kết nối đến máy chủ AI. Hiện tại bạn có thể xem các thông tin sản phẩm và chính sách bảo hành trực tiếp trên website.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mini Markdown/Bold text renderer for chatbot bubble
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Simple parse for **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const parsedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx} className="font-bold text-blue-600 dark:text-blue-400">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <p key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
          {parsedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ai-chatbot-widget">
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-700 text-white shadow-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        id="btn-toggle-chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`absolute bottom-16 right-0 flex h-[520px] w-96 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950 ${
              darkMode ? 'dark' : ''
            }`}
            id="chatbot-window"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 p-4 text-white">
              <div className="flex items-center space-x-3">
                <div className="relative rounded-full bg-white/10 p-1.5">
                  <Bot className="h-6 w-6 text-white" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-blue-700 bg-emerald-400"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">Kềm Bến Thành AI</h3>
                  <div className="flex items-center text-[10px] text-blue-100">
                    <Sparkles className="mr-1 h-3 w-3 animate-pulse text-yellow-300" />
                    <span>Gemini 3.5 Flash 24/7</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-gray-900">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex max-w-[85%] items-start space-x-2">
                      {msg.sender === 'bot' && (
                        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 rounded-tl-none'
                          }`}
                        >
                          {renderMessageText(msg.text)}
                        </div>
                        <span className={`mt-1 text-[10px] text-gray-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%] items-start space-x-2">
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Suggestions & Preset Questions */}
            <div className="border-t border-gray-100 bg-white p-2.5 dark:border-gray-800 dark:bg-gray-950">
              <span className="px-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Gợi ý câu hỏi nhanh:</span>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-800 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="border-t border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend(inputText);
                  }}
                  disabled={isLoading}
                  placeholder="Nhập câu hỏi tư vấn kềm..."
                  className="flex-1 rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-blue-700 dark:focus:bg-gray-950 dark:text-white"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend(inputText)}
                  disabled={isLoading || !inputText.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:outline-none disabled:bg-gray-300 dark:disabled:bg-gray-800"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
