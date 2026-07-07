import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SitePlan3D } from "./SitePlan3D";
import { SplitReveal } from "./SplitReveal";

export const commitment = {
  eyebrow: "01 / Site Overview",
  paragraphs: [
    "Mandalay is the economic centre of Upper Burma and considered the centre of Burmese culture. Mandalay City consists of the following townships: Pyigyidagun, Chanmyathazi, Mahaaungmyay, Chanayethazan (city centre), Aungmyethazan. Amarapura constitutes the North border of the site as well as a buffer township with Mandalay city.",
    "The site is located in Amarapura township which is known today for Burmese traditional handcrafts. The site is also strategically located between Taung Tha Man lake, a tourist attractive place and Pyigyitagon township, industrial zone of Mandalay. According to Yangon-Mandalay highway road in front of the site, any transports can be easily accessible to the site.",
    "Site is located at 35 km from Mandalay International Airport. Site is well connected to existing road network and important touristic destinations. Mandalay continue to grow in the vision of Modernity and International connections. See table above for approximate driving time by road to important destinations.",
  ],
  division: {
    org: "MANDALAY PROJECT",
    team: "Site Location & Urban Context",
  },
  heading: "PROJECT",
  subheading: "MANDALAY",
  // Previously a gstatic.com *cached Google Images thumbnail* URL — those
  // aren't a stable, owned asset and can 404 or get rate-limited without
  // warning. Swapped for a real hotlinkable placeholder in the same style
  // as the rest of the codebase's stock imagery; replace with an actual
  // site photo whenever you have one.
  thumbSrc:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop",
};

export function CommitmentSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".commit-fade", {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 70%",
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="company"
      ref={rootRef}
      className="relative min-h-screen py-32 px-6 md:px-10 overflow-hidden flex flex-col justify-center bg-white dark:bg-ink-deep transition-colors duration-500"
    >
      {/*
        Previously a live OpenStreetMap iframe used purely as a decorative,
        non-interactive blurred backdrop — that gives you default Leaflet
        zoom/attribution chrome you can't style or remove, an extra network
        request, and zero payoff since pointer-events were disabled anyway.
        This is a custom-built, on-brand 3D site plan instead, and the
        hover/tooltip interaction is now actually useful rather than inert.
      */}
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-60 pointer-events-none transition-opacity duration-500">
        <SitePlan3D className="w-full h-full" />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/40 via-white/70 to-white dark:from-ink-deep/40 dark:via-ink-deep/70 dark:to-ink-deep transition-colors duration-500" />

      <div className="relative z-10 max-w-2xl ml-auto mr-0 md:mr-20 pt-8 mt-16 md:mt-0 bg-white/60 dark:bg-ink/80 backdrop-blur-sm p-6 md:p-8 rounded-sm shadow-sm border border-neutral-100 dark:border-gold/20 transition-colors duration-500">
        <p className="commit-fade font-mono text-neutral-400 dark:text-gold/80 text-[10px] tracking-[0.2em] uppercase mb-6 transition-colors duration-500">
          {commitment.eyebrow.toUpperCase()}
        </p>

        <div className="space-y-4 mb-10">
          {commitment.paragraphs.map((para, i) => (
            <p
              key={i}
              className="commit-fade text-neutral-600 dark:text-neutral-300 text-sm font-light leading-relaxed transition-colors duration-500"
            >
              {para}
            </p>
          ))}
        </div>

        <div className="commit-fade flex items-center gap-3 border border-neutral-200 dark:border-gold/30 rounded-none px-6 py-3 w-fit mb-3 bg-white dark:bg-ink transition-colors duration-500">
          <span className="font-sans font-medium text-neutral-900 dark:text-gold text-[10px] uppercase tracking-[0.2em] transition-colors duration-500">
            {commitment.division.org}
          </span>
        </div>
        <p className="commit-fade text-neutral-400 dark:text-gold/60 text-[10px] uppercase tracking-[0.1em] transition-colors duration-500">
          {commitment.division.team}
        </p>
      </div>

      <div className="relative z-10 font-serif font-light text-[clamp(3.5rem,11vw,8rem)] leading-none mt-24 select-none tracking-tight text-neutral-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-gold dark:via-gold-light dark:to-gold transition-colors duration-500">
        <SplitReveal text={commitment.heading} by="char" as="div" />
        <SplitReveal
          text={commitment.subheading}
          by="char"
          delay={0.15}
          as="div"
          className="italic text-neutral-400 dark:text-gold/60 transition-colors duration-500"
        />
      </div>

      <div className="commit-fade absolute right-6 md:right-16 bottom-16 w-40 md:w-56 aspect-[4/3] overflow-hidden border border-neutral-200 dark:border-gold/20 shadow-xl dark:shadow-[0_20px_40px_rgba(184,152,81,0.15)] bg-neutral-100 dark:bg-ink z-10 hidden sm:block transition-colors duration-500">
        <img
          src={commitment.thumbSrc}
          alt=""
          className="w-full h-full object-cover grayscale dark:grayscale-0 mix-blend-multiply dark:mix-blend-normal opacity-80 dark:opacity-90 transition-colors duration-500"
        />
      </div>
    </section>
  );
}
