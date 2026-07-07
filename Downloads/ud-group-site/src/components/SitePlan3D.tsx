import { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "../hooks/useReducedMotion";

type ParcelStatus = "available" | "reserved" | "sold";

interface Parcel {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  status: ParcelStatus;
  lotSize: string;
}

const STATUS_COLOR: Record<ParcelStatus, string> = {
  available: "#b89851",
  reserved: "#c9a86b",
  sold: "#4b4b4b",
};

const STATUS_LABEL: Record<ParcelStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

// Illustrative parcel grid standing in for a real surveyed site plan —
// swap `parcels` for actual lot data + GPS-derived coordinates when ready.
function buildParcels(): Parcel[] {
  const parcels: Parcel[] = [];
  const cols = 6;
  const rows = 4;
  const spacing = 2.6;
  let id = 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seed = (row * cols + col) % 7;
      const status: ParcelStatus = seed === 0 ? "sold" : seed === 3 ? "reserved" : "available";
      parcels.push({
        id: `Lot ${String(id).padStart(2, "0")}`,
        x: (col - (cols - 1) / 2) * spacing,
        z: (row - (rows - 1) / 2) * spacing,
        width: 1.8,
        depth: 1.8,
        status,
        lotSize: `${(800 + seed * 40).toLocaleString()} sq ft`,
      });
      id++;
    }
  }
  return parcels;
}

function ParcelBlock({ parcel }: { parcel: Parcel }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetY = hovered ? 0.55 : 0.3;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.18;
  });

  return (
    <group position={[parcel.x, 0, parcel.z]}>
      <RoundedBox
        ref={meshRef as never}
        args={[parcel.width, 0.6, parcel.depth]}
        radius={0.04}
        smoothness={2}
        position={[0, 0.3, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <meshStandardMaterial
          color={STATUS_COLOR[parcel.status]}
          roughness={0.6}
          metalness={0.15}
          emissive={hovered ? STATUS_COLOR[parcel.status] : "#000000"}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </RoundedBox>

      {hovered && (
        <Html position={[0, 1.1, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div className="px-3 py-1.5 rounded-md bg-white/95 dark:bg-ink/95 border border-neutral-200 dark:border-gold/30 shadow-lg whitespace-nowrap">
            <p className="text-xs font-semibold text-neutral-900 dark:text-gold">{parcel.id}</p>
            <p className="text-[10px] text-neutral-500 dark:text-gold/70">
              {parcel.lotSize} · {STATUS_LABEL[parcel.status]}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Roads() {
  const roadMat = { color: "#2a2a2a", roughness: 0.9 };
  return (
    <group position={[0, 0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 1.1]} />
        <meshStandardMaterial {...roadMat} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, 12]} />
        <meshStandardMaterial {...roadMat} />
      </mesh>
    </group>
  );
}

function Lake() {
  // Stands in for Taung Tha Man lake, referenced in the site-context copy —
  // a soft blue plane anchoring one edge of the plan for orientation.
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.5, 0.005, 3]}>
      <circleGeometry args={[3.2, 32]} />
      <meshStandardMaterial color="#7fb3d5" roughness={0.2} metalness={0.1} transparent opacity={0.75} />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[40, 30]} />
      <meshStandardMaterial color="#e9e4d8" roughness={1} />
    </mesh>
  );
}

function Scene({ autoRotate }: { autoRotate: boolean }) {
  const parcels = useMemo(buildParcels, []);

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 12, 6]} intensity={1.1} />
      <directionalLight position={[-6, 6, -4]} intensity={0.3} color="#b89851" />

      <Ground />
      <Roads />
      <Lake />
      {parcels.map((p) => (
        <ParcelBlock key={p.id} parcel={p} />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={10}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.4}
        minPolarAngle={Math.PI / 6}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
      />
    </>
  );
}

/**
 * Replaces the OpenStreetMap iframe previously used as decorative backdrop
 * in CommitmentSection — that gave you an unstyled live map (default
 * zoom/attribution chrome you can't remove from an iframe) for a purely
 * decorative, non-interactive spot. This is custom-built, on-brand, and
 * the hover/tooltip interaction is actually useful instead of inert.
 */
export function SitePlan3D({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={className}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [10, 9, 12], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene autoRotate={!reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
