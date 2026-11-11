'use client';
import {useEffect,useRef} from 'react';

export default function Experience({paused}:{paused:boolean}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let disposed=false;let cleanup=()=>{};
  async function init(){
   const THREE=await import('three');if(disposed)return;
   let renderer:import('three').WebGLRenderer;
   try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{el!.dataset.fallback='true';return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));el!.appendChild(renderer.domElement);
   const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,1,.1,30);camera.position.z=8.8;
   const group=new THREE.Group();scene.add(group);group.rotation.z=-.3;
   const count=matchMedia('(max-width:600px)').matches?1400:2800;
   const coords=new Float32Array(count*3);const golden=Math.PI*(3-Math.sqrt(5));
   for(let i=0;i<count;i++){const y=1-2*i/(count-1),r=Math.sqrt(1-y*y),theta=golden*i;coords[i*3]=r*Math.cos(theta)*1.55;coords[i*3+1]=y*1.55;coords[i*3+2]=r*Math.sin(theta)*1.55;}
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(coords,3));
   const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uDpr:{value:renderer.getPixelRatio()}},vertexShader:`uniform float uTime;uniform float uDpr;varying float vAlpha;void main(){vec3 p=position;float wave=sin(p.y*5.0+uTime*.7)+sin(p.x*4.0-uTime*.45);p*=1.0+wave*.045;vec4 mv=modelViewMatrix*vec4(p,1.0);vAlpha=smoothstep(-2.0,2.0,p.z)*.65+.25;gl_PointSize=clamp(12.0/-mv.z,1.2,3.5)*uDpr;gl_Position=projectionMatrix*mv;}`,fragmentShader:`precision highp float;varying float vAlpha;void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;float a=(1.0-smoothstep(.25,.5,d))*vAlpha;gl_FragColor=vec4(.79,.95,.50,a);}`});
   group.add(new THREE.Points(geometry,material));
   const rings:import('three').BufferGeometry[]=[];const ringMaterials:import('three').LineBasicMaterial[]=[];
   const satellites:import('three').Mesh[]=[];const satelliteGeo=new THREE.SphereGeometry(.045,10,8);const satelliteMat=new THREE.MeshBasicMaterial({color:0xd3f77b});
   for(let i=0;i<3;i++){const ringGroup=new THREE.Group();ringGroup.rotation.set(.9+i*.6,i*.8,.35+i*.7);group.add(ringGroup);const points=[];for(let j=0;j<=180;j++){const a=j/180*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*(2.05+i*.13),Math.sin(a)*(2.05+i*.13),0));}const geo=new THREE.BufferGeometry().setFromPoints(points);const mat=new THREE.LineBasicMaterial({color:0xc4db9d,transparent:true,opacity:.22+i*.04});rings.push(geo);ringMaterials.push(mat);ringGroup.add(new THREE.LineLoop(geo,mat));const dot=new THREE.Mesh(satelliteGeo,satelliteMat);ringGroup.add(dot);satellites.push(dot);const angle=i*2.1;dot.position.set(Math.cos(angle)*(2.05+i*.13),Math.sin(angle)*(2.05+i*.13),0);}
   let frame=0,last=0,time=0,visible=true;const pointer=new THREE.Vector2();
   const draw=()=>{material.uniforms.uTime.value=time;group.rotation.y+=(pointer.x*.35+time*.075-group.rotation.y)*.035;group.rotation.x+=(pointer.y*.25-group.rotation.x)*.035;satellites.forEach((dot,i)=>{const a=time*(.17+i*.04)+i*2.1;dot.position.set(Math.cos(a)*(2.05+i*.13),Math.sin(a)*(2.05+i*.13),0)});renderer.render(scene,camera)};
   const resize=()=>{const r=el!.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();draw();};
   const animate=(t:number)=>{frame=requestAnimationFrame(animate);const dt=Math.min((t-last)/1000,.05);last=t;if(!visible||document.hidden)return;time+=dt;draw();};
   const move=(e:PointerEvent)=>{const r=el!.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5)};
   const leave=()=>pointer.set(0,0);
   const ro=new ResizeObserver(resize);ro.observe(el!);const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting});io.observe(el!);el!.addEventListener('pointermove',move);el!.addEventListener('pointerleave',leave);
   const lost=(event:Event)=>{event.preventDefault();el!.dataset.ready='false';cancelAnimationFrame(frame)};renderer.domElement.addEventListener('webglcontextlost',lost);
   resize();el!.dataset.ready='true';if(!paused)frame=requestAnimationFrame(animate);
   cleanup=()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();el!.removeEventListener('pointermove',move);el!.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',lost);geometry.dispose();material.dispose();rings.forEach(g=>g.dispose());ringMaterials.forEach(m=>m.dispose());satelliteGeo.dispose();satelliteMat.dispose();renderer.dispose();renderer.domElement.remove();delete el!.dataset.ready;};
  }
  init().catch(()=>{el.dataset.fallback='true'});
  return()=>{disposed=true;cleanup()};
 },[paused]);
 return <div className={'sculpture orbital-sculpture'+(paused?' orbital-paused':'')} ref={host} role="img" aria-label="A flowing particle globe surrounded by three delicate orbital rings">
  <svg className="orbital-fallback" viewBox="0 0 600 600" aria-hidden="true"><defs><radialGradient id="orbital-glow"><stop stopColor="#c4ed7a" stopOpacity=".13"/><stop offset="1" stopColor="#c4ed7a" stopOpacity="0"/></radialGradient></defs><circle cx="300" cy="300" r="225" fill="url(#orbital-glow)"/><g className="orbital-grid" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray=".2 7" strokeLinecap="round"><circle cx="300" cy="300" r="144"/>{[38,72,106,132].map(r=><ellipse key={r} cx="300" cy="300" rx={r} ry="144"/>)}{[38,72,106,132].map(r=><ellipse key={r} cx="300" cy="300" rx="144" ry={r}/>)}</g><g className="fallback-orbits" fill="none" stroke="currentColor" strokeWidth=".8"><ellipse cx="300" cy="300" rx="226" ry="80" transform="rotate(-27 300 300)"/><ellipse cx="300" cy="300" rx="226" ry="83" transform="rotate(39 300 300)"/><ellipse cx="300" cy="300" rx="226" ry="82" transform="rotate(100 300 300)"/></g><g fill="currentColor"><circle cx="101" cy="398" r="4"/><circle cx="472" cy="444" r="3"/><circle cx="327" cy="78" r="3"/></g></svg>
  <span className="orbital-label label-craft">01 — CRAFT</span><span className="orbital-label label-code">02 — CODE</span><span className="orbital-label label-community">03 — COMMUNITY</span>
 </div>
}
