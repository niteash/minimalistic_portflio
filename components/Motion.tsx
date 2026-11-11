'use client';
import {useEffect} from 'react';
export default function Motion({paused,layoutKey}:{paused:boolean;layoutKey?:string}){
 useEffect(()=>{if(paused)return;let disposed=false;let cleanup=()=>{};
 async function init(){const [{gsap},{ScrollTrigger},{default:Lenis}]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger'),import('lenis')]);if(disposed)return;gsap.registerPlugin(ScrollTrigger);
 const lenis=new Lenis({duration:1.12,smoothWheel:true,anchors:{offset:-90},prevent:node=>!!node.closest('[data-lenis-prevent]')});const update=(t:number)=>lenis.raf(t*1000);gsap.ticker.add(update);lenis.on('scroll',ScrollTrigger.update);
 const media=gsap.matchMedia();
 const ctx=gsap.context(()=>{
 if(scrollY<100){gsap.from('.site-nav',{y:-12,opacity:0,duration:.8,delay:.1,ease:'power3.out',clearProps:'all'});gsap.from('.intro-copy .reveal-line',{y:32,opacity:0,stagger:.14,duration:1,ease:'power4.out',clearProps:'all'});gsap.from('.intro-copy>p,.intro-copy>.inline-link',{y:20,opacity:0,stagger:.12,duration:.8,delay:.25,ease:'power3.out',clearProps:'all'});gsap.from('.giant-name',{yPercent:105,duration:1.4,delay:.12,ease:'power4.out',clearProps:'all'});}
 media.add('(min-width:761px)',()=>{const statements=gsap.utils.toArray<HTMLElement>('.statement');const tl=gsap.timeline({scrollTrigger:{trigger:'.manifesto',start:'top top',end:'+=190%',pin:'.manifesto-stage',scrub:.8}});statements.forEach((el,i)=>{if(i>0)gsap.set(el,{opacity:0,y:40,filter:'blur(5px)'});tl.to(el,{opacity:1,y:0,filter:'blur(0px)',duration:.55}).to(el,{opacity:1,duration:.8});if(i<statements.length-1)tl.to(el,{opacity:0,y:-40,filter:'blur(5px)',duration:.4});});});
 media.add('(max-width:760px)',()=>{gsap.utils.toArray<HTMLElement>('.statement').forEach(el=>gsap.from(el,{y:20,opacity:.15,duration:.8,scrollTrigger:{trigger:el,start:'top 88%',once:true},clearProps:'all'}))});
 gsap.utils.toArray<HTMLElement>('.section-bar').forEach(el=>gsap.from(el,{y:15,opacity:0,duration:.65,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true},clearProps:'all'}));
 gsap.utils.toArray<HTMLElement>('.large-copy,.timeline-row,.review-grid blockquote,.pr,.stats>div').forEach(el=>gsap.from(el,{y:35,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 91%',once:true},clearProps:'all'}));
 gsap.from('.contact-title',{yPercent:12,opacity:.15,ease:'none',scrollTrigger:{trigger:'.contact-title',start:'top 95%',end:'top 40%',scrub:.8}});
 gsap.to('.scroll-progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.2}});
 });
 const refresh=()=>{if(!disposed)ScrollTrigger.refresh()};document.fonts?.ready.then(refresh);window.addEventListener('load',refresh);ScrollTrigger.refresh();
 const modalObserver=new MutationObserver(()=>{document.querySelector('.modal-backdrop')?lenis.stop():lenis.start()});modalObserver.observe(document.body,{childList:true});
 cleanup=()=>{window.removeEventListener('load',refresh);modalObserver.disconnect();media.revert();ctx.revert();gsap.ticker.remove(update);lenis.destroy()};
 }init().catch(()=>{});return()=>{disposed=true;cleanup()};
 },[paused]);
 useEffect(()=>{if(paused)return;let disposed=false;let cleanup=()=>{};
 async function init(){const [{gsap},{ScrollTrigger}]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger')]);if(disposed)return;gsap.registerPlugin(ScrollTrigger);
 const ctx=gsap.context(()=>{gsap.utils.toArray<HTMLElement>('.project-row').forEach((el,i)=>{gsap.from(el.querySelector('.project-info'),{y:30,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true},clearProps:'all'});gsap.from(el.querySelector('.project-image'),{clipPath:'inset(8% 0% 8% 0%)',opacity:.5,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true},clearProps:'clipPath,opacity'});gsap.fromTo(el.querySelector('.project-photo'),{yPercent:-5,scale:1.14},{yPercent:5,scale:1.14,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}})})});ScrollTrigger.refresh();cleanup=()=>{ctx.revert();ScrollTrigger.refresh()};
 }init().catch(()=>{});return()=>{disposed=true;cleanup()};
 },[paused,layoutKey]);
 return null;
}
