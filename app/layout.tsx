import type { Metadata } from 'next';
import './globals.css';
import {LanguageProvider} from '../components/LanguageProvider';
export const metadata: Metadata = {title:'Shwe Win Aung — Fullstack Developer',description:'Fullstack developer from Myanmar. Multilingual products, thoughtful interfaces, and open source. Available worldwide.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body><LanguageProvider>{children}</LanguageProvider></body></html>}
