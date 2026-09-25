import React, { useState } from 'react';
import { Send, Bot, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      text: 'Halo, saya AI Assistant SIPEDI. Saya dapat membantu menemukan layanan perizinan, mengarahkan pengaduan, atau menjelaskan dokumen yang diperlukan. Ada yang bisa saya bantu hari ini?'
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMsg: Message = { id: Date.now(), type: 'user', text: input };
    setMessages([...messages, newUserMsg]);
    setInput('');

    // Mock AI Response
    setTimeout(() => {
      let aiText = "Maaf, saya tidak mengerti. Bisa dijelaskan lebih spesifik?";
      let actionCard = undefined;

      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('warung') || lowerInput.includes('usaha') || lowerInput.includes('izin')) {
        aiText = "Baik. Saya dapat membantu menemukan layanan yang sesuai. Untuk memulai usaha, Anda dapat melihat layanan perizinan usaha mikro.";
        actionCard = {
          title: "Perizinan Usaha Mikro",
          link: "/citizen/permits/create",
          buttonText: "Mulai Pengajuan"
        };
      } else if (lowerInput.includes('pungli') || lowerInput.includes('uang')) {
        aiText = "Ini terindikasi sebagai Pungutan Liar. Harap segera laporkan kejadian ini agar dapat ditindaklanjuti. Saya sarankan Anda membuat pengaduan resmi.";
        actionCard = {
          title: "Pengaduan Pungutan Liar",
          link: "/citizen/complaints/create",
          buttonText: "Buat Laporan"
        };
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: aiText, actionCard }]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant SIPEDI</h1>
        <p className="text-gray-600 mt-2">Asisten digital untuk membantu memahami layanan SIPEDI.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[600px]">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.type === 'user' ? 'bg-primary-600 ml-3' : 'bg-success-500 mr-3'}`}>
                  {msg.type === 'user' ? <User className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
                </div>

                <div>
                  <div className={`p-4 rounded-2xl ${msg.type === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                  
                  {msg.actionCard && (
                    <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-72">
                      <div className="font-semibold text-gray-900 mb-3">{msg.actionCard.title}</div>
                      <button 
                        onClick={() => navigate('/login')} // Force login first for demo
                        className="w-full flex items-center justify-center bg-primary-50 text-primary-700 hover:bg-primary-100 py-2 rounded-md font-medium transition-colors"
                      >
                        {msg.actionCard.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          {/* Suggested Prompts */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            {["Saya ingin membuka warung makan", "Saya ingin mengurus izin", "Saya ingin melaporkan pungli", "Apa saja dokumen yang diperlukan?"].map((prompt, i) => (
              <button 
                key={i}
                onClick={() => setInput(prompt)}
                className="whitespace-nowrap px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ketik pertanyaan Anda di sini..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <button 
              onClick={handleSend}
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
