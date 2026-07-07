import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, X } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

const teamData = [
  {
    id: 1,
    name: "U Khin Maung Win",
    role: "CEO",
    quote1: "I always knew I wanted to be a businessman.",
    quote2:
      "Starting from a young age I made learning a priority- I never skimmed over books, I asked teachers a lot of questions and I observed those around me.",
    desc1:
      "U Khin Maung Win was born in Mandalay, the second of four children. At the tender age of six, his parents divorced and he and his siblings moved to the countryside with their mother.",
    desc2:
      "His first lesson in management was taking care of his family’s cows. ‘I was just a little boy but I had to make sure they were kept safe, were fed on time and had enough water.’ A short time later, U Khin Maung Win started attending a monastic school. He was captivated by the head monks’ ability to manage the students.",
    readMore: [
      "The experiences and struggles that he faced in the following decade are, in U Khin Maung Win’s eyes, the reason he is the successful man he is today. He was captivated by the head monks’ ability to manage the students and the daily activities of the monastery. This observation was, he later realized, the second leadership lesson that would impact his later life.",
      "Having completed fifth standard at the monastic school, U Khin Maung Win decided to move back to Mandalay and start working. Arriving back to the buzzing city, with just 35 kyats in his pocket, he got a job at a mechanic workshop run by a family friend. The work was a perfect fit- the engines and machines captivated his curious mind. And it was here, he says, that he learned his third lesson. ‘The master mechanic had to control his staff, organize the shop, maintain the quality of work and still make a profit. His business skills made a big impression on me.",
      "After cutting his teeth as a mechanic, U Khin Maung Win had gained the confidence and experience, as well as saved up enough money, to set up UD Group in 2002. It may seem like an almost casual decision. But U Khin Maung Win is not one to leave things to chance. He was confident in his abilities as a businessman and confident in his technical skills, but he humbly knew he was not yet ready to strike out fully alone. So in his early years running UD Group, he regularly sought the advice and guidance of successful Mandalay business owners and poured over management books in his free time.",
      "This combination of factors equated to success from the start. And in the 17 years that UD Group has been operating, the company has grown from a team of 10 workers to more than 300 employees. The head office and two main factories are located in Mandalay with their manufactured products, such as generators and light trucks, sold throughout the country. As well, UD Group provides crane rental and support services in all of Myanmar’s states and divisions. To have achieved such widespread success and to manage such challenging logistics is a testament to U Khin Maung Win’s dedication and business savvy.",
      "With his son now handling most of the daily running of UDCorporation, one would think that U Khin Maung Win is enjoying some down time and relaxing. But when asked about his leisure time he quickly replies with a smile, ‘My job is my passion. I don’t need to relax after working as work is enjoyable for me.’ This mimics the sentiments of one of his business heroes, Sochiro Honda. The founder of Honda Automotive was, like U Khin Maung Win, a self-made man and a visionary who loved his work.",
      "U Khin Maung Win fondly recalls one example of this, ‘One day he [Mr Honda] was speaking to a group of students and he asked them ‘What do you do on your days off from school and work?’. The students responded that they liked to relax to which Mr Honda said ‘My work is relaxing for me. That’s why I never have a day off’. But U Khin Maung Win does have hobbies other than work. His biggest passion is reading and researching- a notebook is never far from his side, where he jots down notes or inspiration for new ideas. ‘The more I read and the more I learn, the better I am as a business owner and member of Myanmar society. There is no need to stop learning once you are successful as being successful doesn’t mean you know it all. I would be bored if I wasn’t learning something new every day’, he remarks.",
      "In addition to these academic hobbies, U Khin Maung Win dabbles in photography and gardening. And, as is expected from a man who has built a business on automobile manufacturing, he loves cars and is the proud owner of a Rolls Royce among other luxury vehicles. Despite this picture of success, U Khin Maung Win never forgets his humble beginnings and the people who helped him along the way. His legacy is important to him and he wants to encourage not just only his family but all young people to strive for success. ‘It may sound strange, but I want my loved ones to struggle. I want them to face challenges and find ways to overcome them. This is the best way to learn’, he stated.",
      "U Khin Maung Win plans to write a book in the near future, passing on his knowledge and experience to potential business leaders. ‘It is important that we encourage the younger generation to be interested in technology, to believe in the value of education and to serve their community’, he says. ‘There is potential but too many young people are not motivated. They blame their parents for not providing money to help them start a business. But that should not be the case – their parents gave them a brain and a healthy body. That is all that is needed to get a start in the business world’.",
    ],
    image: "https://pngimg.com/d/businessman_PNG6566.png",
  },
  {
    id: 2,
    name: "Mr. Wai Lin Tun",
    role: "Director",
    quote1:
      "I have a strong passion for machines, technology, and efficient project execution.",
    quote2:
      "My deep understanding of mechanical systems allows me to tackle complex technical issues while driving efficiency in project development.",
    desc1:
      "Mr. Wai Lin Tun is a dynamic leader and problem-solver. As the Director of Amara Garden City, he plays a pivotal role in leading the implementation of the project.",
    desc2:
      "He manages government and investment sector dealings, and oversees strategic planning. A fast learner with a hands-on approach, he is known for his ability to analyze challenges and find innovative solutions.",
    readMore: [
      "His deep understanding of mechanical systems allows him to tackle complex technical issues while driving efficiency in project development.",
      "Beyond project execution, he leads key meetings, collaborates with stakeholders, and listens closely to the CEO’s vision to translate ideas into actionable plans. His leadership ensures that Amara Garden City is developed with precision, innovation, and long-term sustainability in mind.",
      "With a commitment to excellence and strategic growth, Mr. Wai Lin Tun is shaping the future of Amara Garden City, making it a landmark project in urban development.",
    ],
    image: "https://pngimg.com/d/businessman_PNG6565.png",
  },
  {
    id: 3,
    name: "Ms Win Win Htun",
    role: "Director of UD Group",
    quote1:
      "I focus on building strategic partnerships and expanding investment opportunities.",
    quote2:
      "I actively work to support and connect business leaders, foster entrepreneurship, and introduce innovative programs.",
    desc1:
      "As the Director of UD Group, Ms Win Win Htun plays a key role in shaping the company’s growth and strategic direction.",
    desc2:
      "With a strong background in marketing, branding, and business development, she has been instrumental in expanding UD Group’s presence across various industries.",
    readMore: [
      "Beyond UD Group, Ms Win Win Htun is also the Co-founder of Swara Branding & Marketing, where they specialize in helping businesses establish strong brand identities and market positioning. Their expertise in marketing has been crucial in elevating UD Group’s reputation and projects, including the flagship Amara Garden City.",
      "In addition, Ms Win Win Htun serves as the Treasurer of the Mandalay Region Young Entrepreneur Association (MRYEA), actively working to support and connect business leaders, foster entrepreneurship, and introduce innovative programs to the local business community.",
      "Committed to social impact, Ms Win Win Htun is also the Membership Chair of the Rotary Club of Yadanabon Myanmar, leading initiatives that contribute to community development and humanitarian efforts.",
      "Ms Win Win Htun is focused on building strategic partnerships and expanding investment opportunities to drive UD Group’s future growth, particularly in the real estate sector. Their leadership across multiple sectors ensures that Amara Garden City remains a benchmark for modern, sustainable living in Myanmar.",
    ],
    image: "https://pngimg.com/d/businessman_PNG6564.png",
  },
];

