
'use client';

import { motion } from 'framer-motion';
import { Target, Building2, ShoppingCart, Zap, Paintbrush, LifeBuoy, Check, Clock, Code, DollarSign, PlusCircle, Star, ArrowRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WebImpulsHeader } from '@/components/layout/web-impuls-header';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Theme = 'dark' | 'light' | 'system';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      return storedTheme;
    }
  }
  return 'dark'; // Set dark theme as default
};


export default function PricingPage() {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const t = (translations as any)[locale] || translations.ua;

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      let effectiveTheme: 'dark' | 'light';
      if (newTheme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effectiveTheme = newTheme;
      }
      root.classList.add(effectiveTheme);
      root.dataset.theme = effectiveTheme;
    }
  };

    useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === 'system') {
        const newColorScheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newColorScheme);
        document.documentElement.dataset.theme = newColorScheme;
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    toggleTheme(theme);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 40,
        damping: 15,
      },
    },
  };

  const services = [
    {
      icon: Target,
      title: t.serviceLandingTitle,
      subtitle: t.serviceLandingSubtitle,
      price: t.serviceLandingPrice,
      priceNote: t.serviceLandingPriceNote,
      timeline: t.serviceLandingTimeline,
      tech: ['Next.js 15', 'React 19', 'Tailwind CSS', 'Framer Motion', 'TypeScript', 'Vercel'],
      features: [t.serviceLandingFeature1, t.serviceLandingFeature2, t.serviceLandingFeature3, t.serviceLandingFeature4, t.serviceLandingFeature5, t.serviceLandingFeature6],
      buttonText: t.serviceLandingButton,
    },
    {
      icon: Building2,
      title: t.serviceCorporateTitle,
      subtitle: t.serviceCorporateSubtitle,
      price: t.serviceCorporatePrice,
      priceNote: t.serviceCorporatePriceNote,
      timeline: t.serviceCorporateTimeline,
      tech: ['Next.js 15', 'React 19', 'Prisma ORM', 'PostgreSQL', 'Shadcn/ui', 'Clerk Auth'],
      features: [t.serviceCorporateFeature1, t.serviceCorporateFeature2, t.serviceCorporateFeature3, t.serviceCorporateFeature4, t.serviceCorporateFeature5, t.serviceCorporateFeature6],
      buttonText: t.serviceCorporateButton,
      featured: true,
    },
    {
      icon: ShoppingCart,
      title: t.serviceECommerceTitle,
      subtitle: t.serviceECommerceSubtitle,
      price: t.serviceECommercePrice,
      priceNote: t.serviceECommercePriceNote,
      timeline: t.serviceECommerceTimeline,
      tech: ['Next.js Commerce', 'Shopify Hydrogen', 'Stripe', 'Supabase', 'Zustand', 'React Query'],
      features: [t.serviceECommerceFeature1, t.serviceECommerceFeature2, t.serviceECommerceFeature3, t.serviceECommerceFeature4, t.serviceECommerceFeature5, t.serviceECommerceFeature6],
      buttonText: t.serviceECommerceButton,
    },
    {
      icon: Zap,
      title: t.serviceWebAppTitle,
      subtitle: t.serviceWebAppSubtitle,
      price: t.serviceWebAppPrice,
      priceNote: t.serviceWebAppPriceNote,
      timeline: t.serviceWebAppTimeline,
      tech: ['Next.js 15', 'React 19', 'tRPC', 'Prisma', 'PostgreSQL', 'Redis'],
      features: [t.serviceWebAppFeature1, t.serviceWebAppFeature2, t.serviceWebAppFeature3, t.serviceWebAppFeature4, t.serviceWebAppFeature5, t.serviceWebAppFeature6],
      buttonText: t.serviceWebAppButton,
    },
     {
      icon: Paintbrush,
      title: t.serviceRedesignTitle,
      subtitle: t.serviceRedesignSubtitle,
      price: t.serviceRedesignPrice,
      priceNote: t.serviceRedesignPriceNote,
      timeline: t.serviceRedesignTimeline,
      tech: ['Figma to Code', 'Tailwind CSS', 'Framer Motion', 'Next.js', 'Lighthouse'],
      features: [t.serviceRedesignFeature1, t.serviceRedesignFeature2, t.serviceRedesignFeature3, t.serviceRedesignFeature4, t.serviceRedesignFeature5, t.serviceRedesignFeature6],
      buttonText: t.serviceRedesignButton,
    },
    {
      icon: LifeBuoy,
      title: t.serviceSupportTitle,
      subtitle: t.serviceSupportSubtitle,
      price: t.serviceSupportPrice,
      priceNote: t.serviceSupportPriceNote,
      timeline: t.serviceSupportTimeline,
      tech: ['Vercel Analytics', 'Sentry', 'Uptime Robot', 'Google Analytics', 'Lighthouse CI'],
      features: [t.serviceSupportFeature1, t.serviceSupportFeature2, t.serviceSupportFeature3, t.serviceSupportFeature4, t.serviceSupportFeature5, t.serviceSupportFeature6],
      buttonText: t.serviceSupportButton,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <WebImpulsHeader theme={theme} toggleTheme={toggleTheme} />
      <main className="w-full bg-transparent py-20 md:py-32 flex-1">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-12"
          >
            <motion.h2 variants={cardVariants} className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
              {t.pricingPageTitle}
            </motion.h2>
            <motion.p variants={cardVariants} className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
              {t.servicesSectionDescription}
            </motion.p>
          </motion.div>
          <motion.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              onscreen: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              const isFeatured = Boolean(service.featured);

              return (
                <motion.div
                  variants={cardVariants}
                  key={index}
                  className="flex"
                >
                  <Card 
                    className={`flex flex-col h-full bg-card/80 backdrop-blur-2xl border-border/20 shadow-2xl w-full transition-all duration-300 relative overflow-hidden group p-2 ${isFeatured ? 'ring-2 ring-primary/50' : 'hover:transform hover:-translate-y-2'}`}
                  >
                    {isFeatured && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                          <Star className="h-3.5 w-3.5" />
                          {t.mostPopular}
                        </div>
                      </div>
                    )}

                    <CardHeader className="flex-row items-center p-4 pb-2">
                      <div className="p-2 bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground rounded-lg mr-4">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">{service.title}</CardTitle>
                        <CardDescription className="text-xs">{service.subtitle}</CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-grow p-4 pt-2">
                      <div className='my-2 text-center'>
                        <p className={`font-extrabold text-primary ${isFeatured ? 'text-3xl' : 'text-2xl'}`}>{service.price}</p>
                        <p className='text-xs text-muted-foreground mt-1'>{service.priceNote}</p>
                      </div>

                      <div className="text-center bg-muted/50 rounded-lg p-1.5 mb-3">
                        <p className="font-semibold text-xs flex items-center justify-center gap-2"><Clock className="h-4 w-4" /> {service.timeline}</p>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Code className="h-4 w-4"/> {t.techStackTitle}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {service.tech.map((tech, i) => (
                            <span key={i} className="text-xs font-medium bg-muted py-0.5 px-2 rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3 flex-grow">
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Check className="h-4 w-4"/> {t.featuresTitle}</h4>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {service.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0 mt-auto">
                      <Button asChild size="default" className={`w-full ${isFeatured ? 'button-glow' : ''}`}>
                        <Link href={`/${locale}/order`}>{service.buttonText}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
