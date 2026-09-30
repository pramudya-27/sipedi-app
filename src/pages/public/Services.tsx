import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ShieldAlert, 
  Bot, 
  Award, 
  Briefcase, 
  BarChart, 
  ArrowRight 
} from 'lucide-react';

export const Services: React.FC = () => {
  const services = [
    {
      id: 'perizinan',
      title: 'Perizinan Mikro Digital',
      description: 'Proses cepat dan transparan untuk usaha Anda.',
      icon: <FileText className="w-8 h-8 text-[#0a2342]" />,
      link: '/permits/create',
      actionText: 'Mulai Pengajuan'
    },
    {
      id: 'pengaduan',
      title: 'Pengaduan Ketertiban',
      description: 'Laporkan gangguan dengan aman.',
      icon: <ShieldAlert className="w-8 h-8 text-[#0a2342]" />,
      link: '/complaints/create',
      actionText: 'Buat Laporan'
    },
    {
      id: 'asisten',
      title: 'Panduan AI Terintegrasi',
      description: 'Dapatkan bantuan instan untuk kebutuhan Anda.',
      icon: <Bot className="w-8 h-8 text-[#0a2342]" />,
      link: '/ai-assistant',
      actionText: 'Tanya Sekarang'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pt-24">
      {/* Services Grid */}
      <div className="flex-grow py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <h2 className="text-3xl font-bold text-[#333366] mb-12 border-b-2 border-gray-200 pb-4 inline-block">
            Layanan Utama Publik
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={service.id} 
                className={`bg-white border border-gray-200 flex flex-col h-full group shadow-sm hover:shadow-md transition-shadow ${index === 1 ? 'border-t-4 border-t-[#e71921]' : 'border-t-4 border-t-[#333366]'}`}
              >
                <div className="p-8 flex-grow flex flex-col">
                  <div className="mb-6">
                    {React.cloneElement(service.icon as React.ReactElement, { className: `w-10 h-10 ${index === 1 ? 'text-[#e71921]' : 'text-[#333366]'}` })}
                  </div>
                  <h3 className="text-xl font-bold text-[#333366] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                    {service.description}
                  </p>
                  
                  <Link 
                    to={service.link}
                    className="inline-block bg-[#333366] hover:bg-[#222244] text-white font-bold py-3 px-6 text-sm text-center transition-colors self-start uppercase tracking-wide rounded-none"
                  >
                    {service.actionText}
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};