import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useMotionValue, useSpring } from "motion/react";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uHover;
uniform float uTime;
uniform vec2 uScale;
varying vec2 vUv;

void main() {
  // Center UVs and scale them to simulate object-fit: cover
  vec2 uv = (vUv - 0.5) * uScale + 0.5;
  
  // Subtle liquid distortion
  float noiseX = sin(uv.y * 15.0 + uTime * 2.0) * 0.015 * uHover;
  float noiseY = cos(uv.x * 15.0 + uTime * 2.0) * 0.015 * uHover;
  
  vec2 distortedUv = uv + vec2(noiseX, noiseY);
  
  // Slight zoom on hover
  distortedUv = (distortedUv - 0.5) * (1.0 - uHover * 0.05) + 0.5;
  
  vec4 color = texture2D(tDiffuse, distortedUv);
  
  // Grayscale calculation
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  vec3 grayColor = vec3(gray);
  
  // Mix between grayscale and original color based on hover
  // Or just keep it mostly grayscale but add a tint. 
  // Let's transition from grayscale to full color on hover!
  color.rgb = mix(grayColor, color.rgb, uHover);
  
  // Multiply blend mode simulation against neutral-200 background (approx vec3(0.89))
  // To avoid actual CSS mix-blend-mode performance hit
  vec3 bgColor = vec3(0.89);
  color.rgb = mix(bgColor, color.rgb * bgColor, 0.8);
  
  gl_FragColor = color;
}
`;

function LiquidMaterial({
  imageUrl,
  isHovered,
}: {
  imageUrl: string;
  isHovered: boolean;
}) {
  const url = useMemo(
    () => imageUrl + (imageUrl.includes("?") ? "&" : "?") + "webgl=true",
    [imageUrl],
  );
  const texture = useTexture(url);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const hoverSpring = useSpring(0, { stiffness: 100, damping: 20 });

  // Calculate scale for object-fit: cover
  const scale = useMemo(() => {
    const img = texture.image as HTMLImageElement;
    const imageAspect = img.width / img.height;
    const canvasAspect = size.width / size.height;

    let scaleX = 1;
    let scaleY = 1;

    if (canvasAspect > imageAspect) {
      // Canvas is wider than image, fit to width, crop height
      scaleY = imageAspect / canvasAspect;
    } else {
      // Canvas is taller than image, fit to height, crop width
      scaleX = canvasAspect / imageAspect;
    }

    return new THREE.Vector2(scaleX, scaleY);
  }, [texture, size.width, size.height]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      hoverSpring.set(isHovered ? 1 : 0);
      const currentHover = hoverSpring.get();

      materialRef.current.uniforms.uHover.value = currentHover;
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uScale.value = scale;

      // Only request new frames when animation is active
      if (currentHover > 0.001 || isHovered) {
        state.invalidate();
      }
    }
  });

  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: texture },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uScale: { value: scale },
    }),
    [texture, scale],
  );

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
    />
  );
}

export function LiquidImage({
  src,
  isHovered,
  className,
}: {
  src: string;
  isHovered: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          <mesh>
            <planeGeometry args={[2, 2]} />
            <LiquidMaterial imageUrl={src} isHovered={isHovered} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
