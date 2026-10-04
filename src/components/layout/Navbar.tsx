import React, {useState, useRef, useEffect} from "react";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
  Search,
  MapPin,
  Headphones,
  LayoutDashboard,
  User,
  ChevronDown,
  LogIn,
  UserPlus,
} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import logo from "../../assets/logo1.png";
import {useAuthStore} from "../../store/authStore";
import {LanguageSelector} from "./LanguageSelector";

export const Navbar: React.FC = () => {
  const {t} = useTranslation();
  const {isAuthenticated, user, logout} = useAuthStore();
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  const permitUrl =
    user?.role === "ADMIN" ? "/admin/permits" : "/citizen/permits/create";
  const complaintUrl =
    user?.role === "ADMIN" ? "/admin/complaints" : "/citizen/complaints/create";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAuthDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAuthDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="w-full flex flex-col bg-transparent sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="w-full bg-[#1e293b] text-gray-200 py-2 px-4 md:px-8 flex justify-end items-center text-[13px] font-medium tracking-wide">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <LanguageSelector />
          <Link
            to="/contact"
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 hover:text-white transition-colors"
          >
            <Headphones size={14} />
            <span>Pusat Bantuan</span>
          </Link>
          <Link
            to="/ai-assistant"
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 hover:text-white transition-colors"
          >
            <LayoutDashboard size={14} />
            <span>Asisten AI</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4 ml-2 pl-4 border-l border-gray-600">
              <Link
                to={
                  user?.role === "ADMIN"
                    ? "/admin/dashboard"
                    : "/citizen/profile"
                }
                onClick={scrollToTop}
                className="flex items-center space-x-1.5 text-white font-semibold hover:text-[#3b82f6] transition-colors"
              >
                <User size={14} />
                <span>Halo, {user?.name?.split(" ")[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="hover:text-red-400 transition-colors font-semibold"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div
              className="relative ml-2 pl-4 border-l border-gray-600"
              ref={authDropdownRef}
            >
              <button
                type="button"
                onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                className="flex items-center space-x-1.5 hover:text-white font-semibold transition-colors focus:outline-none cursor-pointer"
                aria-expanded={isAuthDropdownOpen}
                aria-haspopup="true"
              >
                <User size={14} />
                <span>Daftar / Masuk</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isAuthDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isAuthDropdownOpen && (
                  <motion.div
                    initial={{opacity: 0, y: -6, scale: 0.98}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    exit={{opacity: 0, y: -6, scale: 0.98}}
                    transition={{duration: 0.15, ease: "easeOut"}}
                    className="absolute right-0 mt-2.5 w-64 bg-white rounded-xl shadow-2xl p-3 z-[70] border border-gray-100 text-gray-800"
                  >
                    <div className="px-2 py-1.5 mb-2 border-b border-gray-100">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Akun SIPEDI
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Akses layanan perizinan & pengaduan
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/login"
                        onClick={() => {
                          setIsAuthDropdownOpen(false);
                          scrollToTop();
                        }}
                        className="flex items-center p-2.5 rounded-lg hover:bg-blue-50/70 transition-colors group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-blue-100/70 text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white transition-colors mr-3 shrink-0">
                          <LogIn size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#2563eb] transition-colors leading-tight">
                            Masuk
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Masuk ke akun Anda
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => {
                          setIsAuthDropdownOpen(false);
                          scrollToTop();
                        }}
                        className="flex items-center p-2.5 rounded-lg hover:bg-emerald-50/70 transition-colors group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mr-3 shrink-0">
                          <UserPlus size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight">
                            Daftar Akun
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Buat akun baru gratis
                          </div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="w-full bg-white/80 backdrop-blur-md px-4 md:px-8 h-20 flex justify-between items-center shadow-sm border-b border-gray-100">
        {/* Left Side: Logo */}
        <Link to="/" onClick={scrollToTop} className="flex items-center space-x-3 group">
          <img
            src={logo}
            alt="SIPEDI Logo"
            className="h-12 w-auto group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-[#0f172a] leading-none">
              SIPEDI
            </span>
            <span className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase mt-1">
              Layanan UMKM
            </span>
          </div>
        </Link>

        {/* Center/Right: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            onClick={scrollToTop}
            className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]"
          >
            Beranda
          </Link>
          <Link
            to="/about"
            onClick={scrollToTop}
            className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]"
          >
            Tentang Kami
          </Link>
          <Link
            to="/services"
            onClick={scrollToTop}
            className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]"
          >
            Layanan
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to={permitUrl}
                onClick={scrollToTop}
                className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]"
              >
                Perizinan
              </Link>
              <Link
                to={complaintUrl}
                onClick={scrollToTop}
                className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]"
              >
                Pengaduan
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin/dashboard"
                  onClick={scrollToTop}
                  className="text-[#0f172a] hover:text-[#2563eb] font-semibold transition-colors text-[15px]"
                >
                  Portal Admin
                </Link>
              )}
            </>
          )}

          <button className="text-gray-400 hover:text-[#0f172a] p-2 transition-colors">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </nav>
      </div>
    </header>
  );
};
