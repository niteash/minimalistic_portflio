import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

const WebGLShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#ffffff'),
    uColorEnd: new THREE.Color('#e5e5e5'),
    uResolution: new THREE.Vector2(),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
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
      vec2 st = gl_FragCoord.xy / uResolution.xy;
      
      // Animate noise
      float noise = snoise(vUv * 2.0 + uTime * 0.05);
      float noise2 = snoise(vUv * 3.0 - uTime * 0.08);
      float noise3 = snoise(vUv * 1.5 + noise * 0.5 + uTime * 0.1);
      
      float pattern = snoise(vec2(noise2, noise3) * 2.0);
      pattern = smoothstep(-0.2, 0.8, pattern);
      
      vec3 color = mix(uColorStart, uColorEnd, pattern);
      
      // Subtle gradient overlay
      color += vec3(0.02, 0.02, 0.03) * (1.0 - vUv.y);
      
      // Add subtle grain
      float grain = fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
      color -= grain * 0.02;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

import { extend } from '@react-three/fiber';
extend({ WebGLShaderMaterial });

function BackgroundMesh() {
  const materialRef = useRef<any>(null);
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (materialRef.current) {
      // Reduced motion: hold the noise pattern still instead of animating
      // it forever in the background on every page.
      materialRef.current.uTime = reducedMotion ? 0 : state.clock.elapsedTime;
      materialRef.current.uResolution.set(window.innerWidth, window.innerHeight);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      {/* @ts-ignore */}
      <webGLShaderMaterial ref={materialRef} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

export function WebglBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#FFFFFF]">
      <Canvas 
        orthographic 
        camera={{ position: [0, 0, 1], zoom: 1 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", antialias: false, alpha: false }}
      >
        <BackgroundMesh />
      </Canvas>
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />
    </div>
  );
}
