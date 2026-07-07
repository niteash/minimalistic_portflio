import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image as DreiImage, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import { X, Globe } from "lucide-react";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";

const strengths = {
  eyebrow: "04 / PROJECTS",
  heading: "BUILDING THE UNIMAGINABLE",
  subheading: "",
  cards: [
    {
      index: "01",
      label: "INNOVATION",
      title: "Pioneering Sustainable Tech",
      body: "We integrate the latest advancements in eco-friendly materials and energy-efficient systems.",
      image:
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782363113/sv1_zdwaes.jpg",
    },
    {
      index: "02",
      label: "PRECISION",
      title: "Flawless Execution",
      body: "Our rigorous quality control ensures every project meets the highest standards of structural integrity.",
      image:
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1734612739/siteLocation_lu6lrk.jpg",
    },
    {
      index: "03",
      label: "SCALE",
      title: "Monumental Ambition",
      body: "From boutique commercial spaces to sprawling urban centers, we have the capacity to build at any scale.",
      image:
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782361875/siteLocation_lu6lrk.jpg",
    },
    {
      index: "04",
      label: "VISION",
      title: "Architectural Foresight",
      body: "Anticipating future trends to design spaces that remain relevant and inspiring for generations.",
      image:
        "https://res.cloudinary.com/dcdc4hj6v/image/upload/v1782363113/sv1_zdwaes.jpg",
    },
  ],
};

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  position: [number, number, number];
}

const numItems = 8;
const radius = 12;
export const galleryItems: GalleryItem[] = Array.from(
  { length: numItems },
  (_, i) => {
    const cardIndex = i % strengths.cards.length;
    const card = strengths.cards[cardIndex];
    const angle = (i / numItems) * Math.PI * 2;
    const yOffset = i % 2 === 0 ? 1.5 : -1.5;

    return {
      id: `img-${i}`,
      title: card.title,
      description: card.body,
      url: card.image,
      category: card.label,
      position: [radius * Math.sin(angle), yOffset, radius * Math.cos(angle)],
    };
  },
);

function GalleryCard({
  item,
  setSelectedItem,
}: {
  item: GalleryItem;
  setSelectedItem: (item: GalleryItem) => void;
}) {
  const ref = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...item.position);
      ref.current.lookAt(0, 0, 0);
    }
  }, [item]);

  useFrame(() => {
    if (ref.current) {
      const targetScale = hovered ? 1.05 : 1;
      ref.current.scale.lerp(
        new THREE.Vector3(8 * targetScale, 5.33 * targetScale, 1),
        0.1,
      );
    }
  });

  return (
    <DreiImage
      ref={ref}
      url={item.url}
      transparent={false}
      toneMapped={true}
      zoom={1}
      segments={1}
      scale={[8, 5.33]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem(item);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    />
  );
}