export function TeamRecruitment() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const contentsRef = useRef<(HTMLDivElement | null)[]>([]);
  const indicatorsRef = useRef<(HTMLDivElement | null)[]>([]);

  const xToBg = useRef<gsap.QuickToFunc | null>(null);
  const yToBg = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    xToBg.current = gsap.quickTo(".bg-parallax", "x", {
      duration: 1,
      ease: "power2.out",
    });
    yToBg.current = gsap.quickTo(".bg-parallax", "y", {
      duration: 1,
      ease: "power2.out",
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 30; // parallax range
    const y = (clientY / window.innerHeight - 0.5) * 30;

    xToBg.current?.(x);
    yToBg.current?.(y);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const totalItems = teamData.length;

      // Initial state
      gsap.set(imagesRef.current.slice(1), { opacity: 0, scale: 1.05 });
      gsap.set(contentsRef.current.slice(1), {
        opacity: 0,
        y: 40,
        autoAlpha: 0,
      });
      gsap.set(contentsRef.current[0], { opacity: 1, y: 0, autoAlpha: 1 });
      gsap.set(indicatorsRef.current.slice(1), {
        height: 8,
        backgroundColor: "rgba(255,255,255,0.4)",
      });
      gsap.set(indicatorsRef.current[0], {
        height: 32,
        backgroundColor: "rgba(255,255,255,1)",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${totalItems * 100}%`,
          pin: true,
          scrub: 1, // Smooth scrubbing
        },
      });

      // Pause at start
      tl.to({}, { duration: 0.5 });

      for (let i = 0; i < totalItems - 1; i++) {
        tl.to(
          imagesRef.current[i],
          { opacity: 0, scale: 0.95, duration: 1 },
          `step${i}`,
        )
          .to(
            contentsRef.current[i],
            { opacity: 0, y: -40, autoAlpha: 0, duration: 1 },
            `step${i}`,
          )
          .to(
            indicatorsRef.current[i],
            {
              height: 8,
              backgroundColor: "rgba(255,255,255,0.4)",
              duration: 1,
            },
            `step${i}`,
          )

          .to(
            imagesRef.current[i + 1],
            { opacity: 1, scale: 1, duration: 1 },
            `step${i}`,
          )
          .to(
            contentsRef.current[i + 1],
            { opacity: 1, y: 0, autoAlpha: 1, duration: 1 },
            `step${i}`,
          )
          .to(
            indicatorsRef.current[i + 1],
            { height: 32, backgroundColor: "rgba(255,255,255,1)", duration: 1 },
            `step${i}`,
          );

        // Pause at each item
        tl.to({}, { duration: 0.5 });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (expandedId !== null) {
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
  }, [expandedId]);

  return (
    <>
      <section
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        className="relative h-screen w-full bg-white dark:bg-[#0a0a0a] py-8 px-4 md:px-12 transition-colors duration-500"
      >
        <div className="relative w-full h-full max-w-[1600px] mx-auto overflow-hidden dark:bg-[#1a1a1a] rounded-sm transition-colors duration-500">
          {/* Iframe Background */}
          <iframe
            src="https://colorflow-embed.b-cdn.net/embed.html#e=_m3lgihA"
            className="absolute inset-0 w-full h-full border-0 pointer-events-none z-0 dark:hidden"
            title="Background animation"
            loading="lazy"
          />
          {/* Blueprint Grid Background */}
          <div className="bg-parallax absolute -inset-12.5 z-0 pointer-events-none opacity-40 dark:opacity-20 transition-opacity duration-500 blueprint-grid-bg" />

          {/* Top Left White Box */}
          <div className="absolute top-0 left-0 bg-white dark:bg-[#121212] px-6 md:px-12 py-4 md:py-12 z-30 rounded-br-md transition-colors duration-500 border-b border-r border-transparent dark:border-[#B89851]/20">
            <h2 className="text-[#0A71C6] dark:text-[#B89851] text-3xl md:text-6xl font-black font-sans leading-tight tracking-tight transition-colors duration-500 uppercase">
              {t("team.title")}
            </h2>
          </div>

          {/* Center Person Images (Transparent Background) */}
          <div className="absolute bottom-0 left-1/2 md:left-[45%] -translate-x-1/2 w-[90vw] md:w-150 h-[75vh] md:h-[85vh] z-10 pointer-events-none">
            {teamData.map((data, idx) => (
              <img
                key={`img-${data.id}`}
                ref={(el) => {
                  imagesRef.current[idx] = el;
                }}
                src={data.image}
                alt={data.name}
                loading="lazy"
                decoding="async"
                className="absolute bottom-0 w-full h-full object-contain object-bottom origin-bottom drop-shadow-2xl dark:brightness-90 transition-all duration-500"
                style={{ willChange: "transform, opacity" }}
              />
            ))}
          </div>

          {/* Right Side Text Content Container */}
          <div className="absolute left-8 right-4 md:left-auto md:right-16 top-[55%] md:top-1/2 -translate-y-1/2 z-20 md:w-full md:max-w-xl h-auto md:h-125 pointer-events-none">
            {teamData.map((data, idx) => (
              <div
                key={`content-${data.id}`}
                ref={(el) => {
                  contentsRef.current[idx] = el;
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 space-y-4 md:space-y-6 w-full text-white font-sans drop-shadow-md bg-black/40 md:bg-black/20 dark:bg-[#121212]/80 p-5 md:p-8 rounded-lg backdrop-blur-md dark:border dark:border-[#B89851]/30 pointer-events-auto transition-colors duration-500"
                style={{ willChange: "transform, opacity" }}
              >
                <div>
                  <p className="font-mono text-white/80 dark:text-[#B89851]/80 text-xs tracking-widest uppercase mb-1 transition-colors duration-500">
                    {data.role}
                  </p>
                  <h3 className="font-serif text-2xl md:text-4xl dark:text-[#B89851] transition-colors duration-500">
                    {data.name}
                  </h3>
                </div>
                <div className="space-y-2 md:space-y-3">
                  <p className="font-medium text-base md:text-xl tracking-wide leading-snug italic opacity-90 text-[#e0f2fe] dark:text-neutral-300 transition-colors duration-500 line-clamp-2 md:line-clamp-none">
                    "{data.quote1}"
                  </p>
                  <p className="font-medium text-base md:text-xl tracking-wide leading-snug italic opacity-90 text-[#e0f2fe] dark:text-neutral-300 transition-colors duration-500 line-clamp-2 md:line-clamp-none">
                    "{data.quote2}"
                  </p>
                </div>
                <div className="space-y-2 md:space-y-3 hidden sm:block">
                  <p className="text-xs md:text-sm font-light opacity-90 leading-relaxed dark:text-neutral-400 transition-colors duration-500">
                    {data.desc1}
                  </p>
                  <p className="text-xs md:text-sm font-light opacity-90 leading-relaxed dark:text-neutral-400 transition-colors duration-500">
                    {data.desc2}
                  </p>
                </div>
                {data.readMore && (
                  <button
                    onClick={() => setExpandedId(data.id)}
                    className="mt-2 md:mt-4 px-4 md:px-6 py-1.5 md:py-2 bg-white/10 dark:bg-[#B89851]/10 hover:bg-white/20 dark:hover:bg-[#B89851]/20 text-white dark:text-[#B89851] rounded border border-white/30 dark:border-[#B89851]/30 transition-colors text-xs md:text-sm tracking-widest uppercase font-bold"
                  >
                    Read More
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="absolute left-3 md:left-12 top-[55%] md:top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 md:gap-3">
            {teamData.map((_, idx) => (
              <div
                key={`indicator-${idx}`}
                ref={(el) => {
                  indicatorsRef.current[idx] = el;
                }}
                className="w-1.5 rounded-full"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Read More Modal */}
      {expandedId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-[#e6c875] w-full max-w-3xl max-h-[85vh] rounded-lg shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(184,152,81,0.25)] flex flex-col overflow-hidden relative transition-colors duration-500 border dark:border-[#B89851]/20">
            <button
              onClick={() => setExpandedId(null)}
              className="absolute top-4 right-4 p-2 text-neutral-500 dark:text-[#B89851]/60 hover:text-neutral-900 dark:hover:text-[#B89851] hover:bg-neutral-100 dark:hover:bg-[#B89851]/10 rounded-full transition-colors z-10"
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            {teamData
              .filter((d) => d.id === expandedId)
              .map((data) => (
                <div
                  key={data.id}
                  className="overflow-y-auto p-8 md:p-12"
                  data-lenis-prevent="true"
                >
                  <p className="font-mono text-[#0A71C6] dark:text-[#B89851] font-bold text-sm tracking-widest uppercase mb-2 transition-colors duration-500">
                    {data.role}
                  </p>
                  <h3 className="font-serif text-4xl md:text-5xl font-light mb-8 text-neutral-900 dark:text-[#B89851] transition-colors duration-500">
                    {data.name}
                  </h3>

                  <div className="space-y-6 text-neutral-700 dark:text-neutral-300 font-light leading-relaxed text-lg transition-colors duration-500">
                    <p className="text-2xl font-medium italic text-neutral-800 dark:text-[#B89851]/90 mb-8 pb-8 border-b border-neutral-200 dark:border-[#B89851]/20 transition-colors duration-500">
                      "{data.quote1} {data.quote2}"
                    </p>

                    <p>{data.desc1}</p>
                    <p>{data.desc2}</p>

                    {data.readMore?.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
