import React from "react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  FileText,
  ShieldAlert,
  Bot,
  ArrowRight,
  Building,
  Users,
  Activity,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-950 text-white min-h-[620px] flex items-center">
        {/* Background Image & Readable Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle gradient overlay on left for text legibility without drowning image colors */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-black/30 z-10" />
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 14,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
            src="https://cdn.motherhood.com.my/wp-content/uploads/2022/04/01115603/bazaar-ramadan1.jpg"
            alt="Suasana Pelayanan & UMKM"
            className="w-full h-full object-cover object-center opacity-90"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <motion.div
            className="max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={itemVariants}
              className="text-primary-300 font-semibold tracking-wider uppercase text-sm mb-4 block"
            >
              Sistem Perizinan Digital Mikro
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              {t("hero.title")}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/permits/create"
                className="bg-primary-500 hover:bg-primary-400 text-white px-8 py-4 rounded-md font-semibold transition-transform hover:scale-105 active:scale-95 flex items-center justify-center text-lg shadow-lg"
              >
                {t("hero.ctaPermit")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/complaints/create"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-md font-semibold transition-transform hover:scale-105 active:scale-95 flex items-center justify-center text-lg"
              >
                {t("hero.ctaComplaint")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Overlapping Service Cards (Inspiration from user image) */}
      <section className="relative z-30 -mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{once: true, margin: "-100px"}}
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-primary-500 transition-all hover:-translate-y-2 hover:shadow-2xl group"
          >
            <div className="h-14 w-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <FileText className="h-7 w-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t("services.permitTitle")}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t("services.permitDesc")}
            </p>
            <Link
              to="/permits"
              className="text-primary-600 font-medium flex items-center hover:text-primary-800"
            >
              Mulai Pengajuan{" "}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-danger-500 transition-all hover:-translate-y-2 hover:shadow-2xl group"
          >
            <div className="h-14 w-14 bg-danger-50 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <ShieldAlert className="h-7 w-7 text-danger-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t("services.complaintTitle")}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t("services.complaintDesc")}
            </p>
            <Link
              to="/complaints"
              className="text-danger-600 font-medium flex items-center hover:text-danger-800"
            >
              Buat Laporan{" "}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-success-500 transition-all hover:-translate-y-2 hover:shadow-2xl group"
          >
            <div className="h-14 w-14 bg-success-50 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <Bot className="h-7 w-7 text-success-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t("services.aiTitle")}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t("services.aiDesc")}
            </p>
            <Link
              to="/ai-assistant"
              className="text-success-600 font-medium flex items-center hover:text-success-800"
            >
              Tanya Sekarang{" "}
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{opacity: 0, scale: 0.95}}
          whileInView={{opacity: 1, scale: 1}}
          transition={{duration: 0.6}}
          viewport={{once: true}}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 transition-transform hover:scale-105">
              <Building className="h-12 w-12 text-primary-400 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">
                12,450+
              </div>
              <div className="text-gray-600">Izin Diterbitkan</div>
            </div>
            <div className="p-6 transition-transform hover:scale-105">
              <Activity className="h-12 w-12 text-success-400 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Pengaduan Selesai</div>
            </div>
            <div className="p-6 transition-transform hover:scale-105">
              <Users className="h-12 w-12 text-primary-400 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">
                45,000+
              </div>
              <div className="text-gray-600">Masyarakat Terbantu</div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
