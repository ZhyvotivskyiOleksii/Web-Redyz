
"use client";

import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Loader2, User, ArrowRight, Smile, Upload, Clock4, ChevronDown, ArrowLeft, Paperclip, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useParams } from 'next/navigation';
import { translations } from '@/lib/translations';
import { generateSuggestion } from '@/app/actions';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { FormattedMessage } from './shared/formatted-message';
import { format } from 'date-fns';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type View = 'closed' | 'menu' | 'chat';

const WebImpulsChatLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M25 65 Q40 30 50 50 T75 35" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M28 70 Q40 40 50 55 T72 40" stroke="hsl(var(--card-foreground))" strokeWidth="8.5" fill="none" strokeLinecap="round" />
    <path d="M25 65 Q40 30 50 50 T75 35" stroke="hsl(var(--primary))" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const BotIcon = (props: React.ComponentProps<typeof Image>) => (
    <Image 
        src="/img-chat/ai-icon.svg" 
        alt="AI Icon" 
        width={24} 
        height={24}
        {...props} 
        className={cn("h-6 w-6", props.className)}
    />
);


const WidgetFooter = () => (
  <div className="w-full flex items-center justify-center text-xs text-muted-foreground/80 pt-2">
    Powered by 
    <a href="#" className="flex items-center gap-1.5 font-semibold text-foreground/80 ml-1.5 hover:text-primary transition-colors">
      <WebImpulsChatLogo className="h-6 w-6" />
      WebImpuls
    </a>
  </div>
);

const MenuContent = forwardRef<HTMLDivElement, { onNavigate: (view: View) => void, onClose: () => void }>(({ onNavigate, onClose }, ref) => {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const t = (translations as any)[locale] || translations.ua;

  const contactItems = [
    { icon: '/img-chat/telegram.svg', title: 'Telegram', href: "https://t.me/oleksiy_zhyvotivskyi" },
    { icon: '/img-chat/viber.svg', title: 'Viber', href: "viber://chat?number=%2B48512686628" },
    { icon: '/img-chat/massanger.svg', title: 'Messenger', href: "https://m.me/61559794323482" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="chat-widget-card-menu"
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="w-full h-full flex flex-col shadow-2xl border bg-card/80 backdrop-blur-lg overflow-hidden sm:rounded-xl">
        <div className="menu-header p-5">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-xl text-white">{t.chatMenuTitle}</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
              <ChevronDown className="h-6 w-6 text-white" />
            </button>
          </div>
          <p className="text-sm text-white/80">{t.chatMenuDesc}</p>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <div className="flex items-center gap-1.5 text-white/90">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online
            </div>
            <span className="text-white/50">•</span>
            <div className="flex items-center gap-1 text-white/90">
              <Clock4 className="h-3 w-3" />
              {t.chatWorkingHours}
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3 mt-[-10px] bg-card rounded-t-xl">
          <p className="text-sm font-semibold text-foreground px-1">{t.chatMessengerTitle}</p>
          <div className="grid grid-cols-3 gap-3">
            {contactItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex flex-col items-center gap-2"
                >
                  <Image src={item.icon} alt={item.title} width={32} height={32} className="h-8 w-8" />
                  <p className="font-semibold text-sm">{item.title}</p>
                </a>
              )
            )}
          </div>

          <div className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('chat')}>
            <div className="p-2 bg-background rounded-md">
              <BotIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t.chatMenuAiTitle}</p>
              <p className="text-xs text-muted-foreground">{t.chatMenuAiDesc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <Button variant="link" asChild className="text-sm">
            <Link href={`/${locale}/pricing`}>{t.chatMenuPricingTitle}</Link>
          </Button>
        </div>
        <CardFooter className="p-4 pt-0 border-t mt-auto bg-card">
          <WidgetFooter />
        </CardFooter>
      </Card>
    </motion.div>
  );
});
MenuContent.displayName = 'MenuContent';

const isEmojiOnly = (s: string) => {
  const trimmed = s.trim();
  if (!trimmed) return false;
  const cleaned = trimmed.replace(/(\uFE0F|\u200D|\u{1F3FB}|\u{1F3FC}|\u{1F3FD}|\u{1F3FE}|\u{1F3FF})+/gu, '');
  if (/[0-9A-Za-z\u0400-\u04FF]/u.test(cleaned)) return false;
  return Array.from(cleaned).length <= 5;
};

