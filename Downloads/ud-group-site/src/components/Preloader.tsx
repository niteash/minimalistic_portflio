import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogoSVG } from "./Logo";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 2;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 800); // Wait a bit at 100%
      }
      setProgress(currentProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFFFF] dark:bg-[#0a0a0a]"
      initial={{ opacity: 1 }}
      exit={{
        y: "-100%",
        transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] },
      }}
    >
      <div className="relative w-64 h-40">
        {/* Base Logo (Faded) */}
        <LogoSVG className="absolute inset-0 w-full h-full text-[#B89851] opacity-20" />

        {/* Filling Logo */}
        <LogoSVG
          className="absolute inset-0 w-full h-full text-[#B89851]"
          fillProgress={progress}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 font-mono text-sm tracking-widest text-[#B89851]"
      >
        {progress}%
      </motion.div>
    </motion.div>
  );
}