function SphericalGallery({
  setSelectedItem,
}: {
  setSelectedItem: (item: GalleryItem) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  const activeTouches = useRef(new Map<number, { x: number; y: number }>());

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(".ui-layer")) return;
      if (e.pointerType === "touch") return;
      isDragging.current = true;
      previousPointer.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = "grabbing";
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "auto";
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousPointer.current.x;
      const deltaY = e.clientY - previousPointer.current.y;

      targetRotation.current.y += deltaX * 0.003;
      targetRotation.current.x += deltaY * 0.003;
      targetRotation.current.x = THREE.MathUtils.clamp(
        targetRotation.current.x,
        -Math.PI / 4,
        Math.PI / 4,
      );
      previousPointer.current = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest(".ui-layer")) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        targetRotation.current.y += e.deltaX * 0.001;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest(".ui-layer")) return;
      if (e.touches.length === 2) {
        e.preventDefault();
        activeTouches.current.clear();
        for (let i = 0; i < e.touches.length; i++) {
          activeTouches.current.set(e.touches[i].identifier, {
            x: e.touches[i].clientX,
            y: e.touches[i].clientY,
          });
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest(".ui-layer")) return;
      if (e.touches.length === 2) {
        e.preventDefault();

        let cx = 0;
        let cy = 0;
        let p_cx = 0;
        let p_cy = 0;

        const currentTouches = new Map<number, { x: number; y: number }>();

        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          currentTouches.set(touch.identifier, {
            x: touch.clientX,
            y: touch.clientY,
          });
          cx += touch.clientX;
          cy += touch.clientY;

          const pTouch = activeTouches.current.get(touch.identifier);
          if (pTouch) {
            p_cx += pTouch.x;
            p_cy += pTouch.y;
          } else {
            p_cx += touch.clientX;
            p_cy += touch.clientY;
          }
        }

        cx /= 2;
        cy /= 2;
        p_cx /= 2;
        p_cy /= 2;

        const deltaX = cx - p_cx;
        const deltaY = cy - p_cy;

        targetRotation.current.y += deltaX * 0.003;
        targetRotation.current.x += deltaY * 0.003;
        targetRotation.current.x = THREE.MathUtils.clamp(
          targetRotation.current.x,
          -Math.PI / 4,
          Math.PI / 4,
        );

        activeTouches.current = currentTouches;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        activeTouches.current.clear();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);
    gl.domElement.addEventListener("wheel", handleWheel, { passive: false });
    gl.domElement.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    gl.domElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    gl.domElement.addEventListener("touchend", handleTouchEnd);
    gl.domElement.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
      gl.domElement.removeEventListener("wheel", handleWheel);
      gl.domElement.removeEventListener("touchstart", handleTouchStart);
      gl.domElement.removeEventListener("touchmove", handleTouchMove);
      gl.domElement.removeEventListener("touchend", handleTouchEnd);
      gl.domElement.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [gl]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        4,
        delta,
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        4,
        delta,
      );
    }
  });

  return (
    <group ref={groupRef}>
      {galleryItems.map((item) => (
        <GalleryCard
          key={item.id}
          item={item}
          setSelectedItem={setSelectedItem}
        />
      ))}
    </group>
  );
}

