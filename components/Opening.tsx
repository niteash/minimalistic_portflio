'use client';
import {useEffect} from 'react';
import {useLanguage} from './LanguageProvider';
export default function Opening({onComplete}:{onComplete:()=>void}){
 const {t}=useLanguage();
 useEffect(()=>{
  const roots=Array.from(document.querySelectorAll<HTMLElement>('.site-nav,main,.site-footer,.chat-trigger'));
  const old=roots.map(el=>el.inert);roots.forEach(el=>{el.inert=true});
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const preference=matchMedia('(prefers-reduced-motion:reduce)');
  const timer=setTimeout(onComplete,preference.matches?250:2650);
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')onComplete()};window.addEventListener('keydown',escape);
  return()=>{clearTimeout(timer);roots.forEach((el,i)=>{el.inert=old[i]});document.body.style.overflow=overflow;window.removeEventListener('keydown',escape)};
 },[onComplete]);
 return <div className="swa-opening" onAnimationEnd={e=>{if(e.target===e.currentTarget&&e.animationName==='swa-curtain')onComplete()}}>
  <div className="opening-top"><span className="micro">{t("SHWE WIN AUNG")}</span><span className="micro">{t("PORTFOLIO / 2026")}</span></div>
  <div className="opening-center" role="status" aria-label={t("Welcome to Shwe Win Aung’s portfolio")}><div className="swa-letters" aria-hidden="true"><span>{t("S")}</span><span>{t("W")}</span><span>{t("A")}</span><i>{t("®")}</i></div><div className="opening-rule"/><p>{t("CODE. PEOPLE. POSSIBILITY.")}</p></div>
  <div className="opening-bottom"><span className="micro">{t("FROM MYANMAR, TO THE WORLD.")}</span><button onClick={onComplete}>{t("Skip intro ↗")}</button></div>
 </div>
}
