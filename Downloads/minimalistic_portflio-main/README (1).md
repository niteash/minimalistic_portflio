# Shwe Win Aung — Developer Portfolio

A multilingual portfolio showcasing my work in fullstack development, multilingual commerce, AI-powered applications, and open-source collaboration.

The website pairs a black-and-white visual system with frosted-glass surfaces, a cursor-responsive liquid hero, and scroll-driven motion. Project case studies highlight my responsibilities, technical decisions, and reported results.

[View the hosted portfolio](https://shwe-win-aung-studio.smokysong4.chatgpt.site) · [GitHub](https://github.com/niteash) · [LinkedIn](https://linkedin.com/in/shwe-win-aung)

> The hosted portfolio may require ChatGPT sign-in, depending on its sharing settings.

## Features

- **Five languages:** English, Burmese, Japanese, Thai, and German, with a saved language preference and script-appropriate fonts.
- **SWA opening sequence:** animated lettering followed by a reveal of the homepage, with a skip option.
- **Interactive liquid hero:** custom GLSL shading that responds to mouse movement, with a CSS fallback when WebGL is unavailable.
- **Scroll animation:** GSAP reveals, image parallax, a desktop statement sequence, and Lenis smooth scrolling.
- **Project previews:** cursor-following video windows with project details and a supplied client testimonial for Pan Tha Zin.
- **Case-study dialogs:** project descriptions, technology badges, outcomes, and source or website links where available.
- **Expertise tabs:** the image and description change on hover, click, or keyboard navigation.
- **Portfolio content:** skills, GSoC contributions, career journey, education, reviews, FAQs, contact links, and a downloadable resume.
- **Portfolio Q&A:** predefined answers about projects, technology, GSoC, and availability.
- **Accessibility support:** keyboard controls, focus management in case-study dialogs, reduced-motion handling, and a motion toggle.

## Technology

| Area | Implementation |
| --- | --- |
| Interface | React 19 and TypeScript |
| Framework and bundling | Vinext and Vite |
| Animation | GSAP, ScrollTrigger, and Lenis |
| Hero rendering | WebGL, custom GLSL, and a CSS fallback |
| Styling | CSS, responsive layouts, and backdrop filters |
| Icons | React Icons and Lucide React |
| Localization | React context and a local translation dictionary |
| Production runtime | Cloudflare Workers |

The repository also retains starter utilities and an earlier Three.js scene component. The current liquid hero is implemented in `components/HeroLiquid.tsx` using native WebGL.

## Getting started

### Requirements

- **Node.js 22.13.0 or newer**
- Internet access for dependency installation
- A modern browser

Extract the project ZIP and open the `shwe-win-aung-portfolio` folder in your editor. Run the following commands from the folder containing `package.json`:

```bash
npx pnpm@11.25.0 install
npx pnpm@11.25.0 dev
```

Open **http://localhost:5173**, or use the address printed in the terminal. Stop the development server with **Ctrl+C**.

If pnpm 11.25.0 is already installed, you can use `pnpm install` and `pnpm dev` directly.

No API keys are required for the current portfolio features. Google Fonts and external links require an internet connection.

## Commands

| Command | Purpose |
| --- | --- |
| `npx pnpm@11.25.0 dev` | Start the development server |
| `npx pnpm@11.25.0 build` | Generate the production build |
| `npx pnpm@11.25.0 start` | Preview the built Worker locally through Wrangler |
| `npx pnpm@11.25.0 exec tsc --noEmit` | Check TypeScript types |
| `npx pnpm@11.25.0 lint` | Run ESLint |

Run `build` before `start`, then open the URL reported by Wrangler. The `start` command runs a local preview; it does not publish the website.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Homepage sections, interactions, FAQs, and Q&A responses |
| `app/layout.tsx` | Root layout, metadata, and language provider |
| `app/portfolio-data.ts` | Project records and career timeline |
| `app/globals.css` | Layout, colors, glass surfaces, responsive rules, and CSS animation |
| `components/Opening.tsx` | SWA intro and skip behavior |
| `components/HeroLiquid.tsx` | Cursor-following liquid shader and fallback |
| `components/Motion.tsx` | GSAP and Lenis integration |
| `components/ProjectHover.tsx` | Floating project video preview and testimonial |
| `components/TechStack.tsx` | Technology icons and skill groups |
| `components/LanguageProvider.tsx` | Language state, persistence, and document language |
| `components/LanguageDropdown.tsx` | Language selector and keyboard controls |
| `lib/i18n/translations.ts` | Translation dictionary and first-person English wording |
| `public/projects/` | Generated project cover artwork |
| `public/previews/` | Animated cover clips used in project previews |
| `public/Shwe-Win-Aung-Resume.pdf` | Downloadable resume |
| `worker/index.ts` | Production Worker entry point |
| `vite.config.ts` | Framework and Cloudflare configuration |
| `.openai/hosting.json` | Original Sites hosting configuration |
| `scripts/` | Development, build, and runtime helpers |

## Customization

### Personal information and projects

Edit `app/page.tsx` for the introduction, expertise, education, testimonials, FAQ, and contact information. Update `app/portfolio-data.ts` for project descriptions, outcomes, links, images, and career entries.

Update `app/layout.tsx` for the page metadata and `components/LanguageProvider.tsx` for the language-specific page title.

### Colors and glass styling

Edit `app/globals.css`. The main palette uses `--paper`, `--ink`, `--muted`, `--line`, `--dark`, and `--cream`.

The stylesheet includes successive design refinements. Update the final matching rule when changing an existing style, or consolidate the earlier rules before a larger redesign.

### Images, videos, and resume

Replace the files in `public/projects/` and `public/previews/`, keeping their filenames or updating their references.

Project preview videos are currently derived from the cover image path: `/projects/example.webp` maps to `/previews/example.mp4`. Use matching filenames when replacing a pair.

Replace `public/Shwe-Win-Aung-Resume.pdf` to update the downloadable CV.

### Languages

The supported locale codes are:

| Language | Code |
| --- | --- |
| English | `en` |
| Burmese | `my` |
| Japanese | `ja` |
| Thai | `th` |
| German | `de` |

Translation rows in `lib/i18n/translations.ts` use this order:

```ts
[
  'English source text',
  'Burmese translation',
  'Japanese translation',
  'Thai translation',
  'German translation',
]
```

When changing source text, update the corresponding dictionary key and translations. The translator falls back to the source text when a matching translation is unavailable. Names and technology brands generally remain unchanged.

The language preference is stored in local storage under `swa-language`. The interface language changes the website copy; the downloadable resume remains the supplied PDF.

## Motion and media behavior

The liquid animation begins after the intro and pauses while off-screen, when the browser tab is hidden, or when motion is disabled. Visitors who prefer reduced motion receive a simplified experience.

Project preview clips play muted while the preview is active. Touch visitors can open project case studies without relying on hover.

The project covers are generated editorial artwork. The preview clips animate those covers; they are not recordings of the live applications. The Q&A uses predefined responses and does not call an external language model.

## Deployment

The production build targets **Cloudflare Workers** through Vinext and the Cloudflare Vite integration. The original hosting configuration is included in the source archive.

Build with:

```bash
npx pnpm@11.25.0 build
```

The build generates output under `dist/`, including the Worker configuration used by the local `start` command. Configure the destination hosting account before deploying a separate copy. Retain the existing Site identity when updating the original hosted project.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| Installation fails on an older Node version | Run `node --version` and use Node.js 22.13.0 or newer |
| Commands cannot find `package.json` | Open a terminal inside the extracted project folder |
| The page does not open | Keep the development server running and use its printed URL |
| Liquid appears static | Check reduced-motion preferences and the site's motion toggle; WebGL may also be unavailable |
| A preview clip does not load | Check the matching `.webp` and `.mp4` filenames and whether motion is enabled |
| A language selection persists after refresh | Select another language in the dropdown or remove the `swa-language` local-storage entry |
| The hosted URL requests sign-in | Check the hosted project's sharing settings |

## Contact

**Shwe Win Aung** — Fullstack Developer

- Email: [nickytwist70@gmail.com](mailto:nickytwist70@gmail.com)
- GitHub: [niteash](https://github.com/niteash)
- LinkedIn: [shwe-win-aung](https://linkedin.com/in/shwe-win-aung)
