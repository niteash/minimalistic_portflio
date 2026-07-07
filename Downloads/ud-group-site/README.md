# UD Group / Amara Garden City — site

This is your original codebase with the review items implemented: real bug
fixes, centralized design tokens, resilience for the WebGL sections, and
the creative additions we discussed (3D site plan, magnetic buttons, tilt
cards, word-stagger text reveal, side dot-nav, synced preloader, and
streaming chat).

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
```

The chat backend (`api/chat.ts`) is a Vercel Edge Function. Locally it
won't respond unless you run it through the Vercel CLI (`vercel dev`) or
point `Chatbot.tsx`'s fetch at wherever you deploy it. See "Chatbot
streaming" below for the one thing you need to set before it works at all.

## Bugs fixed

**Lenis never actually paused during modals.** `BusinessCards.tsx` checked
`window.appLenis`, `Strengths.tsx` checked `window.lenis` — two different
globals, neither ever set anywhere. `App.tsx` now does
`window.appLenis = lenis` right after creating the instance (and clears it
on unmount), and `Strengths.tsx` was switched to the same name. Smooth
scroll now actually stops while the photo lightbox or team detail view is
open.

**`ScrollVideoReveal` now reveals an actual video.** It had a `videoSrc`
field that was never used — the "reveal" was a static `<img>` the whole
time. It's now a real `<video>` with `currentTime` scrubbed directly by
scroll progress (same pin/scrub pattern as the Hero), with the old image
kept as the `poster` for the instant before the video buffers.

**Dark mode persists and respects system preference.** Added
`useTheme.ts` (reads/writes `localStorage`) and a tiny inline script in
`index.html` that sets the `dark` class *before paint* — there's no longer
a flash of light mode while React boots, and a saved preference now
actually survives a reload. `Navbar.tsx` uses the hook instead of a
one-time `classList.contains` check that was never true on a fresh load.

**Cursor hiding is gated to devices that actually have a cursor.**
`Cursor.tsx` checks `matchMedia('(hover: none)')` and bails out early on
touch devices instead of unconditionally setting `cursor: none` on `body`.

**Centralized color tokens.** `#B89851`, `#1a1a1a`, `#0a0a0a`, `#121212`,
`#fafafa`, and a couple of near-duplicate gold shades (`#b08910`,
`#e6c875`, `#a38647`) were hardcoded across ~10 files. They're now
`--color-gold` / `--color-gold-light` / `--color-gold-dark` / `--color-ink`
/ `--color-ink-deep` / `--color-paper` in `src/index.css`'s `@theme`
block — `bg-[#1a1a1a]` became `bg-ink`, etc., site-wide. One place to
rebrand from now on. (`#121212` and `#1a1a1a` were two accidentally
different near-blacks doing the same job — consolidated into one.)

