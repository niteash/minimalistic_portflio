import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { LiquidImage } from "./LiquidImage";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { TiltCard } from "./TiltCard";
import { MagneticButton } from "./MagneticButton";

gsap.registerPlugin(ScrollTrigger);

const businessAreas = {
  eyebrow: "03 / Capabilities",
  heading: "BUSINESS AREAS",
  cards: [
    {
      index: "01",
      title: "Car Production",
      body: "Creating sustainable urban environments and premium commercial spaces that redefine city skylines.",
      image:
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782360652/lightTruck1_keu9ml.webp",
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?q=80&w=2067&auto=format&fit=crop",
      ],
      href: "#",
    },
    {
      index: "02",
      title: "Custom Generator Assembly & Sale",
      body: "Building robust transportation networks and public facilities that connect communities.",
      image:
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782360846/generator_hryyau.jpg",
      images: [
        "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541888086925-0c13bb135f60?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=2072&auto=format&fit=crop",
      ],
      href: "#",
    },
    {
      index: "03",
      title: "Crane Services",
      body: "Pioneering green energy solutions for a sustainable and resilient future.",
      image:
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782360742/crane_geztwz.png",
      images: [
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782391140/crane1_jcsbxi.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782391138/crane2_t7skyh.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782391154/crane3_qrf3tg.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782391176/crane4_kq4vti.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782391189/crane5_wmxbj2.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782391206/crane6_vaghov.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782392321/crane7_iuy9rt.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782392324/crane8_osaid5.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782392329/crane9_ct8lxr.jpg",
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782392334/crane10_dh6k2f.jpg",
      ],
      href: "#",
    },
    {
      index: "04",
      title: "Real Estate Development",
      body: "Developing next-generation building materials that are lighter, stronger, and eco-friendly.",
      image:
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782360965/construction_zuwsoq.jpg",
      images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?q=80&w=2097&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop",
      ],
      href: "#",
    },
  ],
};

