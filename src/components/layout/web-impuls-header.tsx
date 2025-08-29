
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Feather, Sun, Moon, X, Menu, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from '../shared/language-switcher';
import { ThemeSwitcher } from '../shared/theme-switcher';
import { translations } from '@/lib/translations';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { ReactLogo } from '../shared/react-logo';


const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);

const UkraineFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 900 600">
        <rect width="900" height="600" fill="#0057b7"/>
        <rect width="900" height="300" y="300" fill="#ffd700"/>
    </svg>
);

const PolandFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 1280 800">
        <rect width="1280" height="800" fill="#fff"/>
        <rect width="1280" height="400" y="400" fill="#dc143c"/>
    </svg>
);

const UKFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 1200 600">
        <rect width="1200" height="600" fill="#012169"/>
        <path d="M0,0 L1200,600 M0,600 L1200,0" stroke="#fff" strokeWidth="120"/>
        <path d="M0,0 L1200,600 M0,600 L1200,0" stroke="#C8102E" strokeWidth="80"/>
        <path d="M600,0 V600 M0,300 H1200" stroke="#fff" strokeWidth="200"/>
        <path d="M600,0 V600 M0,300 H1200" stroke="#C8102E" strokeWidth="120"/>
    </svg>
);

const RussianFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 900 600">
        <rect width="900" height="600" fill="#fff"/>
        <rect width="900" height="400" y="200" fill="#0039a6"/>
        <rect width="900" height="200" y="400" fill="#d52b1e"/>
    </svg>
);

const languages = [
  { code: 'ua', Flag: UkraineFlagIcon },
  { code: 'pl', Flag: PolandFlagIcon },
  { code: 'en', Flag: UKFlagIcon },
  { code: 'ru', Flag: RussianFlagIcon },
];

