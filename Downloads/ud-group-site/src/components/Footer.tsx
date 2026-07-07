import { ArrowRight, Camera, Briefcase, AtSign } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

// lucide-react dropped brand/logo icons (Twitter, Linkedin, Instagram, etc.)
// a while back — they're not in the installed version at all, not just
// renamed. Using generic equivalents that map to the same idea
// (photo-sharing / professional network / short-form social) until you
// either pin an icon set that still ships brand marks or drop in your own
// SVGs for the exact platforms you're actually on.
const socialIcons = [AtSign, Briefcase, Camera];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="relative z-10 bg-white dark:bg-ink-deep text-gold py-24 px-8 md:px-12 border-t border-gold/20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
        
        {/* Brand & Newsletter */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-serif tracking-widest mb-6 uppercase">UD Group</h2>
            <p className="text-sm tracking-widest leading-relaxed opacity-80 mb-10 max-w-sm">
              ELEVATING STANDARDS, CRAFTING THE FUTURE OF MODERN BUSINESS AND LIFESTYLE.
            </p>
            
            <form className="max-w-sm flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <h3 className="text-xs font-mono tracking-[0.2em] mb-2 opacity-60">GET IN TOUCH</h3>
              <input 
                type="text" 
                placeholder="NAME" 
                className="w-full bg-transparent border-b border-gold/30 py-2 text-xs tracking-[0.2em] placeholder-gold/50 focus:outline-none focus:border-gold transition-colors"
                required
              />
              <input 
                type="email" 
                placeholder="EMAIL" 
                className="w-full bg-transparent border-b border-gold/30 py-2 text-xs tracking-[0.2em] placeholder-gold/50 focus:outline-none focus:border-gold transition-colors"
                required
              />
              <input 
                type="tel" 
                placeholder="MOBILE" 
                className="w-full bg-transparent border-b border-gold/30 py-2 text-xs tracking-[0.2em] placeholder-gold/50 focus:outline-none focus:border-gold transition-colors"
                required
              />
              <textarea 
                placeholder="QUERY" 
                rows={3}
                className="w-full bg-transparent border-b border-gold/30 py-2 text-xs tracking-[0.2em] placeholder-gold/50 focus:outline-none focus:border-gold transition-colors resize-none"
                required
              ></textarea>
              <MagneticButton strength={0.3} as="button" className="mt-2 flex items-center justify-between w-full border border-gold/30 py-3 px-4 text-xs tracking-[0.2em] hover:bg-gold/10 transition-colors group">
                <span>SEND MESSAGE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="md:col-span-4 flex flex-col md:pl-12">
          <h3 className="text-xs font-mono tracking-[0.2em] mb-8 opacity-60">NAVIGATION</h3>
          <ul className="space-y-4">
            {['COMPANY', 'BUSINESS', 'STRENGTHS', 'RECRUITMENT', 'ABOUT', 'CONTACT'].map((link) => (
              <li key={link}>
                <a href={`#${link.toLowerCase()}`} className="text-sm tracking-[0.2em] hover:opacity-60 transition-opacity relative group inline-block">
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Socials & Legal */}
        <div className="md:col-span-3 flex flex-col justify-between md:items-end">
          <div className="w-full md:text-right">
            <h3 className="text-xs font-mono tracking-[0.2em] mb-8 opacity-60">CONNECT</h3>
            <div className="flex md:justify-end gap-6">
              {socialIcons.map((Icon, idx) => (
                <a key={idx} href="#" className="hover:opacity-60 transition-opacity transform hover:-translate-y-1 duration-300">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="mt-16 md:mt-0 text-left md:text-right">
            <div className="flex flex-col gap-2 mb-6">
              <a href="#" className="text-[10px] font-mono tracking-[0.2em] hover:opacity-60 transition-opacity">PRIVACY POLICY</a>
              <a href="#" className="text-[10px] font-mono tracking-[0.2em] hover:opacity-60 transition-opacity">TERMS OF SERVICE</a>
            </div>
            <p className="font-mono text-[10px] tracking-[0.2em] opacity-60">
              © {currentYear} UD GROUP.<br className="hidden md:block" /> ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
