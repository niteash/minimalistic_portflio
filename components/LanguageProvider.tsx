'use client';
import {createContext,useCallback,useContext,useEffect,useState} from 'react';
import {translate,type Locale} from '../lib/i18n/translations';
export const languages:[Locale,string,string][]=[['en','English','EN'],['my','မြန်မာ','MY'],['ja','日本語','JA'],['th','ไทย','TH'],['de','Deutsch','DE']];
const Context=createContext<{locale:Locale;setLocale:(locale:Locale)=>void;t:(text:string)=>string}>({locale:'en',setLocale:()=>{},t:s=>s});
export function LanguageProvider({children}:{children:React.ReactNode}){
 const [locale,setLocaleState]=useState<Locale>('en');
 const setLocale=useCallback((next:Locale)=>{setLocaleState(next);try{localStorage.setItem('swa-language',next)}catch{}},[]);
 useEffect(()=>{try{const saved=localStorage.getItem('swa-language');if(languages.some(([id])=>id===saved))setLocaleState(saved as Locale)}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dataset.locale=locale;const refresh=requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));document.title=locale==='en'?'Shwe Win Aung — Fullstack Developer':`Shwe Win Aung — ${translate('Fullstack Developer',locale)}`;return()=>cancelAnimationFrame(refresh)},[locale]);
 const t=useCallback((text:string)=>translate(text,locale),[locale]);
 return <Context.Provider value={{locale,setLocale,t}}>{children}</Context.Provider>
}
export const useLanguage=()=>useContext(Context);