const ChatContent = forwardRef<HTMLDivElement, { onNavigate: (view: View) => void, onClose: () => void }>(({ onNavigate, onClose }, ref) => {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale as string;
  const t = (translations as any)[locale] || translations.ua;

  const [messages, setMessages] = useState<ChatMessage[]>([
      {
        role: 'assistant',
        content: "Привіт! 👋 Я ваш AI-помічник. Чим можу допомогти сьогодні?",
        timestamp: new Date().toISOString(),
      },
    ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 60);
      }
    }
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [messages, isLoading]);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const maxHeight = 96;
    if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    resizeTextarea();
  };

  const handleFormSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const result = await generateSuggestion({
        query: input,
        chatHistory: newMessages.map(m => ({ role: m.role, content: m.content })),
      });

      setIsLoading(false);

      if (result.success && result.data?.response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage = result.error || "AI returned an empty or invalid response.";
         toast({
          variant: "destructive",
          title: t.errorTitle,
          description: errorMessage,
        });
        const errorAssistantMessage: ChatMessage = {
          role: 'assistant',
          content: `${t.errorTitle}: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorAssistantMessage]);
      }
    } catch (error) {
       setIsLoading(false);
       console.error("Error submitting message:", error);
       const errorMessage = error instanceof Error ? error.message : t.errorTitle;
       
       toast({
         variant: "destructive",
         title: t.errorTitle,
         description: errorMessage,
       });
       const errorAssistantMessage: ChatMessage = {
         role: 'assistant',
         content: `${t.errorTitle}: ${errorMessage}`,
         timestamp: new Date().toISOString(),
       };
       setMessages(prev => [...prev, errorAssistantMessage]);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const topEmojis = ["👍","❤️","😂","🙏","😊","🎉","🤔","😢","😍","👏","🔥","🚀","💯","✅","😭","✨","🤷‍♂️","🤯","😴","👋","😎","💪","🥳","💔","😏"];

  const onEmojiClick = (emoji: string) => {
    setInput(prev => (prev ?? '') + emoji);
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      resizeTextarea();
      textareaRef.current?.focus();
    });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="chat-widget-card"
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="w-full h-full flex flex-col shadow-lg border bg-card/80 backdrop-blur-lg overflow-hidden sm:rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => onNavigate('menu')} className="h-8 w-8 text-primary-foreground hover:bg-primary/80">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <BotIcon className="h-6 w-6" />
            <h3 className="font-semibold">AI Web Impuls</h3>
          </div>
           <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-primary-foreground hover:bg-primary/80">
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-background/50 flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
            <div className="space-y-4 p-4">
              {messages.map((message, index) => {
                const emojiOnly = isEmojiOnly(message.content);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn('flex flex-col gap-1', message.role === 'user' ? 'items-end' : 'items-start')}
                  >
                    <div className={cn('flex items-start gap-3 w-full', message.role === 'user' && 'justify-end')}>
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8 border bg-primary/20 p-1.5 flex items-center justify-center">
                              <BotIcon className="h-full w-full" />
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg text-sm',
                            emojiOnly
                              ? 'bg-transparent p-1 text-4xl leading-none'
                              : (message.role === 'assistant'
                                ? 'bg-muted p-3'
                                : 'bg-primary text-primary-foreground p-3')
                          )}
                        >
                          {message.role === 'assistant' ? (
                            <FormattedMessage text={message.content} />
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8 border">
                            <AvatarFallback>
                              <User className="h-5 w-5"/>
                            </AvatarFallback>
                          </Avatar>
                        )}
                    </div>
                     <div className={cn("text-xs text-muted-foreground", message.role === 'user' ? 'pr-12' : 'pl-12')}>
                        {format(new Date(message.timestamp), 'HH:mm')}
                     </div>
                  </motion.div>
                );
              })}
              {isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3">
                   <Avatar className="h-8 w-8 border bg-primary/20 p-1.5 flex items-center justify-center">
                       <BotIcon className="h-full w-full" />
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 flex flex-col gap-2 border-t">
          <div className="relative w-full">
            <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="flex w-full items-start gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={"Задайте ваше питання..."}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none overflow-y-hidden max-h-24 pr-12"
                rows={1}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className='bg-primary/20 hover:bg-primary/30 shrink-0 self-end'>
                <Send className="h-5 w-5 text-primary" />
              </Button>
            </form>
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1">
               <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" disabled={isLoading} className={cn("hover:bg-muted/80", emojiOpen && "bg-muted")}>
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="w-full p-2 bg-popover border rounded-lg shadow-xl mb-2"
                >
                  <div className="grid grid-cols-5 gap-2">
                    {topEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => onEmojiClick(emoji)}
                        className="text-2xl rounded-md p-1 hover:bg-muted transition-colors aspect-square flex items-center justify-center"
                        aria-label={`emoji ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
               <Button type="button" variant="ghost" size="icon" disabled={true} className="hover:bg-muted/80 cursor-not-allowed">
                  <Upload className="h-5 w-5 text-muted-foreground/50" />
               </Button>
            </div>
          </div>
          <div className="w-full">
            <WidgetFooter />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});
ChatContent.displayName = 'ChatContent';

export function ChatWidget() {
  const [view, setView] = useState<View>('closed');

  const openWidget = () => {
    setView('menu');
  };

  const closeWidget = () => {
    setView('closed');
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && window.innerWidth >= 640) {
          closeWidget();
      }
  }

  const shouldRenderContent = view !== 'closed';

  return (
    <>
      {shouldRenderContent && (
        <div className="chat-widget-container" onClick={handleContainerClick}>
          <AnimatePresence>
            {view === 'menu' && <MenuContent onNavigate={setView} onClose={closeWidget} />}
            {view === 'chat' && <ChatContent onNavigate={setView} onClose={closeWidget} />}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {view === 'closed' && (
          <motion.button
            onClick={openWidget}
            className="fixed bottom-5 right-5 z-50 h-16 w-16 rounded-full bg-primary button-glow flex items-center justify-center text-primary-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open Chat"
          >
            <MessageSquare className="h-8 w-8" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
