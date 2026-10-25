import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  User, 
  X, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { SIPEDI_SYSTEM_PROMPT } from '../../utils/sipediKnowledge';

interface Message {
  id: number;
  type: 'ai' | 'user';
  text: string;
  actionCard?: {
    title: string;
    link: string;
    buttonText: string;
  };
}

export const FloatingAIChat: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Jangan tampilkan AI Assistant pada seluruh portal Admin (sesuai permintaan user)
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  const { isOpen, isMinimized, openChat, closeChat, minimizeChat } = useChatStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      text: t('aiAssistant.welcome'),
    },
  ]);

  // Update initial welcome message on language change
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 1) {
        return [{ id: 1, type: 'ai', text: t('aiAssistant.welcome') }];
      }
      return prev;
    });
  }, [t]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Render markdown bold format
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanText = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-slate-900">
            {cleanText}
          </strong>
        );
      }
      return part;
    });
  };

  const lowerInputIncludesPermit = (text: string) => {
    return (
      text.includes('usaha') ||
      text.includes('izin') ||
      text.includes('permit') ||
      text.includes('business') ||
      text.includes('iumk') ||
      text.includes('sku') ||
      text.includes('nib') ||
      text.includes('reklame') ||
      text.includes('keramaian')
    );
  };

  const handleSend = async (forcedText?: string) => {
    const queryToSend = forcedText || input;
    if (!queryToSend.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now(), type: 'user', text: queryToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('API Key AI belum diset di .env (VITE_OPENROUTER_API_KEY)');
      }

      const chatHistory = messages.slice(-8).map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SIPEDI AI Assistant',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          max_tokens: 800,
          messages: [
            {
              role: 'system',
              content: SIPEDI_SYSTEM_PROMPT,
            },
            ...chatHistory,
            { role: 'user', content: queryToSend },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gagal memproses (Kode: ${response.status})`);
      }

      const data = await response.json();
      const rawAiText =
        data.choices?.[0]?.message?.content ||
        'Maaf, saya tidak dapat memproses jawaban saat ini. Silakan coba kembali.';

      let cleanAiText = rawAiText;
      let actionCard = undefined;

      const actionTagRegex = /\[ACTION:\s*([^|\]]+)\s*\|\s*([^|\]]+)\s*\|\s*([^\]]+)\]/i;
      const match = cleanAiText.match(actionTagRegex);

      if (match) {
        cleanAiText = cleanAiText.replace(actionTagRegex, '').trim();
        actionCard = {
          link: match[1].trim(),
          title: match[2].trim(),
          buttonText: match[3].trim(),
        };
      } else {
        const lowerText = (queryToSend + ' ' + cleanAiText).toLowerCase();
        if (
          lowerText.includes('status izin') ||
          lowerText.includes('riwayat izin') ||
          lowerText.includes('cek izin') ||
          lowerText.includes('lacak izin') ||
          lowerText.includes('daftar izin') ||
          lowerText.includes('permit status')
        ) {
          actionCard = {
            title: t('aiAssistant.actionPermitHistory'),
            link: '/citizen/permits',
            buttonText: t('aiAssistant.actionPermitListBtn'),
          };
        } else if (
          lowerText.includes('status aduan') ||
          lowerText.includes('riwayat pengaduan') ||
          lowerText.includes('lacak aduan') ||
          lowerText.includes('cek aduan') ||
          lowerText.includes('daftar pengaduan') ||
          lowerText.includes('complaint status')
        ) {
          actionCard = {
            title: t('aiAssistant.actionComplaintHistory'),
            link: '/citizen/complaints',
            buttonText: t('aiAssistant.actionComplaintListBtn'),
          };
        } else if (
          lowerText.includes('warung') ||
          lowerInputIncludesPermit(lowerText)
        ) {
          actionCard = {
            title: t('aiAssistant.actionCreatePermit'),
            link: '/citizen/permits/create',
            buttonText: t('aiAssistant.actionCreatePermitBtn'),
          };
        } else if (
          lowerText.includes('pungli') ||
          lowerText.includes('lapor') ||
          lowerText.includes('aduan') ||
          lowerText.includes('pengaduan') ||
          lowerText.includes('jalan rusak') ||
          lowerText.includes('lampu mati') ||
          lowerText.includes('parkir liar') ||
          lowerText.includes('complaint')
        ) {
          actionCard = {
            title: t('aiAssistant.actionCreateComplaint'),
            link: '/citizen/complaints/create',
            buttonText: t('aiAssistant.actionCreateComplaintBtn'),
          };
        } else if (
          lowerText.includes('kontak') ||
          lowerText.includes('hubungi') ||
          lowerText.includes('bantuan') ||
          lowerText.includes('contact') ||
          lowerText.includes('cs')
        ) {
          actionCard = {
            title: t('aiAssistant.actionContact'),
            link: '/contact',
            buttonText: t('aiAssistant.actionContactBtn'),
          };
        } else if (
          lowerText.includes('profil') ||
          lowerText.includes('profile') ||
          lowerText.includes('ganti password') ||
          lowerText.includes('foto profil')
        ) {
          actionCard = {
            title: t('aiAssistant.actionProfile'),
            link: '/citizen/profile',
            buttonText: t('aiAssistant.actionProfileBtn'),
          };
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'ai', text: cleanAiText, actionCard },
      ]);
    } catch (err: any) {
      console.error('Chat AI Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          text: `⚠️ Kendala koneksi ke server AI: ${err.message || 'Silakan coba lagi.'}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'ai',
        text: t('aiAssistant.resetMsg'),
      },
    ]);
  };

  const handleActionClick = (link: string) => {
    navigate(link);
  };

  const quickPrompts = [
    t('aiAssistant.prompt1'),
    t('aiAssistant.prompt2'),
    t('aiAssistant.prompt3'),
    t('aiAssistant.prompt4'),
  ];

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON (Saat Chat Tertutup) */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60]"
        >
          <button
            onClick={openChat}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full px-3.5 py-2.5 sm:px-5 sm:py-3.5 shadow-[0_8px_25px_rgba(37,99,235,0.45)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.55)] transition-all transform hover:-translate-y-0.5 active:scale-95 border border-white/80 cursor-pointer"
            aria-label="Buka Chat AI Asisten"
          >
            {/* Animated Ping Ring Indicator */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>

            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-tight leading-tight flex items-center gap-1">
                <span className="inline sm:hidden">Tanya AI</span>
                <span className="hidden sm:inline">Tanya AI Asisten</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </span>
              <span className="hidden sm:inline text-[10px] text-blue-100 font-medium leading-none">
                Online • Respon Cepat
              </span>
            </div>
          </button>
        </motion.div>
      )}

      {/* 2. MOBILE BACKDROP OVERLAY (Saat Chat Terbuka Penuh di Layar HP) */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9995] sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* 3. FLOATING CHAT WIDGET BOX (Saat Terbuka) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 35, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`fixed z-[9999] bg-white border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized
                ? 'bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[410px] md:w-[430px] h-14 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.25)]'
                : 'inset-x-0 bottom-0 h-[88dvh] max-h-[92dvh] rounded-t-3xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[410px] md:w-[430px] sm:h-[580px] sm:max-h-[85vh] sm:rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.28)]'
            }`}
          >
            {/* Header Tokopedia Style */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 pt-2 pb-3 sm:py-3.5 flex flex-col shrink-0 select-none shadow-sm">
              {/* Mobile Pull Bar Indicator */}
              {!isMinimized && (
                <div className="w-10 h-1 bg-white/35 rounded-full mx-auto mb-2 sm:hidden shrink-0" />
              )}

              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                  onClick={minimizeChat}
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shadow-xs">
                      <Bot className="w-5 h-5" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-700 rounded-full"></span>
                  </div>
                  <div className="truncate">
                    <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5 truncate">
                      Asisten AI SIPEDI
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    </h3>
                    <p className="text-[10px] text-blue-100 font-medium leading-none mt-0.5">
                      {t('aiAssistant.statusActive', 'Online • Layanan Panduan 24/7')}
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {!isMinimized && (
                    <button
                      onClick={handleReset}
                      title={t('aiAssistant.resetTitle', 'Mulai Ulang Percakapan')}
                      className="p-2 sm:p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={minimizeChat}
                    title={isMinimized ? 'Perbesar' : 'Kecilkan'}
                    className="p-2 sm:p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={closeChat}
                    title="Tutup Chat"
                    className="p-2 sm:p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area (Hanya jika tidak di-minimize) */}
            {!isMinimized && (
              <>
                {/* Chat Scroll Container */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/70 overscroll-contain"
                >
                  {/* Banner Sambutan Gaya Tokopedia jika pesan awal */}
                  {messages.length === 1 && (
                    <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs text-center space-y-2 mb-2">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">
                        {t('aiAssistant.title', 'Asisten Resmi')} {t('aiAssistant.titleHighlight', 'SIPEDI')}
                      </h4>
                      <p className="text-xs sm:text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Tanyakan seputar perizinan usaha, pengaduan fasilitas publik/pungli, status berkas, atau panduan layanan.
                      </p>
                    </div>
                  )}

                  {/* Daftar Pesan */}
                  {messages.map((msg) => {
                    const isAi = msg.type === 'ai';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 sm:gap-2.5 ${isAi ? 'items-start justify-start' : 'items-end justify-end'}`}
                      >
                        {isAi && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div className={`space-y-1.5 max-w-[88%] sm:max-w-[85%] ${isAi ? 'items-start' : 'items-end'}`}>
                          <div
                            className={`p-3 sm:p-3 rounded-2xl text-[13px] sm:text-xs leading-relaxed ${
                              isAi
                                ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-xs font-medium'
                            }`}
                          >
                            <div className="whitespace-pre-line">
                              {renderFormattedText(msg.text)}
                            </div>
                          </div>

                          {/* Action Card Button (jika ada) */}
                          {msg.actionCard && (
                            <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-blue-200/80 shadow-xs flex items-center justify-between gap-2 mt-1">
                              <span className="text-xs sm:text-[11px] font-bold text-slate-800 truncate">
                                {msg.actionCard.title}
                              </span>
                              <button
                                onClick={() => handleActionClick(msg.actionCard!.link)}
                                className="px-3 py-1.5 sm:px-2.5 sm:py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs sm:text-[10px] shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                              >
                                <span>{msg.actionCard.buttonText}</span>
                                <ArrowRight className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!isAi && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mb-0.5 shadow-xs">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-slate-200/80 p-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-xs sm:text-[10px] text-slate-400 font-medium ml-1">Mengetik respons...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Prompts Pills */}
                <div className="px-3 sm:px-4 py-2 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      disabled={isTyping}
                      className="px-3 py-1.5 sm:px-2.5 sm:py-1 bg-white hover:bg-blue-50 active:bg-blue-100 hover:border-blue-300 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-full text-xs sm:text-[10px] font-semibold whitespace-nowrap transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-3 pb-4 sm:pb-3 bg-white border-t border-slate-200">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('aiAssistant.inputPlaceholder', 'Ketik pertanyaan seputar layanan SIPEDI...')}
                      disabled={isTyping}
                      className="flex-1 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-base sm:text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-400 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-[10px] sm:text-[9px] text-slate-400 text-center mt-2 sm:mt-1.5 leading-none">
                    Didukung AI Pintar SIPEDI • Jawaban otomatis berbasis basis data resmi
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
