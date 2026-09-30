import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Globe } from 'lucide-react';

export const IndonesiaFlag: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={`${className} rounded-xs overflow-hidden shadow-xs ring-1 ring-black/15 shrink-0`} viewBox="0 0 640 480">
    <path fill="#e70011" d="M0 0h640v240H0z"/>
    <path fill="#ffffff" d="M0 240h640v240H0z"/>
  </svg>
);

export const EnglishFlag: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={`${className} rounded-xs overflow-hidden shadow-xs ring-1 ring-black/15 shrink-0`} viewBox="0 0 640 480">
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 64V0h75z"/>
    <path fill="#C8102E" d="m424 288 216 159v33h-44L368 333 424 288zM640 0v10L454 150l38 31L640 40V0zM196 182 0 35V0h42l200 149-46 33zm44 108L0 468v12h38l198-147 4-45z"/>
    <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z"/>
    <path fill="#C8102E" d="M267 0h106v480H267zM0 187h640v106H0z"/>
  </svg>
);

interface LanguageOption {
  code: string;
  label: string;
  subLabel: string;
  flag: React.FC<{ className?: string }>;
}

const languages: LanguageOption[] = [
  {
    code: 'id',
    label: 'Indonesia',
    subLabel: 'Bahasa Indonesia',
    flag: IndonesiaFlag,
  },
  {
    code: 'en',
    label: 'English',
    subLabel: 'English (UK/US)',
    flag: EnglishFlag,
  },
];

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];
  const CurrentFlag = currentLang.flag;

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors focus:outline-none cursor-pointer rounded-none border border-transparent hover:border-white/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex items-center space-x-2">
          <CurrentFlag className="w-4 h-3" />
          <span>{currentLang.label}</span>
        </span>
        <ChevronDown
          size={14}
          className={`text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 bg-white shadow-xl py-1 z-[70] border-t-2 border-[#333366]"
          >
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Pilih Bahasa
              </p>
            </div>

            <div className="flex flex-col">
              {languages.map((item) => {
                const FlagComponent = item.flag;
                const isSelected = i18n.language === item.code;

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer rounded-none ${
                      isSelected
                        ? 'bg-[#333366] text-white'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FlagComponent className="w-5 h-3.5 shadow-sm" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider">{item.label}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-white">
                        <Check size={16} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
