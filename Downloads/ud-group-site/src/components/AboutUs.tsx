import { useEffect, useState } from "react";
import { LiquidTransitionImage } from "./LiquidTransitionImage";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { SplitReveal } from "./SplitReveal";

const images = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1200&auto=format&fit=crop",
];

const links = [
  {
    title: "Our Team",
    subtitle:
      "We are powered by 17 skilled technicians and a dedicated workforce of 400 employees, ensuring the highest standards in our operations.",
  },
  {
    title: "Our Future Vision",
    subtitle:
      "As we move forward, UD Group is committed to strengthening its position in the real estate and construction sector, delivering innovative projects that enhance urban living in Myanmar. We warmly welcome you to visit our company and explore collaboration opportunities.",
  },
  {
    title: "Our Approach",
    subtitle:
      "Every project is grounded in long-term thinking: durable materials, transparent timelines, and a focus on the people who will actually live and work in what we build.",
  },
  {
    title: "Specialise",
    subtitle:
      "Light Trucks & Jeeps Distribution – Supplying to over fifty trusted partners. Crane & Generator Services – Providing reliable equipment rental and maintenance. Construction & Real Estate – Developing large-scale projects, including our latest Amara Garden City housing project.",
  },
];

export function AboutUs() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="about" className="relative w-full min-h-screen flex flex-col lg:flex-row bg-[#F8F9FA] dark:bg-ink-deep transition-colors duration-500">
      {/* Left Image Carousel */}
      <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto overflow-hidden bg-neutral-200 dark:bg-ink">
        {/* Plain crossfade base layer — always correct, independent of
            WebGL. The shader-driven liquid transition on top is a bonus
            effect; if a texture fails to load, this still crossfades fine
            on its own via CSS opacity. */}
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === currentImageIndex ? 1 : 0 }}
          />
        ))}
        <CanvasErrorBoundary fallback={null}>
          <LiquidTransitionImage
            images={images}
            currentIndex={currentImageIndex}
            className="absolute inset-0 w-full h-full"
          />
        </CanvasErrorBoundary>
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30 pointer-events-none transition-colors duration-500" />
      </div>

      {/* Right Information Section */}
      <div className="w-full lg:w-1/2 flex items-center p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-400 dark:text-gold/60 mb-10 tracking-wide font-sans transition-colors duration-500">
            <SplitReveal text="About Us" by="char" />
          </h2>

          <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-gold mb-6 leading-tight font-sans transition-colors duration-500">
            UD Group Co., Ltd. was established in Year 2002, June 1. Located in
            Mandalay city and middle of Myanmar.
          </h3>

          <p className="text-neutral-800 dark:text-neutral-300 font-medium leading-relaxed mb-12 text-sm md:text-base transition-colors duration-500">
            The main products are Light Trucks, Jeeps and Generators to over
            fifty suppliers.
            <br />
            And we do Crane and Generator service, Car import , Car rental ,Jade
            mining , Mining Machine , Construction and Real estate too.
            <br />
            There are seventeen technicians working together with the assistance
            of 400 workers.
          </p>

          {/* Bordered Container */}
          <div className="flex flex-col border border-black dark:border-gold/30 rounded-sm overflow-hidden bg-transparent transition-colors duration-500">
            {links.map((link, index) => (
              <a
                key={index}
                href="#"
                className="group flex items-center justify-between p-6 md:p-8 border-b border-black dark:border-gold/30 hover:bg-black/5 dark:hover:bg-gold/10 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-lg md:text-xl font-bold text-neutral-900 dark:text-gold mb-1 transition-colors duration-500">
                    {link.subtitle}
                  </span>
                  <div className="flex items-center text-neutral-500 dark:text-gold/70 font-mono text-sm tracking-widest transition-colors duration-500">
                    <span className="w-8 h-[1px] bg-neutral-400 dark:bg-gold/50 mr-3 transition-colors duration-500" />
                    {link.title}
                  </div>
                </div>
                {/* <div className="flex items-center gap-4">
                  <span className="text-sm font-bold tracking-widest uppercase text-neutral-900 dark:text-gold hidden sm:block transition-colors duration-500">
                    Read More
                  </span>
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-gold text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowRight size={16} />
                  </div>
                </div> */}
              </a>
            ))}

            {/* Split Companies Section */}
            <div className="flex flex-col md:flex-row">
              {/* UD */}
              <a
                href="#"
                className="group w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-black dark:border-gold/30 hover:bg-black/5 dark:hover:bg-gold/10 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xl font-bold text-neutral-900 dark:text-gold mb-1 transition-colors duration-500">
                    Company Profile: UD Group
                  </h4>
                  <div className="flex items-center text-neutral-500 dark:text-gold/70 font-mono text-xs md:text-sm tracking-widest mb-6 transition-colors duration-500">
                    <span className="w-6 h-[1px] bg-neutral-400 dark:bg-gold/50 mr-2 transition-colors duration-500" />
                    Main Factory Area: 43,200 sq. ft.
                    <br />
                    Parts Factory Area: 64,000 sq. ft.
                    <br />
                    Generator Factory: 43,200 sq. ft.
                  </div>
                  <div className="w-full aspect-[4/3] overflow-hidden rounded-sm mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop"
                      alt="CKI Business"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                {/* <div className="flex items-center justify-end gap-3 mt-4">
                  <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900 dark:text-gold transition-colors duration-500">
                    Read More
                  </span>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black dark:bg-gold text-white flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <ArrowRight size={14} />
                  </div>
                </div> */}
              </a>

              {/* fTk */}
              <a
                href="#"
                className="group w-full md:w-1/2 p-6 md:p-8 hover:bg-black/5 dark:hover:bg-gold/10 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xl font-bold text-neutral-900 dark:text-gold mb-1 transition-colors duration-500">
                    Amara Garden City – A Vision for Modern Living
                  </h4>
                  <div className="flex items-center text-neutral-500 dark:text-gold/70 font-mono text-md md:text-sm tracking-widest mb-6 transition-colors duration-500">
                    <span className="w-6 h-[1px] bg-neutral-400 dark:bg-gold/50 mr-2 transition-colors duration-500" />
                    Located on a 60-acre site, Amara Garden City is our flagship
                    real estate development, designed to offer a high-quality
                    residential experience in Mandalay. Our project aims to
                    create a thriving community with modern infrastructure,
                    green spaces, and premium facilities.
                  </div>

                  <div className="w-full aspect-[4/3] overflow-hidden rounded-sm mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop"
                      alt="fTk Manufacturing"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                {/* <div className="flex items-center justify-end gap-3 mt-4">
                  <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900 dark:text-gold transition-colors duration-500">
                    Read More
                  </span>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black dark:bg-gold text-white flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <ArrowRight size={14} />
                  </div>
                </div> */}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
