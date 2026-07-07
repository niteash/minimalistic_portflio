import { createElement, useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface SplitRevealProps {
  text: string;
  className?: string;
  /** "word" reads more naturally for body-ish headings, "char" feels more graphic for short display type. */
  by?: "word" | "char";
  delay?: number;
  as?: ElementType;
}

/**
 * GSAP's SplitText is a paid Club plugin — this does the same word/char
 * stagger reveal by hand: wrap each unit in a span, animate them in with a
 * scroll trigger. No new dependency, same visual effect.
 */
export function SplitReveal({
  text,
  className,
  by = "word",
  delay = 0,
  as = "span",
}: SplitRevealProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reducedMotion) {
      gsap.set(root.children, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(root.children, {
        opacity: 0,
        y: "0.6em",
        rotateX: by === "char" ? -40 : 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: by === "char" ? 0.018 : 0.06,
        delay,
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
        },
      });
    });

    return () => ctx.revert();
  }, [text, by, delay, reducedMotion]);

  const units = by === "char" ? Array.from(text) : text.split(" ");

  return createElement(
    as,
    {
      ref: rootRef,
      className,
      style: { display: "inline-block", perspective: "600px" },
    },
    units.map((unit, i) =>
      createElement(
        "span",
        {
          key: i,
          style: { display: "inline-block", whiteSpace: by === "word" ? "pre" : "normal" },
        },
        unit + (by === "word" && i < units.length - 1 ? "\u00A0" : "")
      )
    )
  );
}
