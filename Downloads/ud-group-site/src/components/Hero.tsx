import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProgressiveVideo } from "../hooks/useProgressiveVideo";
import { useLanguage } from "../lib/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { videoRef } = useProgressiveVideo(true);
  const { t } = useLanguage();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-ghost", {
        opacity: 0,
        y: 30,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.from(".hero-scale-anim", {
        opacity: 0,
        scale: 0.92,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.35,
      });

      // Pin the section and expand the video on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "+=100%",
          scrub: true,
          pin: true,
          pinSpacing: true,
        },
      });

      tl.to(
        ".hero-panel",
        {
          width: "100vw",
          height: "100vh",
          maxWidth: "none",
          borderRadius: 0,
          boxShadow: "none",
          ease: "power2.inOut",
        },
        0,
      );

      tl.to(
        ".hero-ghost, .hero-marquee-fade, .scroll-more",
        {
          opacity: 0,
          ease: "power2.inOut",
        },
        0,
      );

      tl.to(
        ".hero-video",
        {
          opacity: 1,
          ease: "power2.inOut",
        },
        0,
      );

      // Continuous marquee animation
      gsap.to(".hero-marquee", {
        xPercent: -50,
        repeat: -1,
        duration: 15,
        ease: "none",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative h-screen min-h-180 overflow-hidden flex flex-col justify-center bg-white dark:bg-[#121212] transition-colors duration-500"
    >
      {/* Ghost headline, top layer */}
      <div className="hero-ghost absolute top-28 left-6 md:left-10 font-sans font-bold text-neutral-200 dark:text-[#B89851]/10 leading-[0.95] text-[clamp(2.2rem,6vw,4.2rem)] mix-blend-multiply dark:mix-blend-screen z-0 transition-colors duration-500">
        {t("hero.tagline")
          .split(" ")
          .map((w, i) => (
            <div key={i}>{w}</div>
          ))}
      </div>

      {/* Outer Marquee (Black text) */}
      <div className="hero-marquee-fade absolute top-1/2 left-1/2 w-screen -translate-x-1/2 -translate-y-1/2 z-5 pointer-events-none">
        <div className="hero-scale-anim w-full">
          <div className="hero-marquee flex items-center w-max text-neutral-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#B89851] dark:via-[#e6c875] dark:to-[#B89851] font-serif italic text-[clamp(4.5rem,10vw,8rem)] leading-normal whitespace-nowrap py-4">
            <span className="pr-12">{t("hero.marquee")}</span>
            <span className="pr-12">{t("hero.marquee")}</span>
            <span className="pr-12">{t("hero.marquee")}</span>
            <span className="pr-12">{t("hero.marquee")}</span>
          </div>
        </div>
      </div>

      {/* Center video panel */}
      <div className="hero-scale-anim hero-panel relative mx-auto w-[78%] max-w-180 aspect-16/10 rounded-sm overflow-hidden shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(184,152,81,0.25)] z-10 flex items-center justify-center bg-neutral-200 dark:bg-[#1a1a1a] transition-colors duration-500 will-change-transform">
        <video
          ref={videoRef}
          loop
          muted
          autoPlay
          playsInline
          preload="auto"
          className={`hero-video absolute inset-0 w-full h-full object-cover opacity-80 dark:opacity-60`}
        >
          <source
            src="https://res.cloudinary.com/dcdc4hj6v/video/upload/v1782373187/I_want_the_output_format_with_xvccoz.mp4"
            type="video/mp4"
          />
        </video>

        {/* Inner Marquee (Outlined text) */}
        <div className="hero-marquee-fade absolute top-1/2 left-1/2 w-screen -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="w-full">
            <div className="hero-marquee flex items-center w-max text-transparent font-serif italic text-[clamp(4.5rem,10vw,8rem)] leading-normal whitespace-nowrap text-stroke-white py-4">
              <span className="pr-12">{t("hero.marquee")}</span>
              <span className="pr-12">{t("hero.marquee")}</span>
              <span className="pr-12">{t("hero.marquee")}</span>
              <span className="pr-12">{t("hero.marquee")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-more absolute bottom-10 left-6 md:left-10 flex items-center gap-2 text-neutral-500 dark:text-[#B89851]/80 text-[10px] uppercase font-mono tracking-widest z-0 transition-colors duration-500">
        <span className="animate-bounce">↓</span> {t("hero.scroll")}
      </div>
    </section>
  );
}
