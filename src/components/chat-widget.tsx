
"use client";

import { useState, useRef, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Loader2, User, ArrowRight, Smile, Upload, Clock4, ChevronDown, ArrowLeft, Paperclip, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
// Removed Popover for emojis to keep panel inside chat bounds
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useParams } from 'next/navigation';
import { translations } from '@/lib/translations';
import { generateSuggestion, getChatHistory, saveContact, getLeadStatus, insertAssistantMessage, getChatSession, getChatMeta } from '@/app/actions';
import { getSupabaseClient } from '@/lib/supabase';
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
  type?: 'text' | 'contact_form';
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

const MenuContent = forwardRef<HTMLDivElement, { onNavigate: (view: View) => void, onClose: () => void, unread?: number }>(({ onNavigate, onClose, unread = 0 }, ref) => {
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

          <div className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center gap-3 cursor-pointer relative" onClick={() => onNavigate('chat')}>
            <div className="p-2 bg-background rounded-md">
              <BotIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{t.chatMenuAiTitle}</p>
              <p className="text-xs text-muted-foreground">{t.chatMenuAiDesc}</p>
            </div>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center shadow">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
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

const ChatContent = forwardRef<HTMLDivElement, { onNavigate: (view: View) => void, onClose: () => void, onAssistantMessage?: (p: { content: string }) => void, onUserSend?: () => void }>(({ onNavigate, onClose, onAssistantMessage, onUserSend }, ref) => {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale as string;
  const t = (translations as any)[locale] || translations.ua;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [contactValue, setContactValue] = useState('');
  const [hasLead, setHasLead] = useState(false);
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

  // Load persisted history on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getChatHistory(locale);
        if (cancelled) return;
        if (res.success && res.data) {
          const history = res.data.messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at).toISOString(),
          }));
          setChatId((res.data as any).chatId || null);
          if (history.length > 0) {
            setMessages(history);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
      // If no history, show localized greeting
      setMessages([
        {
          role: 'assistant',
          content: t.chatGreeting ?? "Привіт! 👋 Я ваш AI-помічник. Чим можу допомогти сьогодні?",
          timestamp: new Date().toISOString(),
        },
      ]);
    })();
    (async () => {
      try {
        const s = await getLeadStatus();
        if (!cancelled && s.success && s.data) setHasLead(s.data.hasLead);
      } catch {}
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to add unique messages by role+content to avoid RT duplicates
  const addUniqueMessage = (list: ChatMessage[], msg: ChatMessage) => {
    const exists = list.some((m) => m.role === msg.role && m.content === msg.content);
    return exists ? list : [...list, msg];
  };

  // Realtime sync for this chat
  useEffect(() => {
    if (!chatId) return;
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        const m: any = payload.new;
        const newMsg: ChatMessage = {
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).toISOString(),
        };
        setMessages((prev) => {
          const dup = prev.some((x) => x.role === newMsg.role && x.content === newMsg.content);
          if (!dup) {
            if (newMsg.role === 'assistant') {
              try { onAssistantMessage?.({ content: newMsg.content }); } catch {}
            }
            return [...prev, newMsg];
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [chatId]);

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

    // Notify parent to play send sound (audio lives in parent)
    try { onUserSend?.(); } catch {}

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    const newMessages = addUniqueMessage(messages, userMessage);
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
        locale,
      });

      setIsLoading(false);

      if (result.success && result.data?.response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => addUniqueMessage(prev, assistantMessage));
        try { onAssistantMessage?.({ content: assistantMessage.content }); } catch {}
        // Offer contact only after more context or explicit heuristic from backend
        const userTurns = newMessages.filter(m => m.role === 'user').length;
        if (!hasLead && result.data?.askContact && userTurns >= 3 && !messages.some(m => m.type === 'contact_form')) {
          // Add CTA message + inline contact form as a chat bubble
          const cta = locale === 'ru'
            ? 'Если удобно, оставьте, пожалуйста, e‑mail или телефон — чтобы мы прислали предложение и связались.'
            : locale === 'en'
            ? 'If convenient, please leave your email or phone so we can send an offer and get in touch.'
            : 'Будь ласка, залиште e‑mail або телефон — щоб ми надіслали пропозицію та звʼязалися.';
          const ctaMsg: ChatMessage = {
            role: 'assistant',
            content: cta,
            timestamp: new Date().toISOString(),
          };
          const formMsg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString(), type: 'contact_form' };
          setMessages(prev => {
            const afterCta = addUniqueMessage(prev, ctaMsg);
            return [...afterCta, formMsg];
          });
          try { onAssistantMessage?.({ content: cta }); } catch {}
        }
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
        setMessages(prev => addUniqueMessage(prev, errorAssistantMessage));
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
       setMessages(prev => addUniqueMessage(prev, errorAssistantMessage));
    }
  };

  const handleDownload = async (format: 'txt' | 'json' | 'md' | 'html') => {
    try {
      const url = `/api/chat/export?format=${format}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        console.error('Export failed', await res.text());
        return;
      }
      const disp = res.headers.get('content-disposition') || '';
      const match = /filename="?([^";]+)"?/i.exec(disp || '');
      const filename = match ? match[1] : `chat-export.${format === 'md' ? 'md' : format}`;
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleSaveContact = async () => {
    if (!contactValue.trim()) return;
    try {
      const res = await saveContact(contactValue, locale);
      if (res.success) {
        setContactValue('');
        toast({ title: 'Дякуємо!', description: 'Контакт збережено.' });
        setHasLead(true);
        // Remove inline form bubble and add confirmation message
        setMessages(prev => prev.filter(m => m.type !== 'contact_form'));
        const confirmText = locale === 'ru'
          ? 'Спасибо! Контакт сохранён. Мы свяжемся скоро.'
          : locale === 'en'
          ? 'Thanks! Contact saved. We will reach out soon.'
          : 'Дякуємо! Контакт збережено. Ми скоро звʼяжемося.';
        const confirmMsg: ChatMessage = { role: 'assistant', content: confirmText, timestamp: new Date().toISOString() };
        setMessages(prev => addUniqueMessage(prev, confirmMsg));
      } else {
        toast({ variant: 'destructive', title: t.errorTitle, description: res.error || 'Некоректний контакт.' });
      }
    } catch (e) {
      console.error('save contact failed', e);
      toast({ variant: 'destructive', title: t.errorTitle, description: 'Сталася помилка.' });
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

  // Detect contact links inside assistant text to render social buttons
  const hasContactLinks = (text: string) => {
    const t = text.toLowerCase();
    return (
      t.includes('t.me/oleksiy_zhyvotivskyi') ||
      t.includes('viber://chat?number') ||
      t.includes('m.me/61559794323482')
    );
  };

  // Remove raw links and labels when we show pretty buttons
  const stripContactLinks = (text: string) => {
    let s = text;
    const patterns = [
      /(telegram\s*:\s*)?https?:\/\/t\.me\/[^\s|]+/gi,
      /(viber\s*:\s*)?viber:\/\/chat\?number=[^\s|]+/gi,
      /(messenger\s*:\s*)?https?:\/\/m\.me\/[^\s|]+/gi,
    ];
    for (const p of patterns) s = s.replace(p, '');
    // remove trailing labels and separators
    s = s.replace(/\s*\|\s*/g, ' ').replace(/\b(contacts|контакти|контакты)\s*:\s*$/i, '');
    const lines = s.split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.trim() && !hasContactLinks(line));
    return lines.join('\n').trim();
  };

  const ContactButtons = () => (
    <div className="mt-2 flex flex-wrap gap-2">
      <a href="https://t.me/oleksiy_zhyvotivskyi" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-background border hover:bg-muted transition">
        <Image src="/img-chat/telegram.svg" alt="Telegram" width={20} height={20} />
        <span className="text-sm font-medium">Telegram</span>
      </a>
      <a href="viber://chat?number=%2B48512686628" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-background border hover:bg-muted transition">
        <Image src="/img-chat/viber.svg" alt="Viber" width={20} height={20} />
        <span className="text-sm font-medium">Viber</span>
      </a>
      <a href="https://m.me/61559794323482" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-background border hover:bg-muted transition">
        <Image src="/img-chat/massanger.svg" alt="Messenger" width={20} height={20} />
        <span className="text-sm font-medium">Messenger</span>
      </a>
    </div>
  );

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
             <Button
               variant="ghost"
               size="icon"
               onClick={() => onNavigate('menu')}
               className="h-8 w-8 text-primary-foreground hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
             >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <BotIcon className="h-6 w-6" />
            <h3 className="font-semibold">AI Web Impuls</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                  title="Download history"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[10001] rounded-lg border bg-card text-card-foreground p-1 shadow-xl">
                <DropdownMenuItem className="rounded-md px-3 py-2 focus:bg-muted" onClick={() => handleDownload('html')}>HTML</DropdownMenuItem>
                <DropdownMenuItem className="rounded-md px-3 py-2 focus:bg-muted" onClick={() => handleDownload('md')}>Markdown</DropdownMenuItem>
                <DropdownMenuItem className="rounded-md px-3 py-2 focus:bg-muted" onClick={() => handleDownload('txt')}>TXT</DropdownMenuItem>
                <DropdownMenuItem className="rounded-md px-3 py-2 focus:bg-muted" onClick={() => handleDownload('json')}>JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-primary-foreground hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-background/50 flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="h-full flex-1">
            <div className="space-y-4 p-4">
              {messages.map((message, index) => {
                const emojiOnly = isEmojiOnly(message.content);
                const isContactForm = message.type === 'contact_form' && !hasLead;
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
                        {isContactForm ? (
                          <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm w-full">
                            <div className="mb-2 text-sm text-muted-foreground">
                              {locale === 'ru'
                                ? 'Оставьте контакт — e‑mail или телефон:'
                                : locale === 'en'
                                ? 'Leave your email or phone:'
                                : 'Залиште контакт — e‑mail або телефон:'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                value={contactValue}
                                onChange={(e) => setContactValue(e.target.value)}
                                placeholder={locale === 'ru' ? 'Email или телефон' : locale === 'en' ? 'Email or phone' : 'Email або телефон'}
                                className="h-9 flex-1"
                              />
                              <Button type="button" size="sm" onClick={handleSaveContact}>
                                {locale === 'ru' ? 'Сохранить' : locale === 'en' ? 'Save' : 'Зберегти'}
                              </Button>
                            </div>
                          </div>
                        ) : (
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
                              <>
                                <FormattedMessage text={hasContactLinks(message.content) ? stripContactLinks(message.content) : message.content} />
                                {hasContactLinks(message.content) && <ContactButtons />}
                              </>
                            ) : (
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            )}
                          </div>
                        )}
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
            {emojiOpen && (
              <div className="absolute left-0 right-0 bottom-full mb-2 z-20">
                <div className="w-full bg-popover border rounded-xl shadow-xl p-3">
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                    {topEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => onEmojiClick(emoji)}
                        className="text-2xl rounded-md hover:bg-muted transition-colors h-9 w-9 flex items-center justify-center"
                        aria-label={`emoji ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isLoading}
                onClick={() => setEmojiOpen((o) => !o)}
                className={cn("hover:bg-muted/80 focus-visible:ring-0 focus-visible:ring-offset-0", emojiOpen && "bg-muted")}
                aria-expanded={emojiOpen}
                aria-label="Toggle emoji picker"
              >
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button type="button" variant="ghost" size="icon" disabled={true} className="hover:bg-muted/80 cursor-not-allowed">
                 <Upload className="h-5 w-5 text-muted-foreground/50" />
              </Button>
            </div>
            <div />
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
  const [unread, setUnread] = useState(0);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [sessionChatId, setSessionChatId] = useState<string | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const params = useParams();
  const locale = Array.isArray((params as any).locale) ? (params as any).locale[0] : (params as any).locale;
  const t = (translations as any)[locale] || translations.ua;
  const notifyAudioRef = useRef<HTMLAudioElement | null>(null);
  const sendAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio('/sounds/chat-notify.mp3');
    a.preload = 'auto';
    a.volume = 0.6;
    notifyAudioRef.current = a;
    const s = new Audio('/sounds/chat-send.mp3');
    s.preload = 'auto';
    s.volume = 0.5;
    sendAudioRef.current = s;
  }, []);

  // Try to unlock audio on first user gesture (autoplay policies)
  useEffect(() => {
    const unlock = async () => {
      try {
        const tryUnlock = async (el: HTMLAudioElement | null) => {
          if (!el) return;
          el.muted = true; await el.play(); el.pause(); el.currentTime = 0; el.muted = false;
        };
        await tryUnlock(notifyAudioRef.current);
        await tryUnlock(sendAudioRef.current);
        setAudioUnlocked(true);
      } catch {}
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock as any);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock as any);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock as any);
    };
  }, []);

  // Mount a portal container at the end of <body> to avoid parent transforms affecting fixed positioning
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.id = 'chat-widget-portal';
    document.body.appendChild(el);
    setPortalNode(el);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, []);

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

  // Ensure we know chatId for background realtime (badge + sound when closed)
  useEffect(() => {
    (async () => {
      try {
        const s = await getChatSession();
        if (s.success && s.data?.chatId) setSessionChatId(s.data.chatId);
      } catch {}
    })();
  }, []);

  // Background realtime for unread counter + sound on any assistant message
  useEffect(() => {
    if (!sessionChatId) return;
    const supabase = getSupabaseClient();
    const ch = supabase
      .channel(`chat-badge-${sessionChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${sessionChatId}` }, (payload) => {
        const m: any = payload.new;
        if (m.role === 'assistant') {
          // Increment when chat is not open (closed or menu)
          if (view !== 'chat') setUnread((u) => u + 1);
          try { const el = notifyAudioRef.current; if (el) { el.currentTime = 0; el.play().catch(() => {}); } } catch {}
        }
      })
      .subscribe();
    return () => { try { supabase.removeChannel(ch); } catch {} };
  }, [sessionChatId, view]);

  // Proactive nudge manager: first nudge at 10s, затем каждые 2 мин без активности (пока виджет закрыт)
  useEffect(() => {
    const lastActivityKey = 'chat_last_activity';
    const lastNudgeKey = 'chat_last_nudge';
    const nudgeCountKey = 'chat_nudge_count';
    const firstDelay = 10_000; // 10s
    const idleThreshold = 120_000; // 2 min
    const maxPerSession = 5;

    const now = Date.now();
    if (!localStorage.getItem(lastActivityKey)) localStorage.setItem(lastActivityKey, String(now));
    const lastActivityRef = { current: Number(localStorage.getItem(lastActivityKey) || now) } as { current: number };
    const lastNudgeRef = { current: Number(localStorage.getItem(lastNudgeKey) || 0) } as { current: number };
    const nudgeCountRef = { current: Number(localStorage.getItem(nudgeCountKey) || 0) } as { current: number };

    const markActivity = () => {
      lastActivityRef.current = Date.now();
      localStorage.setItem(lastActivityKey, String(lastActivityRef.current));
    };
    window.addEventListener('pointerdown', markActivity);
    window.addEventListener('keydown', markActivity);
    window.addEventListener('scroll', markActivity, { passive: true });

    let firstTimer = window.setTimeout(async () => {
      try {
        if (view === 'closed' && nudgeCountRef.current < maxPerSession) {
          // Gate by lead + last message recency
          let allow = true;
          try {
            const meta = await getChatMeta();
            if (meta.success && meta.data) {
              if (meta.data.hasLead) allow = false;
              const lastAt = meta.data.lastMessageAt ? new Date(meta.data.lastMessageAt).getTime() : 0;
              if (lastAt && Date.now() - lastAt < idleThreshold) allow = false;
            }
          } catch {}
          if (allow) await insertAssistantMessage(t.chatProactiveNudge || 'Привіт! Можу допомогти підібрати послугу і орієнтовний бюджет.');
          lastNudgeRef.current = Date.now();
          nudgeCountRef.current += 1;
          localStorage.setItem(lastNudgeKey, String(lastNudgeRef.current));
          localStorage.setItem(nudgeCountKey, String(nudgeCountRef.current));
        }
      } catch {}
    }, firstDelay);

    const poll = window.setInterval(async () => {
      try {
        const now = Date.now();
        const idleFor = now - lastActivityRef.current;
        const sinceLastNudge = now - lastNudgeRef.current;
        if (view === 'closed' && idleFor >= idleThreshold && sinceLastNudge >= idleThreshold && nudgeCountRef.current < maxPerSession) {
          let allow = true;
          try {
            const meta = await getChatMeta();
            if (meta.success && meta.data) {
              if (meta.data.hasLead) allow = false;
              const lastAt = meta.data.lastMessageAt ? new Date(meta.data.lastMessageAt).getTime() : 0;
              if (lastAt && Date.now() - lastAt < idleThreshold) allow = false;
            }
          } catch {}
          if (allow) await insertAssistantMessage(t.chatProactiveNudge || 'Привіт! Можу допомогти підібрати послугу і орієнтовний бюджет.');
          lastNudgeRef.current = now;
          nudgeCountRef.current += 1;
          localStorage.setItem(lastNudgeKey, String(lastNudgeRef.current));
          localStorage.setItem(nudgeCountKey, String(nudgeCountRef.current));
        }
      } catch {}
    }, 15_000);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(poll);
      window.removeEventListener('pointerdown', markActivity);
      window.removeEventListener('keydown', markActivity);
      window.removeEventListener('scroll', markActivity);
    };
  }, [view, t.chatProactiveNudge]);

  const handleAssistantMessage = () => {
    // Increment when chat is not open (closed or menu)
    if (view !== 'chat') setUnread((u) => u + 1);
    try {
      const el = notifyAudioRef.current;
      if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
    } catch {}
  };

  const handleUserSend = async () => {
    try {
      const el = sendAudioRef.current;
      if (el) {
        el.currentTime = 0;
        await el.play().catch(() => {});
      }
    } catch {}
  };

  // Use portal if available; render nothing until mount to avoid shifting
  if (!portalNode) return null;

  return (
    <>
      {createPortal(
        shouldRenderContent ? (
          <div className="chat-widget-container z-[9999]" onClick={handleContainerClick}>
            <AnimatePresence>
            {view === 'menu' && <MenuContent unread={unread} onNavigate={(v) => { setView(v); if (v === 'chat') setUnread(0); }} onClose={closeWidget} />}
            {view === 'chat' && <ChatContent onNavigate={(v) => { setView(v); if (v === 'chat') setUnread(0); }} onClose={closeWidget} onAssistantMessage={handleAssistantMessage} onUserSend={handleUserSend} />}
          </AnimatePresence>
        </div>
      ) : null,
      portalNode
    )}

      {createPortal(
        (
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
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center shadow">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        ),
        portalNode
      )}
    </>
  );
}