function BusinessCardItem({
  card,
  onClick,
}: {
  card: (typeof businessAreas.cards)[0];
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TiltCard maxTilt={5} className="shrink-0 h-full">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-[320px] md:w-[420px] h-full rounded-sm overflow-hidden group border border-transparent dark:border-[#B89851]/20 transition-colors duration-500 text-left cursor-pointer"
      >
        <div className="absolute inset-0 bg-neutral-200 dark:bg-[#1a1a1a] -z-10 transition-colors duration-500" />

        <CanvasErrorBoundary
          fallback={
            <img
              src={card.image}
              alt={card.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-80 dark:opacity-70 transition-all duration-700"
            />
          }
        >
          <LiquidImage
            src={card.image}
            isHovered={isHovered}
            className="absolute inset-0 w-full h-full opacity-80 dark:opacity-70 transition-opacity duration-500"
          />
        </CanvasErrorBoundary>

        <div
          className="absolute inset-0 z-10 pointer-events-none transition-colors duration-500"
          style={{
            background:
              "linear-gradient(180deg, rgba(26,26,26,0) 35%, rgba(26,26,26,0.95) 100%)",
          }}
        />
        <span className="absolute top-6 left-6 font-mono text-white/70 dark:text-[#B89851]/80 text-xs z-20 pointer-events-none transition-colors duration-500">
          ( {card.index} )
        </span>
        <div className="absolute bottom-8 left-8 right-8 z-20 pointer-events-none">
          <h3 className="font-serif font-light text-white dark:text-[#B89851] text-2xl md:text-3xl mb-3 transition-colors duration-500">
            {card.title}
          </h3>
          <p className="font-sans text-white/70 dark:text-neutral-300 text-sm font-light leading-relaxed pr-12 transition-colors duration-500">
            {card.body}
          </p>
        </div>
        <span className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-white/10 dark:bg-[#B89851]/20 backdrop-blur-md border border-white/20 dark:border-[#B89851]/30 grid place-items-center text-white dark:text-[#B89851] group-hover:bg-white dark:group-hover:bg-[#B89851] group-hover:text-neutral-900 dark:group-hover:text-white transition-colors z-20 pointer-events-none duration-500">
          <ArrowRight size={18} strokeWidth={1.5} />
        </span>
      </button>
    </TiltCard>
  );
}

export function BusinessCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<
    (typeof businessAreas.cards)[0] | null
  >(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const getDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${getDistance()}`,
        scrub: true,
        pin: true,
        invalidateOnRefresh: true,
        animation: gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
        }),
      });

      const onResize = () => trigger.refresh();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (activeCard !== null) {
      document.body.style.overflow = "hidden";
      // @ts-ignore
      if (window.appLenis) window.appLenis.stop();
    } else {
      document.body.style.overflow = "";
      // @ts-ignore
      if (window.appLenis) window.appLenis.start();
    }

    return () => {
      document.body.style.overflow = "";
      // @ts-ignore
      if (window.appLenis) window.appLenis.start();
    };
  }, [activeCard]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCard) {
      setCurrentImageIndex((prev) => (prev + 1) % activeCard.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCard) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + activeCard.images.length) % activeCard.images.length,
      );
    }
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-neutral-100 dark:bg-[#0f0f0f] overflow-hidden h-screen flex flex-col justify-center transition-colors duration-500"
      >
        <div className="flex items-center gap-6 px-6 md:px-10 pt-10 pb-12 shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-neutral-900 dark:bg-[#1a1a1a] rounded-full text-white dark:text-[#B89851] animate-[spin_8s_linear_infinite] border dark:border-[#B89851]/30 transition-colors duration-500">
            <span className="font-serif text-xl md:text-2xl font-medium tracking-widest">
              UD
            </span>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-[#B89851]/60 mb-2 transition-colors duration-500">
              {businessAreas.eyebrow}
            </p>
            <h2 className="font-serif font-light text-3xl md:text-5xl text-neutral-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#B89851] dark:to-[#e6c875] tracking-tight transition-colors duration-500">
              {businessAreas.heading}
            </h2>
          </div>
        </div>

        <div
          ref={trackRef}
          className="relative flex gap-6 px-6 md:px-10 pb-16 w-fit h-[60vh] min-h-[400px]"
        >
          {businessAreas.cards.map((card) => (
            <BusinessCardItem
              key={card.index}
              card={card}
              onClick={() => {
                setActiveCard(card);
                setCurrentImageIndex(0);
              }}
            />
          ))}
        </div>
      </section>

      {/* Project Photos Modal */}
      {activeCard !== null && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-6xl h-[80vh] flex flex-col justify-center items-center">
            <MagneticButton
              strength={0.5}
              className="absolute -top-12 right-0 md:top-0 md:-right-16 z-10"
            >
              <button
                onClick={() => setActiveCard(null)}
                className="p-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </MagneticButton>

            <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-black/50 border border-white/10 shadow-2xl">
              <img
                key={currentImageIndex}
                src={activeCard.images[currentImageIndex]}
                alt={`${activeCard.title} photo ${currentImageIndex + 1}`}
                className="w-full h-full object-contain animate-in fade-in duration-500"
              />

              {activeCard.images.length > 1 && (
                <>
                  <MagneticButton
                    strength={0.6}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                  >
                    <button
                      onClick={handlePrevImage}
                      className="p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-colors"
                    >
                      <ChevronLeft size={28} />
                    </button>
                  </MagneticButton>
                  <MagneticButton
                    strength={0.6}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <button
                      onClick={handleNextImage}
                      className="p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-colors"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </MagneticButton>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {activeCard.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 text-center">
              <h3 className="font-serif text-2xl text-white tracking-wide">
                {activeCard.title}
              </h3>
              <p className="font-sans text-white/60 mt-2 max-w-2xl text-sm leading-relaxed">
                {activeCard.body}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
