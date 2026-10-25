import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Info, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import notificationService from '../../services/notificationService';

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'PERMIT_STATUS' | 'NEW_COMPLAINT' | 'SYSTEM_INFO';
  link_url?: string;
  is_read: number;
  created_at: string;
}

export const NotificationDropdown: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await notificationService.getNotifications();
    setNotifications(data.filter(n => n.is_read === 0));
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.length;

  const markAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications([]);
    }
  };

  const markSingleAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const success = await notificationService.markAsRead(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleItemClick = async (item: NotificationItem) => {
    await notificationService.markAsRead(item.id);
    setNotifications(prev => prev.filter(n => n.id !== item.id));

    let targetUrl = item.link_url;

    if (!targetUrl) {
      const lowerTitle = item.title.toLowerCase();
      if (lowerTitle.includes('audit') || lowerTitle.includes('sistem')) {
        targetUrl = '/admin/audit-logs';
      } else if (lowerTitle.includes('pengaduan') || item.type === 'NEW_COMPLAINT') {
        targetUrl = '/admin/complaints';
      } else if (lowerTitle.includes('perizinan') || lowerTitle.includes('izin') || item.type === 'PERMIT_STATUS') {
        targetUrl = '/admin/permits';
      } else {
        targetUrl = '/admin/dashboard';
      }
    }

    navigate(targetUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-30 overflow-hidden font-sans">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">{t('notifications.title')}</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-700 rounded-full">
                    {unreadCount} {t('notifications.new')}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> {t('notifications.markAll')}
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">{t('notifications.loading')}</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium space-y-1">
                  <p className="font-bold text-slate-600">{t('notifications.empty')}</p>
                  <p className="text-[11px] text-slate-400">{t('notifications.emptySub')}</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-4 hover:bg-slate-100/80 transition-colors cursor-pointer flex gap-3 group relative bg-blue-50/30"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {item.type === 'NEW_COMPLAINT' || item.title.includes('Pengaduan') ? (
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle className="w-4 h-4" /></div>
                      ) : item.type === 'PERMIT_STATUS' || item.title.includes('Perizinan') ? (
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FileText className="w-4 h-4" /></div>
                      ) : (
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Info className="w-4 h-4" /></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                          {item.created_at ? item.created_at.split(' ')[1]?.substring(0, 5) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.message}</p>
                    </div>

                    {/* Tombol Tandai Dibaca */}
                    <button
                      onClick={(e) => markSingleAsRead(e, item.id)}
                      title="Selesaikan & hilangkan dari daftar"
                      className="absolute right-3 top-4 p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
