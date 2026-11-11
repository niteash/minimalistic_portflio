"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
const testimonial = {
  quote:
    "Immediately accessible and much more elegant. Easy to navigate, brand-aligned, delivered exactly as requested.",
  name: "Sai Lain Leng Fha",
  role: "Pann Tha Zin · Building materials",
};
type Project = {
  name: string;
  image: string;
  imageAlt: string;
  metric: string;
  type: string;
  desc: string;
};
export default function ProjectHover({
  project,
  index,
  paused,
  children,
}: {
  project: Project;
  index: number;
  paused: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const cursor = useRef({ x: 0, y: 0 });
  const keyboard = useRef(false);
  const id = useId();
  useEffect(() => {
    const player = video.current;
    if (!player) return;
    if (
      visible &&
      !paused &&
      !matchMedia("(prefers-reduced-motion:reduce)").matches
    ) {
      player.play().catch(() => {});
    } else {
      player.pause();
    }
    return () => player.pause();
  }, [visible, paused]);
  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    let x = cursor.current.x,
      y = cursor.current.y;
    const tick = () => {
      const node = card.current;
      if (!node) return;
      const w = node.offsetWidth,
        h = node.offsetHeight;
      const tx = Math.min(
        Math.max(16, cursor.current.x + 24),
        innerWidth - w - 16,
      );
      const ty = Math.min(
        Math.max(16, cursor.current.y + 18),
        innerHeight - h - 16,
      );
      x = paused ? tx : x + (tx - x) * 0.2;
      y = paused ? ty : y + (ty - y) * 0.2;
      node.style.transform = `translate3d(${x}px,${y}px,0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const dismiss = () => setVisible(false);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("scroll", dismiss, { passive: true });
    window.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", dismiss);
      window.removeEventListener("keydown", key);
    };
  }, [visible, paused]);
  return (
    <article
      className="project-row"
      onPointerEnter={(e) => {
        if (
          e.pointerType !== "mouse" ||
          !matchMedia("(hover:hover) and (pointer:fine)").matches
        )
          return;
        keyboard.current = false;
        cursor.current = { x: e.clientX, y: e.clientY };
        setVisible(true);
      }}
      onPointerMove={(e) => {
        if (
          e.pointerType === "mouse" &&
          matchMedia("(hover:hover) and (pointer:fine)").matches
        ) {
          cursor.current = { x: e.clientX, y: e.clientY };
          setVisible(true);
        }
      }}
      onPointerLeave={() => {
        if (!keyboard.current) setVisible(false);
      }}
      onFocusCapture={(e) => {
        if (!e.target.matches(":focus-visible")) return;
        keyboard.current = true;
        const r = e.currentTarget.getBoundingClientRect();
        cursor.current = {
          x: Math.min(r.right - 330, innerWidth - 350),
          y: r.top + 20,
        };
        setVisible(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          keyboard.current = false;
          setVisible(false);
        }
      }}
    >
      {children}
      <div
        ref={card}
        id={id}
        className={"project-hover-card" + (visible ? " is-visible" : "")}
        role="tooltip"
        aria-hidden={!visible}
      >
        <div className="preview-window-bar">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>{t("PROJECT PREVIEW")}</span>
          <span>↗</span>
        </div>
        <div className="hover-image hover-video">
          <video
            ref={video}
            src={
              visible && !paused
                ? project.image
                    .replace("/projects/", "/previews/")
                    .replace(".webp", ".mp4")
                : undefined
            }
            poster={project.image}
            muted
            loop
            playsInline
            preload="none"
            aria-label={t("PROJECT PREVIEW") + " · " + project.name}
          />
          <span className="hover-number">0{index + 1}</span>
          <span className="preview-caption">{t("MOTION COVER")}</span>
        </div>
        <div className="hover-body">
          <div className="hover-kicker">
            <span>
              {t(index === 0 ? "CLIENT TESTIMONIAL" : "PROJECT SNAPSHOT")}
            </span>
            <span>↗</span>
          </div>
          <h4>{project.name}</h4>
          {index === 0 ? (
            <>
              <span className="hover-stars" aria-label={t("5 out of 5 stars")}>
                ★★★★★
              </span>
              <blockquote>“{t(testimonial.quote)}”</blockquote>
              <div className="hover-author">
                <span className="hover-avatar" aria-hidden="true">
                  {t("SL")}
                </span>
                <div>
                  <strong>{testimonial.name}</strong>
                  <small>{t(testimonial.role)}</small>
                </div>
              </div>
            </>
          ) : (
            <>
              <p>{t(project.desc.split(". ")[0] + ".")}</p>
              <span className="hover-outcome">{t(project.metric)}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
