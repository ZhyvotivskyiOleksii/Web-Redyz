
'use client';

import { Button } from '@/components/ui/button';
import { translations } from '@/lib/translations';
import { useParams } from 'next/navigation';
import { MoveRight, Clock, ShieldCheck, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { HeroGraphics } from '../shared/hero-graphics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { OrderForm } from '../shared/order-form';
import { TypingAnimation } from '../shared/typing-animation';
import Image from 'next/image';
import { PartnersMarquee } from './partners-marquee';


export function HeroSection() {
  const params = useParams();
  const locale = Array.isArray((params as any).locale) ? (params as any).locale[0] : (params as any).locale;
  const t = (translations as any)[locale] || translations.ua;

  const reduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { when: 'beforeChildren', staggerChildren: reduceMotion ? 0 : 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  return (
    <section
      className="
        relative w-full overflow-hidden 
        bg-background flex flex-col items-start min-h-screen-minus-header pt-[var(--header-height)]
      "
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
      >
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] opacity-70" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 left-1/2 -z-10 h-[200%] w-full -translate-x-1/2 [mask-image:radial-gradient(50%_50%,transparent_40%,#000)]"
      >
        <div className="absolute inset-0 z-10 animate-hero-bg-spin [background-image:conic-gradient(from_230.29deg_at_51.63%_52.16%,#000000_0deg,transparent_67.5deg,transparent_360deg)]" />
        <div className="absolute inset-0 z-0 bg-primary/10" />
      </div>

      {/* Left column */}
      <div
        className="
          container mx-auto grid max-w-7xl grid-cols-1 flex-grow
          gap-4 px-4 sm:px-6 md:grid-cols-1 lg:grid-cols-2 lg:items-center md:gap-8 lg:gap-12
        "
      >
        <motion.div
          className="
            flex flex-col items-center justify-center space-y-5 text-center
            md:text-center lg:text-left md:items-center lg:items-start pt-12 pb-12 lg:pt-16
          "
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="
              flex flex-col font-extrabold leading-none
              tracking-tight text-foreground items-center md:items-center lg:items-start
            "
          >
            <span className="text-[clamp(3.5rem,10vw,8rem)]">STUDIO</span>
            <div className="flex justify-center md:justify-center lg:justify-start w-full">
              <span className="inline-flex items-baseline gap-x-3 gap-y-2 text-[clamp(2.5rem,7vw,5rem)]">
                <span className="text-primary">WEB</span>
                <TypingAnimation />
              </span>
            </div>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="
              max-w-[60ch] text-base text-foreground/80
              sm:text-lg
            "
          >
            {t.heroDescription1}
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="w-full pt-2 hidden lg:flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground/80">
              <Clock className="h-4 w-4 text-primary" />
              <span>24h cost estimate</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground/80">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Contract & warranty</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground/80">
              <Star className="h-4 w-4 text-primary" />
              <span>5.0 client rating</span>
            </div>
          </motion.div>

          {/* CTA-ряд: основна + вторинна */}
          <motion.div
            variants={itemVariants}
            className="mt-2 flex w-full flex-col items-center gap-4 sm:flex-row md:justify-center lg:justify-start md:flex-row lg:flex-row"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="
                    button-glow text-base sm:text-lg
                    px-6 py-5
                    focus-visible:ring-2 focus-visible:ring-primary/60
                  "
                >
                  {t.heroButton ?? 'Start a project'}
                  <MoveRight className="ml-2 h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>{t.heroOrderTitle ?? 'Request a proposal'}</DialogTitle>
                  <DialogDescription>
                    {t.heroOrderDesc ?? 'Fill out the form and we will contact you shortly.'}
                  </DialogDescription>
                </DialogHeader>
                <OrderForm />
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <Image className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src="https://picsum.photos/32/32?random=1" alt="Client 1" width={32} height={32} priority />
                <Image className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src="https://picsum.photos/32/32?random=2" alt="Client 2" width={32} height={32} priority />
                <Image className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src="https://picsum.photos/32/32?random=3" alt="Client 3" width={32} height={32} priority />
              </div>
              <div className="text-sm font-medium text-foreground">
                <p className="font-semibold">1000+</p>
                <p className="text-xs text-foreground/70">{t.heroSatisfiedClients}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right column */}
        <motion.div
          className="relative w-full max-w-full px-2 sm:px-4 mx-auto md:mx-0 h-64 sm:h-80 md:h-96 lg:h-auto lg:max-w-4xl"
          variants={itemVariants}
        >
          <HeroGraphics />
        </motion.div>
      </div>
      <PartnersMarquee />
    </section>
  );
}
