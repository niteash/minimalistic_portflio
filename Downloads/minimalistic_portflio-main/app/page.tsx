"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../components/LanguageProvider";
import Motion from "../components/Motion";
import LanguageDropdown from "../components/LanguageDropdown";
import Opening from "../components/Opening";
import HeroLiquid from "../components/HeroLiquid";
import ProjectHover from "../components/ProjectHover";
import TechStack, { TechList } from "../components/TechStack";
import { projects, journey } from "../components/portfolio-data";
const services = [
  {
    name: "Fullstack development",
    label: "01 / WEB APPLICATIONS",
    image: "/projects/fullstack.png",
    description:
      "Thoughtful interfaces, reliable APIs, and the systems that connect them. From a first prototype to a product people use every day.",
    stack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  },
  {
    name: "Multilingual experiences",
    label: "02 / BEYOND BORDERS",
    image: "/projects/multilangual.png",
    description:
      "Products that feel at home in more than one language. I bring Burmese, English, and Chinese perspectives to accessible, responsive experiences.",
    stack: ["React", "i18n", "Tailwind"],
  },
  {
    name: "AI & automation",
    label: "03 / USEFUL INTELLIGENCE",
    image: "/projects/ai.png",
    description:
      "Making complex information easier to work with. Document intelligence, OCR workflows, personalized recommendations, and practical automation.",
    stack: ["Python", "FastAPI", "OCR", "AI"],
  },
  {
    name: "Open source",
    label: "04 / SHARED PROGRESS",
    image: "/projects/open.png",
    description:
      "Building in the open, with care for the next contributor. Django models, API validation, reusable React components, and clear collaboration.",
    stack: ["Python", "React", "TypeScript", "GitHub Actions"],
  },
];
const faqs = [
  [
    "Are you available for work?",
    "Yes. I’m open to fulltime developer roles, freelance projects, and interesting collaborations worldwide. I’m based in Punjab, India, and available remotely.",
  ],
  [
    "What technologies do you use?",
    "My core stack is React, TypeScript, Node.js, and Python. I also work with Next.js, Tailwind CSS, FastAPI, databases, and AWS. You can explore the full stack below.",
  ],
  [
    "Can you work on an existing project?",
    "Yes. I can help with React interfaces, API integration, multilingual features, performance, or an existing fullstack application. Email me a little context so we can discuss the right scope.",
  ],
  [
    "What is your GSoC experience?",
    "In GSoC 2026, I contributed to Data Umbrella’s Event Board through Open Science Labs. My three merged PRs covered the Django event format field, API validation, and a React format badge and filter.",
  ],
  [
    "How do we start a project?",
    "Send a short email with what you’re building, your goals, and any timing requirements. We can discuss the scope, collaboration, and next steps from there.",
  ],
];
export default function Home() {
  const { t, locale } = useLanguage();
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);
  const [paused, setPaused] = useState(true),
    [time, setTime] = useState(""),
    [filter, setFilter] = useState("All"),
    [selected, setSelected] = useState<number | null>(null),
    [service, setService] = useState(0),
    [chat, setChat] = useState(false),
    [answer, setAnswer] = useState(
      "Ask about my projects, stack, open source, or availability.",
    ),
    [question, setQuestion] = useState(""),
    [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    setPaused(preference.matches);
    const updatePreference = (e: MediaQueryListEvent) => setPaused(e.matches);
    preference.addEventListener("change", updatePreference);
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" }),
      );
    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      clearInterval(timer);
      preference.removeEventListener("change", updatePreference);
    };
  }, []);
  useEffect(() => {
    if (selected === null) return;
    const previous = document.activeElement as HTMLElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "Tab") {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(".modal button,.modal a"),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [selected]);
  function ask(q: string) {
    setAnswer(
      /gsoc|source|オープンソース|โอเพนซอร์ส/i.test(q)
        ? faqs[3][1]
        : /hire|available|contact|အလုပ်|依頼|仕事|ร่วมงาน|รับงาน|verfügbar|kontakt/i.test(
              q,
            )
          ? faqs[0][1]
          : /stack|skill|technolog|နည်းပညာ|技術|เทคโนโลยี/i.test(q)
            ? faqs[1][1]
            : /ai|project|ပရောဂျက်|実績|ผลงาน|โครงการ|projekt/i.test(q)
              ? "My work includes multilingual commerce for Pan Tha Zin, KMRL document intelligence with OCR and NLP, an AI trip planner, and an AI food platform that placed second among 150+ teams at ByteBash. Explore Recent Work for the details."
              : "I can help with questions about projects, technology, GSoC, or availability. For anything else, email swa.developer.expert@gmail.com.",
    );
    setQuestion("");
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText("swa.developer.expert@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }
  return (
    <>
      {!introDone && <Opening onComplete={finishIntro} />}
      <Motion paused={paused || !introDone} layoutKey={filter + locale} />
      <a className="skip-link" href="#work">
        {t("Skip to projects")}
      </a>
      <div className="scroll-progress" />
      <header className="site-nav">
        <a className="brand" href="#top">
          {t("shwe win aung")}
        </a>
        <nav aria-label={t("Main navigation")}>
          <a href="#work">{t("Projects")}</a>
          <a href="#services">{t("Expertise")}</a>
          <a href="#about">{t("About")}</a>
        </nav>
        <div className="nav-actions">
          <LanguageDropdown />
          <a className="nav-contact" href="#contact">
            {t("Get in touch")}
            <span>↗</span>
          </a>
        </div>
      </header>
      <main id="top" className={paused ? "motion-paused" : ""}>
        <section className="intro-section">
          <HeroLiquid paused={paused || !introDone} />
          <div className="intro-copy">
            <h1>
              <span className="reveal-line">{t("Code that connects.")}</span>
              <span className="reveal-line">
                {t("For people, across borders.")}
              </span>
            </h1>
            <p>
              {t("I build fast, thoughtful digital products.")}
              <br />
              {t("From multilingual commerce to document AI,")}
              <br />
              {t("with care for the people using them.")}
            </p>
            <a className="inline-link" href="#work">
              {t("Explore my work")}
              <span>↘</span>
            </a>
          </div>
          <div className="intro-meta">
            <span>{t("FULLSTACK DEVELOPER FROM MYANMAR")}</span>
            <span className="available">
              <i />
              {t("AVAILABLE WORLDWIDE")}
            </span>
          </div>
          <div className="name-mask">
            <div className="giant-name" aria-hidden="true">
              {t("shwe win aung")}
            </div>
          </div>
        </section>
        <section
          className="manifesto dark-section"
          aria-label={t("My approach")}
        >
          <div className="manifesto-stage">
            <span className="micro manifesto-index">
              {t("A FEW THINGS I BUILD FOR")}
            </span>
            <div className="statement-stack">
              <h2 className="statement">
                {t("Different languages.")}
                <br />
                {t("The same sense of belonging.")}
              </h2>
              <h2 className="statement">
                {t("Complex information.")}
                <br />
                {t("A simpler way through.")}
              </h2>
              <h2 className="statement">
                {t("Good ideas deserve")}
                <br />
                {t("to become useful things.")}
              </h2>
            </div>
            <span className="micro manifesto-foot">
              {t("THOUGHTFUL CODE. REAL PEOPLE.")}
            </span>
          </div>
        </section>
        <section id="work" className="work-section paper-section">
          <div className="section-bar">
            <h2>{t("Recent work")}</h2>
            <div className="filters" aria-label={t("Project filters")}>
              {["All", "Web", "AI"].map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {t(f)}
                  {f === "All" ? " (06)" : ""}
                </button>
              ))}
            </div>
          </div>
          <div className="project-list">
            {projects.map(
              (p, i) =>
                (filter === "All" ||
                  (filter === "AI" ? [1, 2, 3] : [0, 4, 5]).includes(i)) && (
                  <ProjectHover
                    key={p.name}
                    project={p}
                    index={i}
                    paused={paused}
                  >
                    <button
                      className="project-image"
                      onClick={() => setSelected(i)}
                      aria-label={t("Case study ↗") + " " + p.name}
                    >
                      <img
                        className="project-photo"
                        src={p.image}
                        alt={t(p.imageAlt)}
                        loading="lazy"
                        decoding="async"
                        width="1200"
                        height="800"
                      />
                      <span className="view-project">
                        {t("View project ↗")}
                      </span>
                    </button>
                    <div className="project-info">
                      <span className="micro">0{i + 1}</span>
                      <h3>
                        <button onClick={() => setSelected(i)}>{p.name}</button>
                      </h3>
                      <p>{t(p.desc.split(". ")[0] + ".")}</p>
                      <span className="project-result">{t(p.metric)}</span>
                      <TechList compact items={p.tech.split(" · ")} />
                      <div className="project-links">
                        <button onClick={() => setSelected(i)}>
                          {t("Case study ↗")}
                        </button>
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer">
                            {t("Visit site ↗")}
                          </a>
                        )}
                      </div>
                    </div>
                  </ProjectHover>
                ),
            )}
          </div>
          <p className="cover-note micro">
            {t("PROJECT COVERS ARE GENERATED EDITORIAL ARTWORK.")}
          </p>
        </section>

        <section id="services" className="expertise-section dark-section">
          <div className="section-bar">
            <h2>{t("What I can help with")}</h2>
            <span className="micro">
              {t("FROM INTERFACE TO INFRASTRUCTURE")}
            </span>
          </div>

          <div className="expertise-grid">
            {/* LEFT: IMAGE PREVIEW */}
            <div
              className="service-visual"
              key={service}
              id="service-panel"
              role="tabpanel"
              aria-labelledby={`service-tab-${service}`}
              tabIndex={0}
            >
              <div className="service-image-wrapper">
                <img
                  src={services[service].image}
                  alt={t(services[service].name)}
                  width="1200"
                  height="800"
                  loading="lazy"
                />
              </div>

              <span className="micro service-image-label">
                {t(services[service].label)}
              </span>
            </div>

            {/* RIGHT: SERVICES + DETAILS */}
            <div className="service-content">
              <div
                className="service-list"
                role="tablist"
                aria-label={t("Areas of expertise")}
              >
                {services.map((s, i) => (
                  <button
                    key={s.name}
                    id={`service-tab-${i}`}
                    role="tab"
                    aria-selected={service === i}
                    tabIndex={service === i ? 0 : -1}
                    aria-controls="service-panel"
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setService(i);
                    }}
                    onFocus={() => setService(i)}
                    onClick={() => setService(i)}
                    onKeyDown={(e) => {
                      const next =
                        e.key === "ArrowDown" || e.key === "ArrowRight"
                          ? (i + 1) % services.length
                          : e.key === "ArrowUp" || e.key === "ArrowLeft"
                            ? (i + services.length - 1) % services.length
                            : e.key === "Home"
                              ? 0
                              : e.key === "End"
                                ? services.length - 1
                                : null;

                      if (next !== null) {
                        e.preventDefault();
                        setService(next);
                        document.getElementById(`service-tab-${next}`)?.focus();
                      }
                    }}
                  >
                    <span className="service-name">{t(s.name)}</span>

                    <span className="service-arrow">
                      {service === i ? "•" : "↗"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="service-detail" key={`service-detail-${service}`}>
                <p>{t(services[service].description)}</p>

                <TechList items={services[service].stack} />
              </div>
            </div>
          </div>

          {/* BOTTOM NOTE */}
          <div className="expertise-note">
            <p>
              {t("One builder. A connected perspective.")}
              <br />
              {t("From the first interface to the final API.")}
            </p>

            <p>
              {t(
                "I bring design sensitivity, practical engineering, and a cross-cultural point of view to every project I ship.",
              )}
            </p>
          </div>
        </section>

        <section id="about" className="about-section paper-section">
          <div className="section-bar">
            <h2>{t("A little about me")}</h2>
            <span className="micro">{t("MANDALAY → PUNJAB")}</span>
          </div>
          <div className="editorial-grid">
            <div className="side-note micro">
              {t("MYANMAR ROOTS.")}
              <br />
              {t("A GLOBAL PERSPECTIVE.")}
              <br />
              <br />
              {t("BURMESE / ENGLISH / CHINESE")}
            </div>
            <div className="about-main">
              <h2 className="large-copy">
                {t("I’m Shwe Win Aung, a developer")}
                <br />
                {t("who cares about")}
                <br />
                <span>{t("delivering the best product in the market.")}</span>
              </h2>
              <div className="about-body">
                <p>
                  {t(
                    "I build multilingual websites, AI-powered platforms, and government document intelligence across freelance, team, and hackathon environments. The best part is seeing people use what we’ve made.",
                  )}
                </p>
                <p>
                  {t(
                    "Originally from Myanmar, now based in Punjab, India. I bring Burmese, English, and conversational Chinese to my work, alongside a BSc in Information Technology from Lovely Professional University, 2026.",
                  )}
                </p>
              </div>
              <div className="stats">
                <div>
                  <b>06</b>
                  <span>{t("FEATURED PROJECTS")}</span>
                </div>
                <div>
                  <b>03</b>
                  <span>{t("MERGED GSOC PRS")}</span>
                </div>
                <div>
                  <b>
                    {locale === "th" ? "อันดับ 2" : "02"}
                    {locale !== "th" && <sup>{t("nd")}</sup>}
                  </b>
                  <span>{t("OF 150+ BYTEBASH TEAMS")}</span>
                </div>
              </div>
              <TechStack />
            </div>
          </div>
        </section>
        <section id="opensource" className="open-section paper-section">
          <div className="section-bar">
            <h2>{t("Building in the open")}</h2>
            <span className="micro">{t("GOOGLE SUMMER OF CODE 2026")}</span>
          </div>
          <div className="editorial-grid">
            <div className="side-note micro">
              {t("OPEN SCIENCE LABS")}
              <br />
              {t("DATA UMBRELLA")}
            </div>
            <div>
              <h2 className="large-copy">
                {t("Small contributions.")}
                <br />
                {t("Shared progress.")}
              </h2>
              <p className="open-intro">
                {t(
                  "I built event format classification end to end for Data Umbrella’s Event Board, helping the data science community distinguish in-person, virtual, and hybrid events.",
                )}
              </p>
              <div className="pr-list">
                {[
                  [
                    "115",
                    "Event format field",
                    "Django model and database migration.",
                    "Python / Django ORM",
                  ],
                  [
                    "116",
                    "Serializer & validation",
                    "DRF exposure and server-side event format validation.",
                    "Django REST / Validation",
                  ],
                  [
                    "118",
                    "React format filter",
                    "A reusable FormatBadge and event format filtering.",
                    "React / TypeScript",
                  ],
                ].map(([n, title, d, s]) => (
                  <div className="pr" key={n}>
                    <span className="micro">
                      {t("PR #")}
                      {n}
                    </span>
                    <div>
                      <h3>{t(title)}</h3>
                      <p>{t(d)}</p>
                      <small>{s}</small>
                    </div>
                    <span className="merged">{t("↳ Merged")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="journey" className="journey-section dark-section">
          <div className="section-bar">
            <h2>{t("The journey so far")}</h2>
            <span className="micro">2023 — 2026</span>
          </div>
          <div className="editorial-grid">
            <div className="side-note micro">
              {t("BUILT, LEARNED,")}
              <br />
              {t("AND SHIPPED.")}
            </div>
            <div>
              {journey.map(([date, name, role, desc]) => (
                <div className="timeline-row" key={name}>
                  <time>{date}</time>
                  <div>
                    <h3>{t(name)}</h3>
                    <span>{t(role)}</span>
                    <p>{t(desc)}</p>
                  </div>
                </div>
              ))}
              <div className="education">
                <div>
                  <span className="micro">{t("EDUCATION")}</span>
                  <h3>{t("University of Delhi")}</h3>
                  <p>
                    {t("Master of Computer Applications")}
                    <br />
                    {t("2026 — 2028 · Delhi")}
                  </p>
                  <h3>{t("Lovely Professional University")}</h3>
                  <p>
                    {t("BSc Information Technology")}
                    <br />
                    {t("2023 — 2026 · Punjab")}
                  </p>
                  <h3>{t("Yadanabon University")}</h3>
                  <p>{t("BA English · 2022 — 2023 · Mandalay")}</p>
                </div>
                <div>
                  <span className="micro">{t("RECOGNITION")}</span>
                  <h3>{t("AI Ready ASEAN Youth 2026")}</h3>
                  <p>{t("Team Myanmar · TutorAI")}</p>
                  <h3>{t("Research · NRC 2026")}</h3>
                  <p>{t("Crowd Detection Survey · LPU")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="reviews-section pape∏r-section">
          <div className="section-bar">
            <h2>{t("A few kind words")}</h2>
            <a
              className="small-link"
              href="mailto:swa.developer.expert@gmail.com?subject=Portfolio%20reference"
            >
              {t("Leave a reference ↗")}
            </a>
          </div>
          <div className="review-grid">
            <blockquote>
              <span className="micro">★★★★★</span>
              <p>
                {t(
                  "“The process was well-organised, communication was clear, and the results exceeded my expectations.”",
                )}
              </p>
              <footer>
                {t("Kay Zin Htoo Naing")}
                <span>{t("Fullstack client")}</span>
              </footer>
            </blockquote>
            <blockquote>
              <span className="micro">★★★★★</span>
              <p>
                {t(
                  "“Immediately accessible and much more elegant. Easy to navigate, brand-aligned, delivered exactly as requested.”",
                )}
              </p>
              <footer>
                {t("Sai Lain Leng Fha")}
                <span>{t("Pann Tha Zin · Building materials")}</span>
              </footer>
            </blockquote>
          </div>
        </section>
        <section className="faq-section paper-section">
          <div className="section-bar">
            <h2>{t("A few things you might ask")}</h2>
            <span className="micro">{t("FAQ")}</span>
          </div>
          <div className="editorial-grid">
            <h3 className="faq-title">
              {t("Good questions.")}
              <br />
              {t("Straight answers.")}
            </h3>
            <div className="faqs">
              {faqs.map(([q, a], i) => (
                <details key={q}>
                  <summary>
                    <span className="micro">0{i + 1}</span>
                    {t(q)}
                    <span className="faq-plus">+</span>
                  </summary>
                  <p>{t(a)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section id="contact" className="contact-section dark-section">
          <div className="section-bar">
            <h2>{t("Have something in mind?")}</h2>
            <span className="available">
              <i />
              {t("AVAILABLE FOR WORK")}
            </span>
          </div>
          <div className="contact-intro">
            <p>
              {t("Fulltime, freelance, or a good idea.")}
              <br />
              {t("Let’s talk about what comes next.")}
            </p>
            <div>
              <a
                className="contact-cta"
                href="mailto:swa.developer.expert@gmail.com"
              >
                {t("Email me")}
                <span>↗</span>
              </a>
              <a
                className="resume-link"
                href="/SHWE WIN AUNG - FullStack Developer_Resume.pdf"
                download
              >
                {t("Download resume ↓")}
              </a>
            </div>
          </div>
          <a
            className="contact-title"
            href="mailto:swa.developer.expert@gmail.com"
          >
            {t("let’s work")}
            <br />
            {t("together")}
            <span>↗</span>
          </a>
          <div className="contact-meta">
            <span className="micro">
              {t("PUNJAB, INDIA ·")}
              {time || "—"}
              {t("IST")}
            </span>
            <span className="micro">
              {t("OPEN TO OPPORTUNITIES WORLDWIDE")}
            </span>
            <button className="small-link" onClick={copyEmail}>
              {t(copied ? "Email copied ✓" : "Copy email ↗")}
            </button>
          </div>
        </section>
      </main>
      <footer className="site-footer dark-section">
        <div className="footer-grid">
          <div>
            <span className="micro">{t("NAVIGATION")}</span>
            <a href="#work">{t("Projects")}</a>
            <a href="#services">{t("Expertise")}</a>
            <a href="#journey">{t("Journey")}</a>
            <a href="#top">{t("Back to top ↑")}</a>
          </div>
          <div>
            <span className="micro">{t("ELSEWHERE")}</span>
            <a
              href="https://github.com/niteash"
              target="_blank"
              rel="noreferrer"
            >
              {t("GitHub ↗")}
            </a>
            <a
              href="https://linkedin.com/in/shwe-win-aung"
              target="_blank"
              rel="noreferrer"
            >
              {t("LinkedIn ↗")}
            </a>
            <a
              href="https://open.spotify.com/search/Eminem%20Not%20Afraid"
              target="_blank"
              rel="noreferrer"
            >
              {t("On repeat: Not Afraid ↗")}
            </a>
          </div>
          <div>
            <span className="micro">{t("CONTACT")}</span>
            <a href="mailto:swa.developer.expert@gmail.com">
              {t("swa.developer.expert@gmail.com")}
            </a>
            <span>{t("Usually replies within 24 hours.")}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t("© 2026 SHWE WIN AUNG")}</span>
          <button aria-pressed={paused} onClick={() => setPaused(!paused)}>
            {t(paused ? "Play motion" : "Pause motion")}
          </button>
          <span>{t("FROM MYANMAR, TO THE WORLD.")}</span>
        </div>
      </footer>
      <button
        className="chat-trigger"
        onClick={() => setChat(!chat)}
        aria-expanded={chat}
      >
        {t("✦ Ask my portfolio")}
      </button>
      {chat && (
        <aside className="chat" data-lenis-prevent>
          <div className="chat-head">
            <strong>{t("Portfolio Q&A")}</strong>
            <button aria-label={t("Close Q&A")} onClick={() => setChat(false)}>
              ×
            </button>
          </div>
          <p aria-live="polite">{t(answer)}</p>
          <div className="suggestions">
            {[
              "What is your tech stack?",
              "Tell me about your AI projects",
              "Are you available to hire?",
              "What is your GSoC work?",
            ].map((q) => (
              <button key={q} onClick={() => ask(q)}>
                {t(q)} ↗
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <input
              aria-label={t("Ask about Shwe")}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("Ask about my work…")}
              required
            />
            <button aria-label={t("Send question")}>→</button>
          </form>
        </aside>
      )}
      {selected !== null && (
        <div
          className="modal-backdrop"
          data-lenis-prevent
          onClick={() => setSelected(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              className="close"
              onClick={() => setSelected(null)}
              aria-label={t("Close case study")}
            >
              ×
            </button>
            <img
              className="case-cover"
              src={projects[selected].image}
              alt={t(projects[selected].imageAlt)}
              width="1200"
              height="800"
            />
            <div className="case-body">
              <span className="micro">
                {t("PROJECT 0")}
                {selected + 1} / {t(projects[selected].type)}
              </span>
              <h2 id="case-title">{projects[selected].name}</h2>
              <span className="project-result">
                {t(projects[selected].metric)}
              </span>
              <p>{t(projects[selected].desc)}</p>
              <TechList items={projects[selected].tech.split(" · ")} />
              {selected === 0 && (
                <blockquote className="case-testimonial">
                  <span className="micro">
                    {t("CLIENT TESTIMONIAL · ★★★★★")}
                  </span>
                  <p>
                    {t(
                      "“Immediately accessible and much more elegant. Easy to navigate, brand-aligned, delivered exactly as requested.”",
                    )}
                  </p>
                  <footer>
                    {t("Sai Lain Leng Fha")}
                    <span>{t("· Pann Tha Zin · Building materials")}</span>
                  </footer>
                </blockquote>
              )}
              <div className="modal-links">
                {projects[selected].url && (
                  <a
                    className="contact-cta"
                    href={projects[selected].url!}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("Visit website ↗")}
                  </a>
                )}
                {projects[selected].repo ? (
                  <a
                    href={projects[selected].repo!}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("View source ↗")}
                  </a>
                ) : (
                  <a href="mailto:swa.developer.expert@gmail.com?subject=AI%20Trip%20Planner">
                    {t("Ask about this project ↗")}
                  </a>
                )}
              </div>
              <span className="micro cover-note">
                {t("GENERATED PROJECT COVER")}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
