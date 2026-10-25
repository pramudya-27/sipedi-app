import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import idTranslation from './locales/id/translation.json';
import enTranslation from './locales/en/translation.json';

// Ambil preferensi bahasa dari localStorage atau default ke 'id' (Bahasa Indonesia)
const savedLanguage = typeof window !== 'undefined' 
  ? (localStorage.getItem('sipedi_language') || 'id') 
  : 'id';

const resources = {
  id: {
    translation: idTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'id', // Bahasa Indonesia sebagai default dan fallback
    interpolation: {
      escapeValue: false, // React sudah mengamankan XSS secara otomatis
    },
  });

// Simpan preferensi bahasa pengguna setiap kali terjadi pergantian bahasa
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sipedi_language', lng);
  }
});

export default i18n;
