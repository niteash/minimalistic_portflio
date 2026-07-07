import { useState, useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Preloader } from "./components/Preloader";
import { Cursor } from "./components/Cursor";
import { WebglBackground } from "./components/WebglBackground";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { CommitmentSection } from "./components/CommitmentSection";
import { ScrollVideoReveal } from "./components/ScrollVideoReveal";
import { BusinessCards } from "./components/BusinessCards";
import { Strengths } from "./components/Strengths";
import { TeamRecruitment } from "./components/TeamRecruitment";
import { AboutUs } from "./components/AboutUs";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";
import { Chatbot } from "./components/Chatbot";
import { AnimatePresence, motion } from "motion/react";
import { LanguageProvider } from "./lib/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);

  // Initialize Lenis and scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // @ts-ignore
    window.appLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    function update(time: number) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return (
    <LanguageProvider>
      <div className="relative min-h-screen bg-transparent selection:bg-neutral-900/10 selection:text-neutral-900 text-[#1A1A1A] font-sans">
        <Cursor />

        <WebglBackground />

        <AnimatePresence mode="wait">
          {loading ? (
            <Preloader key="preloader" onComplete={() => setLoading(false)} />
          ) : (
            <motion.div
              key="main-content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Navbar />
              <main>
                <Hero />
                <CommitmentSection />
                <ScrollVideoReveal />
                <BusinessCards />
                <Strengths />
                <TeamRecruitment />
                <AboutUs />
              </main>

              <Footer />
              <BackToTop />
              <Chatbot />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LanguageProvider>
  );
}
