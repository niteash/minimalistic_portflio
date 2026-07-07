import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitReveal } from "./SplitReveal";

gsap.registerPlugin(ScrollTrigger);

export const scrollReveal = {
  eyebrow: "SITE LOCATION",
  heading: "INTEGRATED SPACES",
  bodyItems: [
    "Prime Location: Conveniently situated with easy access to essential services.",
    "Sustainable Design: Energy-efficient buildings, green rooftops, and eco-friendly features.",
    "Luxury Living: High-end residences with modern amenities.",
    "Investment Potential: Strong growth prospects in Mandalay’s booming real estate market.",
    "High return on investment (ROI) potential.",
    "Exclusive early-bird offers for investors.",
    "A well-planned, future-proof community development.",
    "Partnerships: Open for collaborations with developers, realtors, and financial institutions.",
  ],
  posterSrc:
    "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782361875/siteLocation_lu6lrk.jpg",
  // Was previously defined but unused — the section scrubbed a static
  // <img>, not the video this data implies. Now actually wired up below.
  // This is a generated placeholder; swap in real drone/site b-roll
  // (same Cloudinary account as the Hero video) when you have it.
  videoSrc: "/media/placeholder-site-location.mp4",
};

export function ScrollVideoReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const video = videoRef.current;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=140%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          if (video && video.duration) {
            video.currentTime = self.progress * video.duration;
          }
        },
      });

      gsap.fromTo(
        ".reveal-caption",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "top 20%",
            scrub: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-white dark:bg-ink-deep transition-colors duration-500"
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster={scrollReveal.posterSrc}
        className="absolute inset-0 w-full h-full object-cover scale-110 opacity-80 dark:opacity-60 transition-opacity duration-500"
      >
        <source src={scrollReveal.videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-white/80 dark:bg-black/50 transition-colors duration-500" />

      <div className="reveal-caption absolute bottom-12 left-6 md:left-10 max-w-md z-10">
        <p className="font-mono text-neutral-500 dark:text-gold/80 text-[10px] uppercase tracking-[0.2em] mb-3 transition-colors duration-500">
          {scrollReveal.eyebrow.toUpperCase()}
        </p>
        <h2 className="font-serif font-light text-neutral-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-gold dark:via-gold-light dark:to-gold text-[clamp(2rem,4vw,3.5rem)] leading-tight tracking-tight transition-all duration-500">
          <SplitReveal text={scrollReveal.heading} by="word" />
        </h2>
        <ul className="mt-4 space-y-2 text-neutral-600 dark:text-neutral-300 text-sm font-light leading-relaxed transition-colors duration-500 list-disc list-inside">
          {scrollReveal.bodyItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
