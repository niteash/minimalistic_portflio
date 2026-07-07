import { useEffect, useRef, useState } from "react";

export interface NavSection {
  id: string;
  label: string;
}

/**
 * Fixed side dot-nav. With 8+ sections on the page now, a small persistent
 * "where am I" affordance pays for itself — highlights the current section
 * via IntersectionObserver and scrolls to a section on click.
 */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { threshold: [0.3, 0.5, 0.7], rootMargin: "-10% 0px -10% 0px" }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Works whether or not Lenis is intercepting scroll — Lenis patches
    // native scrollIntoView behavior when present.
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3"
    >
      {sections.map((s) => {
        const isActive = s.id === activeId;
        return (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className="group flex items-center gap-3"
            aria-current={isActive}
            aria-label={`Go to ${s.label}`}
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ${
                isActive ? "text-neutral-900 dark:text-gold" : "text-neutral-500 dark:text-gold/60"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? "w-2.5 h-2.5 bg-neutral-900 dark:bg-gold"
                  : "w-1.5 h-1.5 bg-neutral-400 dark:bg-gold/40 group-hover:bg-neutral-600 dark:group-hover:bg-gold/70"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
