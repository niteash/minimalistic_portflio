import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { LogoSVG } from "./Logo";
import { useLanguage } from "../lib/LanguageContext";

const navLinks = [
  { key: "nav.company", href: "#company" },
  { key: "nav.business", href: "#business" },
  { key: "nav.strengths", href: "#strengths" },
  { key: "nav.recruitment", href: "#recruitment" },
  { key: "nav.news", href: "#news" },
  { key: "nav.contact", href: "#contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageToggle = () => {
    if (language === "EN") setLanguage("MM");
    else if (language === "MM") setLanguage("ZH");
    else setLanguage("EN");
  };

  useEffect(() => {
    // Check initial preference
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleDark = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 transition-all duration-500 ${
          scrolled || isOpen
            ? "bg-white/70 dark:bg-[#121212]/80 backdrop-blur-xl backdrop-saturate-150 border-b border-black/5 dark:border-white/5 py-4 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <a
          href="/"
          className="hover-target group flex flex-col uppercase tracking-widest z-50"
        >
          <LogoSVG className="w-14 h-auto text-neutral-900 dark:text-[#B89851] transition-colors duration-500" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 dark:text-[#B89851]/60 transition-colors duration-500 group-hover:text-neutral-900 dark:group-hover:text-[#e6c875]">
            Amara Garden City
          </span>
        </a>

        <div className="flex items-center gap-6">
          <button
            onClick={handleLanguageToggle}
            className="hover-target z-50 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 dark:border-[#B89851]/30 text-neutral-900 dark:text-[#B89851] transition-all hover:bg-neutral-100 dark:hover:bg-[#B89851]/10 text-xs font-bold"
            aria-label="Toggle language"
          >
            {language}
          </button>

          <button
            onClick={toggleDark}
            className="hover-target z-50 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 dark:border-[#B89851]/30 text-neutral-900 dark:text-[#B89851] transition-all hover:bg-neutral-100 dark:hover:bg-[#B89851]/10"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hover-target group flex items-center gap-3 text-xs font-mono tracking-[0.2em] uppercase transition-colors z-50 text-neutral-900 dark:text-[#B89851]"
          >
            <span className="hidden md:block pt-0.5">
              {isOpen ? "CLOSE" : "MENU"}
            </span>
            <div
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? "border-[#B89851] bg-[#B89851]/10 text-[#B89851]" : "border-neutral-200 dark:border-[#B89851]/30 group-hover:border-[#B89851] group-hover:bg-[#B89851]/5 dark:group-hover:bg-[#B89851]/10"}`}
            >
              {isOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </div>
          </button>
        </div>
      </motion.header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-24 right-6 md:right-12 z-40 w-64 rounded-2xl bg-white/70 dark:bg-[#121212]/90 backdrop-blur-2xl border border-white/50 dark:border-[#B89851]/20 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(184,152,81,0.1)] overflow-hidden"
          >
            <nav className="flex flex-col py-4">
              {navLinks.map((link, i) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="group relative flex items-center px-6 py-3.5 text-xs font-mono tracking-[0.2em] text-neutral-700 dark:text-[#B89851]/80 hover:text-[#B89851] dark:hover:text-[#e6c875] transition-colors duration-300 hover:bg-white/60 dark:hover:bg-[#B89851]/10"
                >
                  <span className="text-[10px] text-[#B89851]/60 mr-4 w-4">{`0${i + 1}`}</span>
                  {t(link.key)}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
