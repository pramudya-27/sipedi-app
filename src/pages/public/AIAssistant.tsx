import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import bgTexture6 from '../../assets/bg6.jpg';

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

export const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      text: 'Halo! 👋 Saya AI Assistant SIPEDI. Saya siap membantu menemukan layanan perizinan, mengarahkan pengaduan, atau menjelaskan dokumen yang Anda perlukan. Ada yang bisa saya bantu hari ini? 🚀'
    }
  ]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const renderFormattedText = (text: string) => {
    // Memecah teks berdasarkan pola **teks tebal**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanText = part.slice(2, -2);
        return <strong key={index} className="font-extrabold text-slate-900">{cleanText}</strong>;
      }
      return part;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userQuery = input;
    const newUserMsg: Message = { id: Date.now(), type: 'user', text: userQuery };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error("OpenRouter API Key belum diset di file .env (VITE_OPENROUTER_API_KEY)");
      }

      const chatHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "SIPEDI AI Assistant",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: "Kamu adalah AI Assistant resmi untuk SIPEDI (Sistem Perizinan & Ketertiban Digital). Tugasmu adalah membantu warga/UMKM menanyakan prosedur perizinan usaha mikro (NIB, IUMK) dan cara melaporkan pengaduan/pungli. Berikan jawaban yang ramah, informatif, gunakan sesekali emoji yang relevan, dan buat format poin yang rapi menggunakan **teks tebal** pada judul poinnya dalam bahasa Indonesia."
            },
            ...chatHistory,
            { role: "user", content: userQuery }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gagal terhubung ke AI (Error code: ${response.status})`);
      }

      const data = await response.json();
      const aiText = data.choices[0]?.message?.content || "Maaf, saya tidak dapat memproses respons saat ini.";

      let actionCard = undefined;
      const lowerInput = userQuery.toLowerCase();
      if (lowerInput.includes('warung') || lowerInput.includes('usaha') || lowerInput.includes('izin') || lowerInput.includes('nib')) {
        actionCard = {
          title: "Perizinan Usaha Mikro & NIB",
          link: "/citizen/permits/create",
          buttonText: "Mulai Pengajuan Izin"
        };
      } else if (lowerInput.includes('pungli') || lowerInput.includes('uang') || lowerInput.includes('lapor') || lowerInput.includes('pengaduan')) {
        actionCard = {
          title: "Pengaduan Layanan & Ketertiban",
          link: "/citizen/complaints/create",
          buttonText: "Buat Laporan Aduan"
        };
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'ai', text: aiText, actionCard }]);
    } catch (error: any) {
      console.error("OpenRouter API Error:", error);
      setMessages((prev) => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          type: 'ai', 
          text: `⚠️ Terjadi kendala koneksi ke server AI: ${error.message || 'Periksa API Key Anda.'}` 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'ai',
        text: '✨ Percakapan telah diperbarui. Halo, ada yang bisa saya bantu terkait layanan SIPEDI hari ini?'
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col pt-16 lg:pt-20 relative overflow-hidden">
      
      {/* Background Image Texture */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: `url(${bgTexture6})` }}
      ></div>

      {/* Moving Rainbow Aura Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-16 -left-20 w-[30rem] h-[30rem] bg-sky-200/50 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute top-1/4 -right-20 w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute bottom-10 left-1/3 w-[28rem] h-[28rem] bg-rose-200/30 rounded-full blur-[130px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 flex-1 flex flex-col">
        
        {/* Header Hero Title */}
        <div className="text-center max-w-lg mx-auto mb-5">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1 rounded-full mb-2.5 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">
              OpenRouter AI Assistant
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Asisten Digital{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
              SIPEDI
            </span>
          </h1>
          <p className="text-slate-600 text-xs mt-1 font-medium">
            Tanyakan panduan perizinan UMKM dan prosedur pengaduan secara cepat.
          </p>
        </div>

        {/* Main Chat Box Container */}
        <div className="max-w-2xl w-full mx-auto bg-white/85 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[520px] mb-12 transition-all">
          
          {/* Chat Sub-Header */}
          <div className="px-5 py-3.5 bg-white/60 border-b border-slate-100/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 leading-tight">AI Assistant SIPEDI</h3>
                <p className="text-[10px] text-slate-500 font-medium">Aktif • Siap Membantu 24/7</p>
              </div>
            </div>

            <button 
              onClick={handleResetChat}
              title="Reset Percakapan"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/30 scrollbar-thin"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[88%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5`}>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm ${
                    msg.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-slate-200 text-blue-600'
                  }`}>
                    {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-600/10' 
                        : 'bg-white/95 text-slate-800 border border-slate-200/80 shadow-sm rounded-tl-none'
                    }`}>
                      {msg.type === 'ai' ? renderFormattedText(msg.text) : msg.text}
                    </div>

                    {/* Action Card Button */}
                    {msg.actionCard && (
                      <div className="mt-2.5 bg-white/95 border border-blue-100 rounded-xl p-3 shadow-md shadow-blue-500/5 max-w-xs">
                        <div className="text-[11px] font-extrabold text-slate-900 mb-1.5">
                          {msg.actionCard.title}
                        </div>
                        <button 
                          onClick={() => navigate(msg.actionCard!.link)}
                          className="w-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer group"
                        >
                          <span>{msg.actionCard.buttonText}</span>
                          <ArrowRight className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white/95 border border-slate-200/80 shadow-sm rounded-tl-none flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input & Quick Prompts Area */}
          <div className="p-3.5 bg-white/90 border-t border-slate-100 backdrop-blur-md">
            
            {/* Quick Prompts Chips */}
            <div className="flex space-x-2 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                "🍽️ Saya ingin membuka warung makan",
                "📝 Saya ingin mengurus izin NIB",
                "🚨 Saya ingin melaporkan pungli",
                "📄 Apa saja dokumen yang diperlukan?"
              ].map((prompt, i) => (
                <button 
                  key={i}
                  type="button"
                  onClick={() => setInput(prompt.replace(/^[^\s]+\s+/, ''))}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 rounded-lg text-[11px] font-bold border border-transparent transition-all cursor-pointer shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <div className="flex items-center gap-2.5">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pertanyaan Anda di sini..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all"
              />
              <button 
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};