
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactLogo } from './react-logo';

const CodeBlock = ({ className, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div
    className={`absolute rounded-lg bg-black/50 p-4 shadow-2xl shadow-primary/10 ring-1 ring-white/10 backdrop-blur-sm ${className}`}
    {...props}
  >
    <div className="flex gap-1.5 pb-3">
      <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
      <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
    </div>
    <div className="space-y-1.5">
      <div className="h-2 w-full rounded-full bg-white/10"></div>
      <div className="h-2 w-10/12 rounded-full bg-white/10"></div>
      <div className="h-2 w-full rounded-full bg-white/10"></div>
      <div className="h-2 w-1/2 rounded-full bg-white/10"></div>
    </div>
  </motion.div>
);

export function HeroGraphics() {
  const reduceMotion = useReducedMotion();

  const animationVariants = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="relative h-full w-full" style={{ perspective: '1000px' }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-primary/80"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 0.2, duration: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 15,
            ease: 'linear',
          }}
        >
          <ReactLogo className="h-auto w-full max-w-64 lg:max-w-sm opacity-50" />
        </motion.div>
      </motion.div>

      <CodeBlock
        className="left-[5%] top-[15%] w-2/5 z-10"
        variants={animationVariants}
        initial="initial"
        animate="animate"
        transition={{ type: 'spring', delay: 0.4 }}
      />
      <CodeBlock
        className="bottom-[10%] right-[10%] w-1/2"
        variants={animationVariants}
        initial="initial"
        animate="animate"
        transition={{ type: 'spring', delay: 0.6 }}
      />

       <motion.div
         className="absolute top-[20%] right-[5%] w-1/3 z-20"
         variants={animationVariants}
         initial="initial"
         animate="animate"
         transition={{ type: 'spring', delay: 0.8 }}
      >
        <div className="rounded-lg bg-black/50 p-4 shadow-2xl shadow-primary/10 ring-1 ring-white/10 backdrop-blur-sm">
           <p className="text-center text-xs font-semibold text-white">Component.tsx</p>
           <div className="mt-3 flex items-center justify-around">
             <div className="h-8 w-8 rounded-full bg-primary/30"></div>
             <div className="h-4 w-12 rounded-full bg-accent/30"></div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