function DetailView({
  selectedItem,
  setSelectedItem,
}: {
  selectedItem: GalleryItem | null;
  setSelectedItem: (item: GalleryItem | null) => void;
}) {
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
      // @ts-ignore
      window.appLenis?.stop?.();
    } else {
      document.body.style.overflow = "";
      // @ts-ignore
      window.appLenis?.start?.();
    }
    return () => {
      document.body.style.overflow = "";
      // @ts-ignore
      window.appLenis?.start?.();
    };
  }, [selectedItem]);

  return (
    <AnimatePresence>
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: "10%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "10%" }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[1000] bg-white dark:bg-ink text-neutral-900 dark:text-gold flex flex-col pointer-events-auto ui-layer transition-colors duration-500 overflow-y-auto"
          data-lenis-prevent="true"
        >
          {/* Header */}
          <div className="sticky top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50 w-full pointer-events-none">
            <div className="w-full max-w-7xl mx-auto flex justify-between items-center pointer-events-none">
              <h2 className="text-xl font-serif tracking-wide hidden md:block dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-gold dark:to-gold-light">
                Strength Focus
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="group flex items-center gap-3 px-6 py-3 bg-white/90 dark:bg-ink/90 backdrop-blur-sm border border-neutral-200 dark:border-gold/30 rounded-full hover:bg-neutral-900 hover:text-white dark:hover:bg-gold dark:hover:text-white transition-all duration-300 focus:outline-none ml-auto pointer-events-auto shadow-xl"
              >
                <Globe size={18} className="animate-pulse transition-colors" />
                <span className="font-mono text-xs font-bold tracking-widest uppercase mt-0.5 group-hover:tracking-[0.15em] transition-all duration-300">
                  Back to View
                </span>
                <X
                  size={18}
                  className="opacity-50 group-hover:opacity-100 transition-opacity"
                />
              </button>
            </div>
          </div>

          <div className="w-full flex-1">
            <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto pb-12 px-6 lg:px-8">
              {/* Left Image Area */}
              <div className="w-full lg:w-1/2 p-0 lg:p-12 mb-12 lg:mb-0 flex items-center justify-center">
                <motion.img
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.8,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                  src={selectedItem.url}
                  className="w-full h-auto max-h-[70vh] rounded-sm shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(184,152,81,0.25)] object-cover"
                  alt={selectedItem.title}
                />
              </div>

              {/* Right Text Area */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center lg:py-12">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-sm font-mono tracking-widest text-neutral-500 dark:text-gold/70 inline-block border border-neutral-200 dark:border-gold/30 rounded-full px-4 py-1">
                      {selectedItem.category}
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight mb-8 font-light leading-[1.1] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-gold dark:to-gold-light">
                    {selectedItem.title}
                  </h1>

                  <p className="text-lg text-neutral-600 dark:text-neutral-300 font-light leading-relaxed max-w-xl mb-12">
                    {selectedItem.description}
                  </p>

                  <div className="grid grid-cols-2 gap-8 border-t border-neutral-200 dark:border-gold/20 pt-8 max-w-xl mb-12">
                    <div>
                      <h4 className="text-xs font-mono text-neutral-400 dark:text-gold/60 mb-2 tracking-widest">
                        LOCATION
                      </h4>
                      <p className="text-sm font-medium dark:text-neutral-300">
                        Amara Garden City
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono text-neutral-400 dark:text-gold/60 mb-2 tracking-widest">
                        YEAR
                      </h4>
                      <p className="text-sm font-medium dark:text-neutral-300">
                        2026
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GalleryFallbackGrid({
  setSelectedItem,
}: {
  setSelectedItem: (item: GalleryItem) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-y-auto p-8 pt-32">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {galleryItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="relative aspect-square overflow-hidden rounded-sm group text-left"
          >
            <img
              src={item.url}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white text-sm font-serif">{item.title}</p>
              <p className="text-white/60 text-[10px] uppercase tracking-widest">{item.category}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Strengths() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  return (
    <section id="strengths" className="relative w-full h-[100svh] bg-neutral-100 dark:bg-[#050505] overflow-hidden transition-colors duration-500">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-8 flex flex-col md:flex-row justify-between items-start z-10 pointer-events-none ui-layer">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-neutral-500 dark:text-gold/60 text-[10px] uppercase tracking-[0.2em] mb-4 transition-colors duration-500">
            {strengths.eyebrow}
          </p>
          <h2 className="font-serif text-[clamp(40px,5vw,72px)] leading-[0.9] tracking-tight text-neutral-900 dark:text-gold">
            Our{" "}
            <span className="italic dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-gold dark:to-gold-light">
              DEVELOPMENTS.
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 md:mt-0 text-right"
        >
          <p className="text-xs font-mono text-neutral-500 dark:text-gold/80 uppercase tracking-widest bg-white/80 dark:bg-ink/80 backdrop-blur px-4 py-2 rounded-full border border-neutral-200 dark:border-gold/30">
            <span className="hidden md:inline">
              Drag to rotate • Click to view
            </span>
            <span className="md:hidden">
              Two fingers to rotate • Tap to view
            </span>
          </p>
        </motion.div>
      </div>

      <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <CanvasErrorBoundary
          fallback={<GalleryFallbackGrid setSelectedItem={setSelectedItem} />}
        >
          <Canvas
            style={{ touchAction: "pan-y" }}
            camera={{ position: [0, 0, 0.1], fov: 60 }}
            dpr={1}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
            <ambientLight intensity={2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <React.Suspense fallback={null}>
              <SphericalGallery setSelectedItem={setSelectedItem} />
              <Environment preset="city" />
            </React.Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      <DetailView
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
    </section>
  );
}