interface WebImpulsHeaderProps {
    theme: 'dark' | 'light' | 'system';
    toggleTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export function WebImpulsHeader({ theme, toggleTheme }: WebImpulsHeaderProps) {
    const params = useParams();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
    const t = (translations as any)[locale] || translations.ua;
    
    const getLocalizedPath = (langCode: string) => {
        if (!pathname) return `/${langCode}`;
        const segments = pathname.split('/');
        segments[1] = langCode;
        return segments.join('/');
    };
    
    const navLinks = [
        { href: "/", label: t.home },
        { href: "/about", label: t.about },
        { href: "/services", label: t.services },
        { href: "/portfolio", label: t.portfolio },
        { href: "/pricing", label: t.prices },
        { href: "/contact", label: t.contact },
    ];

    const navContent = (
    <TooltipProvider>
        {navLinks.map((link) => (
             <Link href={link.href.startsWith('/') ? `/${locale}${link.href}`: link.href} key={link.label} className="animated-underline text-sm font-medium text-white" prefetch={false}>
                {link.label}
             </Link>
        ))}
        <div className="h-5 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="https://www.facebook.com/profile.php?id=61559794323482&locale=ru_RU" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-1 rounded-md hover:bg-[#4a5a83]" prefetch={false}>
                        <FacebookIcon className="h-4 w-4 text-blue-400" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Facebook</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="https://www.linkedin.com/in/oleksii-zhyvotivskyi-9b9085303/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-1 rounded-md hover:bg-[#4a5a83]" prefetch={false}>
                        <LinkedinIcon className="h-4 w-4 text-blue-400" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p>LinkedIn</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="https://github.com/ZhyvotivskyiOleksii" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-1 rounded-md hover:bg-[#4a5a83]" prefetch={false}>
                        <GithubIcon className="h-4 w-4 text-gray-300" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    <p>GitHub</p>
                </TooltipContent>
            </Tooltip>
        </div>
        <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        <LanguageSwitcher />
    </TooltipProvider>
  );
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/30 dark:backdrop-blur-sm">
      <div className="flex h-[var(--header-height)] items-center justify-between">
        <div className="pl-4 sm:pl-6 lg:pl-8">
            <Link href={`/${locale}`} className="flex items-center gap-2" prefetch={false}>
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                    <defs>
                        <radialGradient id="logo-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 0.8}} />
                        <stop offset="100%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 0}} />
                        </radialGradient>
                        <filter id="blur-effect">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
                        </filter>
                    </defs>
                    <circle cx="50" cy="50" r="40" fill="url(#logo-gradient)" filter="url(#blur-effect)" />
                    <path d="M25 65 Q40 30 50 50 T75 35" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" strokeLinecap="round" />
                    <path d="M28 70 Q40 40 50 55 T72 40" stroke="#000010" strokeWidth="8.5" fill="none" strokeLinecap="round" />
                    <path d="M25 65 Q40 30 50 50 T75 35" stroke="hsl(var(--primary))" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight")}>
                <span className="text-black dark:text-white">Web</span>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Impuls</span>
            </div>
            </Link>
        </div>
        <div className="flex items-center">
            <div
                className="relative hidden py-5 pl-8 lg:flex"
                style={{
                    borderRadius: '9999px 0 0 9999px',
                    backgroundImage: 'radial-gradient(circle at 0% 50%, hsl(var(--primary) / 0.75), transparent 70%), linear-gradient(to right, hsl(var(--primary)), rgb(48, 47, 61) 40%)',
                }}
            >
                <nav className="group hidden lg:flex items-center gap-4 pr-4 sm:pr-6 lg:pr-8">
                    {navContent}
                </nav>
            </div>
            <div className="block lg:hidden pr-4 sm:pr-6 lg:pr-8">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-foreground hover:bg-primary/20">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-background w-full max-w-xs backdrop-blur-md border-l-0 dark:border-l dark:border-border p-0 flex flex-col overflow-hidden">
                        <div className="absolute inset-0 -z-10 flex items-center justify-center text-primary opacity-5">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                repeat: Infinity,
                                repeatType: 'loop',
                                duration: 25,
                                ease: 'linear',
                                }}
                            >
                                <ReactLogo className="h-auto w-full max-w-xs" />
                            </motion.div>
                        </div>
                        <SheetHeader className="p-4 flex flex-row items-center justify-between">
                           <Link href={`/${locale}`} className="flex items-center gap-2" prefetch={false} onClick={() => setIsMenuOpen(false)}>
                                <div className="relative h-12 w-12 rounded-full">
                                    <svg viewBox="0 0 100 100" className="h-full w-full">
                                        <defs>
                                            <radialGradient id="logo-gradient-mobile" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                            <stop offset="0%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 0.8}} />
                                            <stop offset="100%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 0}} />
                                            </radialGradient>
                                            <filter id="blur-effect-mobile">
                                                <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
                                            </filter>
                                        </defs>
                                        <circle cx="50" cy="50" r="40" fill="url(#logo-gradient-mobile)" filter="url(#blur-effect-mobile)" />
                                        <path d="M25 65 Q40 30 50 50 T75 35" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" strokeLinecap="round" />
                                        <path d="M28 70 Q40 40 50 55 T72 40" stroke="#000010" strokeWidth="8.5" fill="none" strokeLinecap="round" />
                                        <path d="M25 65 Q40 30 50 50 T75 35" stroke="hsl(var(--primary))" strokeWidth="5" fill="none" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className={cn("text-lg font-bold tracking-tight")}>
                                    <span className="text-foreground">Web</span>
                                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Impuls</span>
                                </div>
                            </Link>
                           <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                              <X className="h-6 w-6" />
                              <span className="sr-only">Close</span>
                           </SheetClose>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto p-6">
                             <nav className="grid items-start gap-4 text-lg font-medium">
                                {navLinks.map((link) => (
                                    <Link href={link.href.startsWith('/') ? `/${locale}${link.href}`: link.href} key={link.label} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/70 dark:text-muted-foreground hover:text-foreground hover:bg-primary/20" prefetch={false}>
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="p-4 mt-auto bg-gray-100/90 dark:bg-transparent">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <Link href="https://www.facebook.com/profile.php?id=61559794323482&locale=ru_RU" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-full bg-primary hover:bg-primary/90" prefetch={false}>
                                    <FacebookIcon className="h-5 w-5 text-white" />
                                </Link>
                                <Link href="https://www.linkedin.com/in/oleksii-zhyvotivskyi-9b9085303/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 rounded-full bg-primary hover:bg-primary/90" prefetch={false}>
                                    <LinkedinIcon className="h-5 w-5 text-white" />
                                </Link>
                                <Link href="https://github.com/ZhyvotivskyiOleksii" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 rounded-full bg-primary hover:bg-primary/90" prefetch={false}>
                                    <GithubIcon className="h-5 w-5 text-white" />
                                </Link>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {languages.map(({ code, Flag }) => (
                                      <Link
                                          key={code}
                                          href={getLocalizedPath(code)}
                                          onClick={() => setIsMenuOpen(false)}
                                          className={cn(
                                              "p-1.5 rounded-md transition-colors",
                                              locale === code ? "bg-primary/20 shadow-[0_0_8px_hsl(var(--primary))]" : ""
                                          )}
                                      >
                                          <div className='p-0.5 rounded-sm'><Flag className="h-4 w-6" /></div>
                                      </Link>
                                  ))}
                                </div>
                                <div className='flex items-center gap-1 rounded-full bg-primary/20 p-1'>
                                    <Button variant="ghost" size="icon" onClick={() => toggleTheme('light')} className={cn("h-6 w-6 rounded-full", theme === 'light' ? 'bg-primary/50' : '')}>
                                        <Sun className="h-4 w-4 text-yellow-400"/>
                                    </Button>
                                     <Button variant="ghost" size="icon" onClick={() => toggleTheme('dark')} className={cn("h-6 w-6 rounded-full", theme === 'dark' ? 'bg-primary/50' : '')}>
                                        <Moon className="h-4 w-4 text-orange-400"/>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
} 

    