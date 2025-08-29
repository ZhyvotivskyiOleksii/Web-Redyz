
'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

const partnerLogos = [
  { name: 'Partner 1', src: '/prtners/Brend-1.png' },
  { name: 'Partner 2', src: '/prtners/Brend-2.png' },
  { name: 'Partner 3', src: '/prtners/Brend.png' },
  { name: 'Partner 4', src: '/prtners/Brend-4.png' },
  { name: 'Partner 5', src: '/prtners/Brend-5.png' },
  { name: 'Partner 6', src: '/prtners/Brend-6.png' },
];

const partners = [...partnerLogos, ...partnerLogos, ...partnerLogos];

export function PartnersMarquee() {
  return (
    <div
      className="relative w-full overflow-hidden bg-background/50 backdrop-blur-sm"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <div className="flex w-max animate-[scroll_40s_linear_infinite] [--animation-play-state:running] hover:[--animation-play-state:paused] gap-8 py-4">
        {partners.map((partner, index) => (
          <div key={index} className="flex items-center justify-center">
            <Image
              src={partner.src}
              alt={partner.name}
              width={120}
              height={40}
              className="h-10 w-auto object-contain dark:invert"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
