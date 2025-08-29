
'use client';

import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
    theme: 'dark' | 'light' | 'system';
    toggleTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export function ThemeSwitcher({ theme, toggleTheme }: ThemeSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const themes = [
        { name: 'light', icon: Sun, className: 'text-yellow-400' },
        { name: 'dark', icon: Moon, className: 'text-orange-400' },
        { name: 'system', icon: Laptop, className: 'text-primary' },
    ] as const;

    const CurrentIcon = themes.find(t => t.name === theme)?.icon || Laptop;
    const currentIconClassName = themes.find(t => t.name === theme)?.className || 'text-primary';

    if (!mounted) {
        return  <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-primary/20 hover:bg-primary/30"
            aria-label="Toggle theme"
            disabled
        >
            <Laptop className="h-4 w-4 text-primary" />
        </Button>;
    }

    return (
        <div className="relative">
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-7 w-7 rounded-full bg-primary/20 hover:bg-primary/30"
                aria-label="Toggle theme"
            >
                <CurrentIcon className={cn("h-4 w-4", currentIconClassName)} />
            </Button>
            {isOpen && (
                 <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-background/80 backdrop-blur-sm ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {themes.map(({ name, icon: Icon, className }) => (
                            <button
                                key={name}
                                onClick={() => {
                                    toggleTheme(name);
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-primary/20 capitalize"
                                role="menuitem"
                            >
                               <Icon className={cn("h-4 w-4", className)} />
                               <span>{name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
