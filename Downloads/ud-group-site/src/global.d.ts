import type Lenis from "lenis";

declare global {
  interface Window {
    /**
     * The single Lenis instance, exposed by App.tsx so any component can
     * pause/resume smooth-scroll while a modal/lightbox is open. Previously
     * BusinessCards checked `window.appLenis` and Strengths checked
     * `window.lenis` — two different names, neither ever actually set,
     * so smooth-scroll never paused for any modal. Now there's one name
     * and one place that sets it.
     */
    appLenis?: Lenis;
  }
}

export {};
