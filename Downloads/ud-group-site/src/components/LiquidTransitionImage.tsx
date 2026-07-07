import { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring } from 'motion/react';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float progress;
uniform vec2 uScale1;
uniform vec2 uScale2;
uniform float uTime;
varying vec2 vUv;

// Procedural noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv1 = (vUv - 0.5) * uScale1 + 0.5;
  vec2 uv2 = (vUv - 0.5) * uScale2 + 0.5;
  
  // Calculate noise for displacement
  float noise = snoise(vUv * 5.0 + uTime * 0.5);
  
  // Liquid distortion intensity
  float intensity = 0.3 * sin(progress * 3.14159);
  
  vec2 distortedUv1 = uv1 + vec2(noise, noise) * intensity;
  vec2 distortedUv2 = uv2 - vec2(noise, noise) * intensity;
  
  vec4 _texture1 = texture2D(texture1, distortedUv1);
  vec4 _texture2 = texture2D(texture2, distortedUv2);
  
  gl_FragColor = mix(_texture1, _texture2, progress);
}
`;

function TransitionMaterial({ images, currentIndex }: { images: string[], currentIndex: number }) {
  const urls = useMemo(() => images.map(url => url + (url.includes('?') ? '&' : '?') + 'webgl=true'), [images]);
  const textures = useTexture(urls);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const [targetIndex, setTargetIndex] = useState(currentIndex);
  
  // Trigger transition when currentIndex changes
  useEffect(() => {
    if (currentIndex !== targetIndex) {
      setPrevIndex(targetIndex);
      setTargetIndex(currentIndex);
    }
  }, [currentIndex, targetIndex]);

  const progressSpring = useSpring(0, { stiffness: 40, damping: 14 });

  useEffect(() => {
    progressSpring.set(0); // reset to 0 quickly
    setTimeout(() => {
      progressSpring.set(1); // animate to 1
    }, 50);
  }, [targetIndex, progressSpring]);

  // Calculate scales for object-fit: cover
  const getScale = (texture: THREE.Texture) => {
    if (!texture || !texture.image) return new THREE.Vector2(1, 1);
    const img = texture.image as HTMLImageElement;
    const imageAspect = img.width / img.height;
    const canvasAspect = size.width / size.height;
    
    let scaleX = 1;
    let scaleY = 1;
    
    if (canvasAspect > imageAspect) {
      scaleY = imageAspect / canvasAspect;
    } else {
      scaleX = canvasAspect / imageAspect;
    }
    
    return new THREE.Vector2(scaleX, scaleY);
  };

  const scale1 = useMemo(() => getScale(textures[prevIndex]), [textures, prevIndex, size.width, size.height]);
  const scale2 = useMemo(() => getScale(textures[targetIndex]), [textures, targetIndex, size.width, size.height]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      const currentProgress = progressSpring.get();
      materialRef.current.uniforms.progress.value = currentProgress;
      materialRef.current.uniforms.uTime.value += delta;
      
      // Keep re-rendering while animating
      if (currentProgress > 0.001 && currentProgress < 0.999) {
        state.invalidate();
      }
    }
  });

  const uniforms = useMemo(
    () => ({
      texture1: { value: textures[prevIndex] },
      texture2: { value: textures[targetIndex] },
      progress: { value: 0 },
      uScale1: { value: scale1 },
      uScale2: { value: scale2 },
      uTime: { value: 0 }
    }),
    [textures, prevIndex, targetIndex, scale1, scale2]
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

export function LiquidTransitionImage({ images, currentIndex, className }: { images: string[], currentIndex: number, className?: string }) {
  return (
    <div className={className}>
      <Canvas 
        frameloop="demand"
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", antialias: false, alpha: true }}
      >
        <Suspense fallback={null}>
          <mesh>
            <planeGeometry args={[2, 2]} />
            <TransitionMaterial images={images} currentIndex={currentIndex} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}