**A content bug, not a code bug:** the "Data" card in `AboutUs.tsx` had
body text that read like a leftover AI chat reply ("...Let me know if
you'd like any adjustments!") instead of real copy, and a sibling card was
titled "Speicalise". Both fixed — real placeholder copy in, typo gone.

## Resilience added (the actual reason for some of this)

While testing, I found that a failed WebGL texture load (dead link, slow
network, ad-blocker — anything) **throws inside `<Canvas>` and crashes that
whole React subtree**, because none of the three.js sections had an error
boundary. This is a real production risk independent of anything specific
to your assets, so:

- Added `CanvasErrorBoundary.tsx` — a class component (React error
  boundaries can't be hooks) that catches a child crash and renders a
  fallback instead of taking down the page.
- **`BusinessCards`**: each card now renders a real `<img>` first (CSS
  grayscale → color on hover), with the liquid-shader canvas as a bonus
  layer on top wrapped in the boundary. If the canvas fails entirely, the
  card still looks correct — it just loses the distortion effect.
- **`AboutUs`**: same idea — a plain CSS crossfade between the three
  images underneath, with the WebGL liquid-transition effect layered over
  it inside the boundary.
- **`Strengths`**: the spherical 3D gallery is wrapped in the boundary
  with a static 4-column image grid as the fallback (built from the same
  `galleryItems` data the 3D version uses), so a WebGL failure degrades to
  "still a perfectly normal gallery" instead of a blank section.

One honest caveat: my sandbox's network is restricted to an allowlist that
doesn't include Cloudinary, Unsplash, or the three.js HDRI CDN, so I
*could not* verify live image/texture loading end-to-end against your real
assets here — only that the code is correct and that the fallbacks work
when a load fails. Do a real smoke test in your own dev environment before
shipping; I'd be surprised if anything's wrong (the WebGL code itself
didn't change), but I want to be upfront about what I could and couldn't
verify from here.

## WebGL context consolidation

`BusinessCardItem` used to mount its own `<Canvas>` per card — four cards,
four GL contexts, plus one each for the `AboutUs` carousel, the
`Strengths` gallery, and the page background. `LiquidImageCanvas.tsx`
replaces the per-card canvases with **one shared canvas**: it reads each
card's `getBoundingClientRect()` every frame (via a `data-liquid-id`
attribute) and positions one plane per card in an orthographic camera
matched 1:1 to pixels. Cards just need `data-liquid-id` and a
`data-hovered` attribute toggled on enter/leave — no refs, no context
provider.

## Creative additions

- **`SitePlan3D.tsx`** — replaces the OpenStreetMap iframe in
  `CommitmentSection` with a custom-built, on-brand 3D parcel grid
  (hoverable lots, status color-coding, a stand-in for Taung Tha Man lake
  for orientation). The OSM embed gave you default zoom/attribution chrome
  you can't restyle, for a spot that was purely decorative anyway. The lot
  layout is illustrative — swap `buildParcels()` for real surveyed lot
  data + coordinates whenever that exists.
- **`MagneticButton.tsx`** — CTAs lean toward the cursor as it approaches.
  Used on the footer submit button and the lightbox close button.
- **`TiltCard.tsx`** — subtle cursor-following 3D tilt, layered on the
  business cards on top of the liquid-shader hover.
- **`SplitReveal.tsx`** — word/character stagger-reveal for headings (a
  hand-rolled stand-in for GSAP's paid SplitText plugin — same visual
  result, no new dependency). Used on the About section heading.
- **`SectionNav.tsx`** — fixed side dot-nav tracking scroll position via
  `IntersectionObserver`, click to jump. Now that the page has 8 sections,
  it's a small but real orientation aid.
- **Synced preloader** — `useAssetPreload.ts` tracks real load progress
  for the hero video + first-screen images (videos resolve on
  `canplaythrough`, same gate the Hero itself uses) instead of the old
  `Math.random()` increment. The percentage now means something, and the
  loader can't finish before the hero is actually ready to play.
- **Chatbot streaming** — `Chatbot.tsx` now reads the response body as a
  stream and appends text as it arrives instead of waiting for the full
  reply. `api/chat.ts` is a Vercel Edge Function that calls Anthropic's
  Messages API with `stream: true` and translates the SSE event stream
  into plain text chunks, so the frontend doesn't need to know anything
  about Anthropic's wire format.

  **You need to set `ANTHROPIC_API_KEY`** in your deployment's environment
  variables for this to respond at all (Vercel: Project → Settings →
  Environment Variables). The system prompt in `api/chat.ts` has the
  concierge's persona and current project facts — update it as the
  project details change.
- **`grain-overlay`** (in `index.css`, applied in `App.tsx`) — a subtle
  fixed film-grain layer over the whole page, tying the photography
  together with the texture already present in `WebglBackground`.

## Known limits / what I'd still do with more runway

- The JS bundle is ~1.5MB (three.js + gsap + motion + drei). Worth
  code-splitting `Strengths`, `SitePlan3D`, and the liquid-shader
  components with `React.lazy` + `IntersectionObserver`-gated mounting,
  since none of them need to exist in the bundle until their section is
  near viewport.
- `prefers-reduced-motion` is respected by `SplitReveal` and `SitePlan3D`'s
  auto-rotate, but not yet by the Hero's pin/scrub, the marquee, or the 3D
  gallery's idle motion — worth a pass if that matters for your
  accessibility bar.
- The 3D site plan's lot data is invented for the demo — wire up real
  parcel coordinates/status whenever survey data exists.
