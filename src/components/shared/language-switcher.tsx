
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { code: 'ua', label: 'UA', Flag: UkraineFlagIcon },
  { code: 'pl', label: 'PL', Flag: PolandFlagIcon },
  { code: 'en', label: 'EN', Flag: UKFlagIcon },
  { code: 'ru', label: 'RU', Flag: RussianFlagIcon },
];

export function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLocale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const currentLanguage = languages.find(l => l.code === currentLocale) || languages[0];

  const getLocalizedPath = (langCode: string) => {
    if (!pathname) return `/${langCode}`;
    const segments = pathname.split('/');
    segments[1] = langCode;
    return segments.join('/');
  };
  
  if (!currentLanguage) {
    return null;
  }

  const { Flag, label } = currentLanguage;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-sm font-medium text-white pr-3 hover:bg-primary/20 hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='p-0.5 bg-black/10 rounded-sm'><Flag className="h-4 w-6"/></div>
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-background/80 backdrop-blur-sm ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {languages.map(({ code, label, Flag }) => (
              <Link
                key={code}
                href={getLocalizedPath(code)}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-primary/20"
                role="menuitem"
              >
                <div className='p-0.5 bg-black/10 rounded-sm'><Flag className="h-4 w-6" /></div>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

    