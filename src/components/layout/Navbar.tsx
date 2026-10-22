import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Headphones,
  LayoutDashboard,
  User,
  ChevronDown,
  LogIn,
  UserPlus,
  MoreVertical,
  X,
  Home,
  Info,
  Grid,
  FileText,
  MessageSquare,
  Bot,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo1.png";
import { useAuthStore } from "../../store/authStore";
import { LanguageSelector } from "./LanguageSelector";

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isCitizen = isAuthenticated && user?.role !== "ADMIN";

  // URL khusus Warga/Citizen
  const permitUrl = isAuthenticated 
    ? "/citizen/permits/create" 
    : "/login";

  const complaintUrl = isAuthenticated 
    ? "/citizen/complaints/create" 
    : "/login";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const checkActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
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
        setIsMobileMenuOpen(false);
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
      {/* Top Utility Bar (Desktop) */}
      <div className="hidden md:flex w-full bg-[#1e293b] text-gray-200 py-2 px-4 md:px-8 justify-end items-center text-[13px] font-medium tracking-wide">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <LanguageSelector />
          <NavLink
            to="/contact"
            onClick={scrollToTop}
            className={({ isActive }) =>
              `flex items-center space-x-1.5 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "hover:text-white"
              }`
            }
          >
            <Headphones size={14} />
            <span>Pusat Bantuan</span>
          </NavLink>
          <NavLink
            to="/ai-assistant"
            onClick={scrollToTop}
            className={({ isActive }) =>
              `flex items-center space-x-1.5 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={14} />
            <span>Asisten AI</span>
          </NavLink>

          {/* Hanya tampilkan profil */}
          {isCitizen ? (
            <div className="flex items-center space-x-4 ml-2 pl-4 border-l border-gray-600">
              <Link
                to="/citizen/profile"
                onClick={scrollToTop}
                className="flex items-center space-x-1.5 text-white font-semibold hover:text-[#3b82f6] transition-colors"
              >
                <User size={14} />
                <span>Halo, {user?.name?.split(" ")[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="hover:text-red-400 transition-colors font-semibold cursor-pointer"
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
                  className={`transition-transform duration-200 ${
                    isAuthDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Desktop */}
              <AnimatePresence>
                {isAuthDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
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
                          logout(); 
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
                          logout(); 
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
      <div className="w-full bg-white/90 backdrop-blur-md px-4 md:px-8 h-16 md:h-20 flex justify-between items-center shadow-sm border-b border-gray-100">
        {/* Left Side: Logo */}
        <Link
          to="/"
          onClick={scrollToTop}
          className="flex items-center space-x-2 md:space-x-3 group"
        >
          <img
            src={logo}
            alt="SIPEDI Logo"
            className="h-9 md:h-12 w-auto group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-[#0f172a] leading-none">
              SIPEDI
            </span>
            <span className="text-[9px] md:text-[11px] font-semibold text-gray-500 tracking-widest uppercase mt-0.5 md:mt-1">
              Layanan UMKM
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink
            to="/"
            end
            onClick={scrollToTop}
            className={({ isActive }) =>
              `relative text-[15px] font-bold transition-all ${
                isActive
                  ? "text-[#2563eb] font-extrabold after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#2563eb] after:rounded-full"
                  : "text-[#0f172a] hover:text-[#2563eb]"
              }`
            }
          >
            Beranda
          </NavLink>

          <NavLink
            to="/about"
            onClick={scrollToTop}
            className={({ isActive }) =>
              `relative text-[15px] font-bold transition-all ${
                isActive
                  ? "text-[#2563eb] font-extrabold after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#2563eb] after:rounded-full"
                  : "text-[#0f172a] hover:text-[#2563eb]"
              }`
            }
          >
            Tentang Kami
          </NavLink>

          <NavLink
            to="/services"
            onClick={scrollToTop}
            className={({ isActive }) =>
              `relative text-[15px] font-bold transition-all ${
                isActive
                  ? "text-[#2563eb] font-extrabold after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#2563eb] after:rounded-full"
                  : "text-[#0f172a] hover:text-[#2563eb]"
              }`
            }
          >
            Layanan
          </NavLink>

          {/* Perizinan & Pengaduan khusus Warga jika belum login / jika Admin */}
          {isCitizen && (
            <>
              <NavLink
                to={permitUrl}
                onClick={scrollToTop}
                className={() =>
                  `relative text-[15px] font-bold transition-all ${
                    checkActive("/citizen/permits")
                      ? "text-[#2563eb] font-extrabold after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#2563eb] after:rounded-full"
                      : "text-[#0f172a] hover:text-[#2563eb]"
                  }`
                }
              >
                Perizinan
              </NavLink>

              <NavLink
                to={complaintUrl}
                onClick={scrollToTop}
                className={() =>
                  `relative text-[15px] font-bold transition-all ${
                    checkActive("/citizen/complaints")
                      ? "text-[#2563eb] font-extrabold after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#2563eb] after:rounded-full"
                      : "text-[#0f172a] hover:text-[#2563eb]"
                  }`
                }
              >
                Pengaduan
              </NavLink>
            </>
          )}

          <button className="text-gray-400 hover:text-[#0f172a] p-2 transition-colors cursor-pointer">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </nav>

        {/* Mobile Right Controls */}
        <div className="flex items-center space-x-1 md:hidden">
          <button
            type="button"
            aria-label="Cari"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Menu"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] md:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-xs bg-[#0f172a] text-white z-[70] p-5 pb-24 flex flex-col justify-between overflow-y-auto border-l border-slate-800 shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <button
                    type="button"
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center space-x-2">
                    <img src={logo} alt="SIPEDI Logo" className="h-7 w-auto" />
                    <span className="font-extrabold text-lg text-white">
                      SIPEDI
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <NavLink
                    to="/"
                    end
                    onClick={() => {
                      toggleMobileMenu();
                      scrollToTop();
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                      }`
                    }
                  >
                    <Home size={18} className="text-blue-400" />
                    <span>Beranda</span>
                  </NavLink>

                  <NavLink
                    to="/services"
                    onClick={() => {
                      toggleMobileMenu();
                      scrollToTop();
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                      }`
                    }
                  >
                    <Grid size={18} className="text-emerald-400" />
                    <span>Layanan Terpadu</span>
                  </NavLink>

                  <NavLink
                    to="/about"
                    onClick={() => {
                      toggleMobileMenu();
                      scrollToTop();
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                      }`
                    }
                  >
                    <Info size={18} className="text-amber-400" />
                    <span>Tentang Kami</span>
                  </NavLink>

                  <NavLink
                    to="/contact"
                    onClick={() => {
                      toggleMobileMenu();
                      scrollToTop();
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                      }`
                    }
                  >
                    <Headphones size={18} className="text-purple-400" />
                    <span>Pusat Bantuan / CS</span>
                  </NavLink>

                  <NavLink
                    to="/ai-assistant"
                    onClick={() => {
                      toggleMobileMenu();
                      scrollToTop();
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                      }`
                    }
                  >
                    <Bot size={18} className="text-cyan-400" />
                    <span>Asisten AI</span>
                  </NavLink>

                  {isCitizen && (
                    <div className="my-3 border-t border-slate-800 pt-3">
                      <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Layanan Pengguna
                      </p>
                      <NavLink
                        to={permitUrl}
                        onClick={() => {
                          toggleMobileMenu();
                          scrollToTop();
                        }}
                        className={() =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                            checkActive("/citizen/permits")
                              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                              : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                          }`
                        }
                      >
                        <FileText size={18} className="text-blue-400" />
                        <span>Perizinan</span>
                      </NavLink>
                      <NavLink
                        to={complaintUrl}
                        onClick={() => {
                          toggleMobileMenu();
                          scrollToTop();
                        }}
                        className={() =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                            checkActive("/citizen/complaints")
                              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                              : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                          }`
                        }
                      >
                        <MessageSquare size={18} className="text-rose-400" />
                        <span>Pengaduan</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Drawer */}
              <div className="space-y-4 pt-4 border-t border-slate-800 mt-6">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs text-slate-400">Pilih Bahasa</span>
                  <LanguageSelector />
                </div>

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-slate-800/60 rounded-xl flex items-center space-x-3">
                      <User className="text-blue-400" size={18} />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {user?.role?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        toggleMobileMenu();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-semibold text-sm transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => {
                        logout(); 
                        toggleMobileMenu();
                        scrollToTop();
                      }}
                      className="flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-colors"
                    >
                      <LogIn size={14} />
                      <span>Masuk</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => {
                        logout(); 
                        toggleMobileMenu();
                        scrollToTop();
                      }}
                      className="flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-colors"
                    >
                      <UserPlus size={14} />
                      <span>Daftar</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};