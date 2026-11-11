# Shwe Win Aung — Latest Portfolio Source

Includes English, Burmese, Japanese, Thai, and German; monochrome glass styling; the SWA opening animation; cursor-following liquid; animated project previews; expertise hover switching; images and resume.

## Run locally

Install Node.js 22.13 or newer. Extract this ZIP, open the shwe-win-aung-portfolio folder in VS Code, then run:

```bash
npx pnpm@11.25.0 install
npx pnpm@11.25.0 dev
```

Open http://localhost:5173 or the address shown in the terminal. Stop with Ctrl+C.

## Edit the portfolio

- app/page.tsx: homepage and sections
- app/portfolio-data.ts: project and career data
- app/globals.css: colors, glass effects, layout and CSS motion
- lib/i18n/translations.ts: professional translations and first-person English copy
- components/LanguageProvider.tsx: locale state and persistence
- components/LanguageDropdown.tsx: accessible language selector
- components/Opening.tsx: SWA opening sequence
- components/HeroLiquid.tsx: interactive liquid shader and fallback
- components/Motion.tsx: GSAP and Lenis motion
- components/ProjectHover.tsx: video preview and testimonial
- components/TechStack.tsx: technology icons
- public/projects/: project cover artwork
- public/previews/: animated cover MP4 clips
- public/Shwe-Win-Aung-Resume.pdf: resume

## Build and type check

```bash
npx pnpm@11.25.0 build
npx pnpm@11.25.0 exec tsc --noEmit
```

The project uses React, TypeScript and Vinext/Vite with a Cloudflare Worker build. Original hosting configuration is included. No API keys are required for portfolio features. Google Fonts and external links require internet access. The downloaded copy does not change the hosted site. Dependencies and Git history are excluded. Preview videos are animations of generated project cover artwork.
