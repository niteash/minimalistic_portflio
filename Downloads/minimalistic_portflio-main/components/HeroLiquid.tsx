'use client';
import {useEffect,useRef} from 'react';
const vertex=`attribute vec2 position;varying vec2 vUv;void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 vUv;uniform vec2 uResolution;uniform vec2 uMouse;uniform vec2 uVelocity;uniform float uTime;
float surface(vec2 p){
 vec2 m=(uMouse-.5)*vec2(uResolution.x/uResolution.y,1.0)*2.0;
 vec2 q=p-m*.32;
 float a=sin(q.x*1.85+q.y*.9+sin(q.y*1.6-uTime*.13)*1.2+uTime*.1);
 float b=sin(q.y*2.7-q.x*.65+sin(q.x*1.2+uTime*.09)*.85);
 vec2 d=p-m;float wake=exp(-dot(d,d)*1.8);
 return a*.38+b*.21+wake*.25+sin(length(d)*4.-uTime*.8)*wake*min(length(uVelocity)*.8,.08);
}
void main(){
 vec2 p=(vUv-.5)*vec2(uResolution.x/uResolution.y,1.)*2.;
 float h=surface(p);float e=.004;
 vec2 g=vec2(surface(p+vec2(e,0.))-surface(p-vec2(e,0.)),surface(p+vec2(0.,e))-surface(p-vec2(0.,e)))/(2.*e);
 vec3 n=normalize(vec3(-g*1.25,1.));vec3 light=normalize(vec3(-.65,.75,1.4));
 float diffuse=max(dot(n,light),0.);float spec=pow(max(dot(reflect(-light,n),vec3(0.,0.,1.)),0.),24.);
 float fold=smoothstep(-.1,.55,h);vec3 base=vec3(.955,.955,.965);vec3 pearl=vec3(1.,1.,1.);
 vec3 color=mix(base,pearl,fold*.85);color+=(diffuse-.78)*.12+spec*.12;
 float ridge=pow(1.-abs(sin(h*3.1)),15.)*.022;color+=ridge;
 gl_FragColor=vec4(clamp(color,0.,1.),1.);
}`;
export default function HeroLiquid({paused}:{paused:boolean}){
 const host=useRef<HTMLDivElement>(null);const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=host.current,view=canvas.current;if(!el||!view)return;const hero=el.closest('section');if(!hero)return;
  let visible=true,frame=0,time=0,last=0,gl:WebGLRenderingContext|null=null,program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null;const shaders:WebGLShader[]=[];
  const target={x:.3,y:.55},mouse={x:.3,y:.55},velocity={x:0,y:0};
  let resolution:WebGLUniformLocation|null=null,mouseUniform:WebGLUniformLocation|null=null,timeUniform:WebGLUniformLocation|null=null,velocityUniform:WebGLUniformLocation|null=null;
  try{
   gl=view.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
   if(gl){const ctx=gl;const compile=(type:number,source:string)=>{const s=ctx.createShader(type);if(!s)throw Error('Shader unavailable');shaders.push(s);ctx.shaderSource(s,source);ctx.compileShader(s);if(!ctx.getShaderParameter(s,ctx.COMPILE_STATUS))throw Error('Shader compilation failed');return s};
    program=ctx.createProgram();if(!program)throw Error('Program unavailable');ctx.attachShader(program,compile(ctx.VERTEX_SHADER,vertex));ctx.attachShader(program,compile(ctx.FRAGMENT_SHADER,fragment));ctx.linkProgram(program);if(!ctx.getProgramParameter(program,ctx.LINK_STATUS))throw Error('Program linking failed');ctx.useProgram(program);buffer=ctx.createBuffer();ctx.bindBuffer(ctx.ARRAY_BUFFER,buffer);ctx.bufferData(ctx.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),ctx.STATIC_DRAW);const pos=ctx.getAttribLocation(program,'position');ctx.enableVertexAttribArray(pos);ctx.vertexAttribPointer(pos,2,ctx.FLOAT,false,0,0);resolution=ctx.getUniformLocation(program,'uResolution');mouseUniform=ctx.getUniformLocation(program,'uMouse');timeUniform=ctx.getUniformLocation(program,'uTime');velocityUniform=ctx.getUniformLocation(program,'uVelocity');el.dataset.renderer='webgl';
   }
  }catch{el.dataset.renderer='fallback';gl=null}
  const draw=()=>{el.style.setProperty('--liquid-x',((mouse.x-.5)*90)+'px');el.style.setProperty('--liquid-y',((.5-mouse.y)*70)+'px');if(gl&&program){gl.uniform2f(resolution,view.width,view.height);gl.uniform2f(mouseUniform,mouse.x,mouse.y);gl.uniform2f(velocityUniform,velocity.x,velocity.y);gl.uniform1f(timeUniform,time);gl.drawArrays(gl.TRIANGLES,0,6)}};
  const resize=()=>{const r=el.getBoundingClientRect();const dpr=Math.min(devicePixelRatio,1.3);view.width=Math.max(1,Math.round(r.width*dpr*.75));view.height=Math.max(1,Math.round(r.height*dpr*.75));gl?.viewport(0,0,view.width,view.height);draw()};
  const move=(event:PointerEvent)=>{if(event.pointerType!=='mouse'||paused)return;const r=hero.getBoundingClientRect();target.x=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));target.y=1-Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))};
  const leave=()=>{target.x=.3;target.y=.55};
  const tick=(now:number)=>{frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden)return;time+=dt;const easing=1-Math.exp(-dt*4.5);velocity.x=(target.x-mouse.x)*4.5;velocity.y=(target.y-mouse.y)*4.5;mouse.x+=(target.x-mouse.x)*easing;mouse.y+=(target.y-mouse.y)*easing;draw()};
  const ro=new ResizeObserver(resize);ro.observe(el);const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;el.dataset.active=String(visible&&!document.hidden)});io.observe(el);const visibility=()=>{el.dataset.active=String(visible&&!document.hidden)};document.addEventListener('visibilitychange',visibility);hero.addEventListener('pointermove',move);hero.addEventListener('pointerleave',leave);
  const lost=(event:Event)=>{event.preventDefault();el.dataset.renderer='fallback';gl=null};view.addEventListener('webglcontextlost',lost);
  resize();if(!paused)frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();document.removeEventListener('visibilitychange',visibility);hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);view.removeEventListener('webglcontextlost',lost);if(gl){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(s=>gl!.deleteShader(s))}delete el.dataset.renderer;};
 },[paused]);
 return <div className="hero-liquid silk-liquid" data-paused={paused} data-active="true" ref={host} aria-hidden="true"><div className="liquid-silk-fallback"><i/><i/><i/></div><canvas ref={canvas}/></div>
}
