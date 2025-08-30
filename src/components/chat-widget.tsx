
"use client";

import { useState, useRef, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Loader2, User, ArrowRight, Smile, Upload, Clock4, ChevronDown, ArrowLeft, Paperclip, FileText, Download, MoreVertical, Lock, ShieldCheck } from 'lucide-react';
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
import { generateSuggestion, getChatHistory, saveContact, getLeadStatus, adoptChatSession } from '@/app/actions';
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
  type?: 'text' | 'contact_form' | 'idle_prompt' | 'rating_prompt' | 'secure_confirm';
  lang?: 'ua' | 'ru' | 'pl' | 'de' | 'en';
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

// Меню віджета: показуємо бейдж з непрочитаними
const MenuContent = forwardRef<HTMLDivElement, { onNavigate: (view: View) => void, onClose: () => void, unread?: number }>(({ onNavigate, onClose, unread = 0 }, ref) => {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const t = (translations as any)[locale] || translations.ua;

  const contactItems = [
    { icon: '/img-chat/telegram.svg', title: 'Telegram', href: "https://t.me/oleksiy_zhyvotivskyi" },
    { icon: '/img-chat/viber.svg', title: 'Viber', href: "viber://chat?number=%2B48512686628" },
    { icon: '/img-chat/massanger.svg', title: 'Messenger', href: "https://m.me/61559794323482" },
  ];
  const workingHours = (process.env.NEXT_PUBLIC_WORKING_HOURS as string) || t.chatWorkingHours;

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
              {workingHours}
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
            {/* Бейдж з кількістю непрочитаних (від 1 до 99+) */}
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

// Heuristic per-message language detection for ua/ru/pl/de/en
const detectMessageLocale = (
  text: string,
  fallback: 'ua' | 'ru' | 'pl' | 'de' | 'en' = 'ua'
): 'ua' | 'ru' | 'pl' | 'de' | 'en' => {
  const s = (text || '').toLowerCase();
  if (!s.trim()) return fallback;

  const hasCyr = /[\u0400-\u04FF]/.test(s);
  const scores: Record<'ua' | 'ru' | 'pl' | 'de' | 'en', number> = {
    ua: 0,
    ru: 0,
    pl: 0,
    de: 0,
    en: 0,
  };

  if (hasCyr) {
    if (/[їєіґ]/.test(s)) scores.ua += 3;
    if (/[ыэёъ]/.test(s)) scores.ru += 3;
    if (/(привіт|будь\s+ласка|скільки|ціна|вартіст|доброго\s+дня)/.test(s)) scores.ua += 2;
    if (/(привет|какие|цена|стоимость|у\s+вас|можно|здравствуйте)/.test(s)) scores.ru += 2;
    if (/[і]/.test(s) && !/[ыэёъ]/.test(s)) scores.ua += 1;
  } else {
    if (/[ąćęłńóśżź]/.test(s)) scores.pl += 3;
    if (/(czy|jest|moż|zniżk|cena|stron|witam|proszę|dzięk)/.test(s)) scores.pl += 2;
    if (/[äöüß]/.test(s)) scores.de += 3;
    if (/(und|ich|wie|sie|möchte|möchten|weiter|danke|hallo|preis|seite|unternehmen|zeitrahmen)/.test(s)) scores.de += 2;
    if (/(what|how|price|budget|timeline|site|website|landing|discount|possible|thanks|hello|hi)/.test(s)) scores.en += 2;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return (best && best[1] > 0 ? (best[0] as any) : fallback) as any;
};

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
  const [nameValue, setNameValue] = useState('');
  const [hasLead, setHasLead] = useState(false);
  const [leadEmail, setLeadEmail] = useState<string | null>(null);
  const [leadPhone, setLeadPhone] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const idlePromptShownRef = useRef(false);
  const ratingAfterContactShownRef = useRef(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const sendQuick = (text: string) => {
    try { onUserSend?.(); } catch {}
    setInput(text);
    // Дочекаємось оновлення стану і відправимо
    setTimeout(() => handleFormSubmit(), 0);
  };

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

  // Load persisted history on mount (fast path with cache, avoid creating chat needlessly)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getExistingChatSession } = await import('@/app/actions');
        // 1) Fast path: if localStorage already has chat id (e.g., after proactive greet),
        //    render from cache or optimistically immediately, and refresh in background.
        const fastId = typeof window !== 'undefined' ? localStorage.getItem('web_impuls_chat_id') : null;
        if (fastId) {
          setChatId(fastId);
          let painted = false;
          // Try session cache
          try {
            const raw = sessionStorage.getItem(`chat_cache_${fastId}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed?.messages) && parsed.messages.length > 0) {
                setMessages(parsed.messages as ChatMessage[]);
                setHistoryLoaded(true);
                painted = true;
              }
            }
          } catch {}
          if (!painted) {
            // Optimistic paint: greet + contact form
            const optimistic: ChatMessage[] = [
              { role: 'assistant', content: t.chatWelcome ?? 'Привіт! 👋 Я ваш AI‑помічник. Чим можу допомогти?', timestamp: new Date().toISOString() },
              { role: 'assistant', content: '', type: 'contact_form', lang: (locale as any), timestamp: new Date().toISOString() },
            ];
            setMessages(optimistic);
            setHistoryLoaded(true);
          }
          // adopt and refresh in background (do not block UI)
          try { await adoptChatSession(fastId); } catch {}
          const res = await getChatHistory(locale);
          if (!cancelled && res.success && res.data) {
            const rows: any[] = res.data.messages || [];
            const history: ChatMessage[] = [];
            for (const row of rows) {
              if (row.role === 'assistant' && row.content === '::contact_form::') {
                const lastUser = [...history].reverse().find((x) => x.role === 'user');
                const inferred = lastUser ? detectMessageLocale(lastUser.content, (locale as any) || 'ua') : (locale as any);
                for (let i = history.length - 1; i >= 0; i--) {
                  const h = history[i] as any;
                  if (h.type === 'contact_form' || (h.role === 'assistant' && h.content === '::contact_form::')) history.splice(i, 1);
                }
                history.push({ role: 'assistant', content: '', type: 'contact_form', lang: inferred as any, timestamp: new Date(row.created_at).toISOString() });
                continue;
              }
              history.push({ role: row.role as 'user' | 'assistant', content: row.content, timestamp: new Date(row.created_at).toISOString() });
            }
            if (history.length > 0) setMessages(history);
          }
          return;
        }

        // 2) No local chat id: check existing cookie-based session (non-blocking fast exit if none)
        const existingRes = await getExistingChatSession();
        if (cancelled) return;
        const existingId = existingRes.success ? existingRes.data?.chatId : null;
        if (!existingId) {
          setHistoryLoaded(true);
          return;
        }

        // 3) With existing id (cookie), still go via cache/optimistic
        setChatId(existingId);
        try { localStorage.setItem('web_impuls_chat_id', existingId); } catch {}
        let hydratedFromCache = false;
        try {
          const raw = sessionStorage.getItem(`chat_cache_${existingId}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.messages) && parsed.messages.length > 0) {
              setMessages(parsed.messages as ChatMessage[]);
              setHistoryLoaded(true);
              hydratedFromCache = true;
            }
          }
        } catch {}
        if (!hydratedFromCache) {
          const optimistic: ChatMessage[] = [
            { role: 'assistant', content: t.chatWelcome ?? 'Привіт! 👋 Я ваш AI‑помічник. Чим можу допомогти?', timestamp: new Date().toISOString() },
            { role: 'assistant', content: '', type: 'contact_form', lang: (locale as any), timestamp: new Date().toISOString() },
          ];
          setMessages(optimistic);
          setHistoryLoaded(true);
        }

        // 4) Refresh from server in background
        const res = await getChatHistory(locale);
        if (cancelled) return;
        if (res.success && res.data) {
          const rows: any[] = res.data.messages || [];
          const history: ChatMessage[] = [];
          for (const row of rows) {
            if (row.role === 'assistant' && row.content === '::contact_form::') {
              const lastUser = [...history].reverse().find((x) => x.role === 'user');
              const inferred = lastUser ? detectMessageLocale(lastUser.content, (locale as any) || 'ua') : (locale as any);
              for (let i = history.length - 1; i >= 0; i--) {
                const h = history[i] as any;
                if (h.type === 'contact_form' || (h.role === 'assistant' && h.content === '::contact_form::')) history.splice(i, 1);
              }
              history.push({ role: 'assistant', content: '', type: 'contact_form', lang: inferred as any, timestamp: new Date(row.created_at).toISOString() });
              continue;
            }
            history.push({ role: row.role as 'user' | 'assistant', content: row.content, timestamp: new Date(row.created_at).toISOString() });
          }
          const cid = (res.data as any).chatId || existingId;
          setChatId(cid);
          try { if (cid) localStorage.setItem('web_impuls_chat_id', cid); } catch {}
          if (history.length > 0) {
            setMessages(history);
          }
        }
        setHistoryLoaded(true);
      } catch (e) {
        console.error('Failed to load chat history', e);
        setHistoryLoaded(true);
      }
    })();
    (async () => {
      try {
        const s = await getLeadStatus();
        if (!cancelled && s.success && s.data) {
          setHasLead(s.data.hasLead);
          setLeadEmail(s.data.email || null);
          setLeadPhone(s.data.phone || null);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Якщо немає ліда — показуємо оверлей та локальне привітання (без записів у стрічку)
  useEffect(() => {
    // no-op: оверлей керується станом hasLead
  }, [hasLead, locale]);

  // Helper to add unique messages by role+content to avoid RT duplicates
  const addUniqueMessage = (list: ChatMessage[], msg: ChatMessage) => {
    const exists = list.some((m) => m.role === msg.role && m.content === msg.content);
    return exists ? list : [...list, msg];
  };

  // Cache messages per chat id for instant reopen
  useEffect(() => {
    try {
      if (!chatId) return;
      const payload = { messages: messages.slice(-100) };
      sessionStorage.setItem(`chat_cache_${chatId}`, JSON.stringify(payload));
    } catch {}
  }, [messages, chatId]);

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
        let newMsg: ChatMessage;
        if (m.role === 'assistant' && m.content === '::contact_form::') {
          // Derive language from the last user message in current state
          let inferred: any = (locale as any);
          try {
            const lastUser = [...messages].reverse().find((x) => x.role === 'user');
            if (lastUser) inferred = detectMessageLocale(lastUser.content, (locale as any) || 'ua');
          } catch {}
          newMsg = { role: 'assistant', content: '', type: 'contact_form', lang: inferred, timestamp: new Date(m.created_at).toISOString() };
        } else {
          newMsg = { role: m.role, content: m.content, timestamp: new Date(m.created_at).toISOString() } as ChatMessage;
        }
        setMessages((prev) => {
          // If contact_form incoming, drop any existing form artifacts, then add once
          const next = (newMsg.type === 'contact_form') ? prev.filter((x: any) => x.type !== 'contact_form' && !(x.role === 'assistant' && x.content === '::contact_form::')) : [...prev];
          const dup = next.some((x) => x.role === newMsg.role && x.content === newMsg.content && (x.type || undefined) === (newMsg.type || undefined));
          if (!dup) {
            if (newMsg.role === 'assistant') {
              try { onAssistantMessage?.({ content: newMsg.content || (newMsg.type || 'assistant') }); } catch {}
            }
            return [...next, newMsg];
          }
          return next;
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
    resetIdleTimer();
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
    resetIdleTimer(); // no-op (idle disabled)

    // Якщо контакту ще немає — показуємо тільки інлайн-форму (ім'я + email/телефон)
    if (!hasLead && !messages.some(m => m.type === 'contact_form' || m.content === '::contact_form::')) {
      try {
        // Збережемо повідомлення користувача в БД, щоб друга вкладка одразу його побачила
        const { appendUserMessage } = await import('@/app/actions');
        await appendUserMessage(input);
      } catch (e) { /* не критично для UI */ }
      // Показуємо форму на мові останнього повідомлення (fallback — поточна локаль)
      const formLang = detectMessageLocale ? detectMessageLocale(input, (locale as any) ?? 'ua') : (locale as any);
      const formMsg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString(), type: 'contact_form', lang: formLang };
      setMessages(prev => [...prev, formMsg]);
      // Також збережемо маркер форми в БД, щоб після перезавантаження вона відобразилась
      try {
        const { insertAssistantMessage } = await import('@/app/actions');
        await insertAssistantMessage('::contact_form::');
      } catch {}
      return;
    }

    // Встановимо флаг, що вітання вже було — щоб уникнути повторної розсилки після активності користувача
    try {
      const keyPrefix = chatId ? `chat_${chatId}` : null;
      if (keyPrefix) localStorage.setItem(`${keyPrefix}_greet_sent`, '1');
    } catch {}

    setIsLoading(true);

    try {
      const result = await generateSuggestion({
        query: input,
        chatHistory: newMessages.map(m => ({ role: m.role, content: m.content })),
        // Detect reply language from latest user message
        locale: detectMessageLocale(input, (locale as any) ?? 'ua'),
      });

      setIsLoading(false);

      if (result.success && result.data?.response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => {
          const next = addUniqueMessage(prev, assistantMessage);
          // If assistant provided direct contact links, append rating prompt once
          try {
            const txt = assistantMessage.content || '';
            const hasLinks = /t\.me\/|viber:\/\/chat\?number=|m\.me\//i.test(txt);
            const already = next.some((m) => (m as any).type === 'rating_prompt');
            if (hasLinks && !already && !ratingAfterContactShownRef.current) {
              ratingAfterContactShownRef.current = true;
              return [...next, { role: 'assistant', content: '', type: 'rating_prompt', timestamp: new Date().toISOString() } as ChatMessage];
            }
          } catch {}
          return next;
        });
        try { onAssistantMessage?.({ content: assistantMessage.content }); } catch {}
        // Більше не додаємо форму автоматично тут
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

  // Idle prompt after 5 minutes without user activity inside chat
  const resetIdleTimer = () => {
    // Idle prompts disabled per new logic
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  };

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSaveContact = async (preferredLang?: 'ua' | 'ru' | 'pl' | 'de' | 'en') => {
    if (!contactValue.trim()) return;
    try {
      const { saveLeadDetails } = await import('@/app/actions');
      const res = await saveLeadDetails({ name: nameValue, contact: contactValue, locale: preferredLang || (locale as any) });
      if (res.success) {
        setContactValue('');
        setNameValue('');
        toast({
          title:
            locale === 'de'
              ? 'Danke!'
              : locale === 'en'
              ? 'Thank you!'
              : locale === 'pl'
              ? 'Dziękujemy!'
              : locale === 'ru'
              ? 'Спасибо!'
              : 'Дякуємо!',
          description:
            locale === 'de'
              ? 'Kontakt gespeichert.'
              : locale === 'en'
              ? 'Contact saved.'
              : locale === 'pl'
              ? 'Kontakt zapisany.'
              : locale === 'ru'
              ? 'Контакт сохранен.'
              : 'Контакт збережено.'
        });
        setHasLead(true);
        // Оновлюємо локальні поля email/phone, щоб не просити зайве
        const v = contactValue.trim();
        if (v.includes('@')) setLeadEmail(v);
        if (!v.includes('@')) setLeadPhone(v);
        // Прибираємо форму і додаємо підтвердження у стрічку (картка з щитом)
        setMessages(prev => prev.filter(m => m.type !== 'contact_form'));
        const confirmMsg: ChatMessage = { role: 'assistant', content: '', type: 'secure_confirm', timestamp: new Date().toISOString(), lang: preferredLang || (locale as any) };
        // Персоналізоване вітання після підтвердження
        const firstName = (nameValue || '').trim().split(/\s+/)[0] || '';
        const langForHello = preferredLang || (locale as any);
        const helloText = firstName
          ? (langForHello === 'de'
              ? `Hallo ${firstName}! Wie kann ich helfen?`
              : langForHello === 'en'
              ? `Hi ${firstName}! How can I help?`
              : langForHello === 'pl'
              ? `Cześć, ${firstName}! W czym mogę pomóc?`
              : langForHello === 'ru'
              ? `Привет, ${firstName}! Чем могу помочь?`
              : `Привіт, ${firstName}! Чим можу допомогти?`)
          : (langForHello === 'de'
              ? 'Hallo! Wie kann ich helfen?'
              : langForHello === 'en'
              ? 'Hi! How can I help?'
              : langForHello === 'pl'
              ? 'Cześć! W czym mogę pomóc?'
              : langForHello === 'ru'
              ? 'Привет! Чем могу помочь?'
              : 'Привіт! Чим можу допомогти?');
        const helloMsg: ChatMessage = { role: 'assistant', content: helloText, timestamp: new Date().toISOString() };

        setMessages(prev => addUniqueMessage(addUniqueMessage(prev.filter(m => m.type !== 'contact_form' && m.content !== '::contact_form::'), confirmMsg), helloMsg));
        try { onAssistantMessage?.({ content: 'secure_confirm' }); } catch {}
        try { onAssistantMessage?.({ content: helloText }); } catch {}
      } else {
        toast({
          variant: 'destructive',
          title: t.errorTitle,
          description:
            res.error ||
            (locale === 'de'
              ? 'Ungültiger Kontakt.'
              : locale === 'en'
              ? 'Invalid contact.'
              : locale === 'pl'
              ? 'Nieprawidłowy kontakt.'
              : locale === 'ru'
              ? 'Некорректный контакт.'
              : 'Некоректний контакт.'),
        });
      }
    } catch (e) {
      console.error('save contact failed', e);
      toast({
        variant: 'destructive',
        title: t.errorTitle,
        description:
          locale === 'de'
            ? 'Es ist ein Fehler aufgetreten.'
            : locale === 'en'
            ? 'An error occurred.'
            : locale === 'pl'
            ? 'Wystąpił błąd.'
            : locale === 'ru'
            ? 'Произошла ошибка.'
            : 'Сталася помилка.',
      });
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

  // Inject rating prompt after assistant shares direct contact links
  useEffect(() => {
    try {
      if (ratingAfterContactShownRef.current) return;
      const lastAssistIdx = [...messages].map((m, i) => ({ m, i })).reverse().find(x => x.m.role === 'assistant');
      if (!lastAssistIdx) return;
      const { m, i } = lastAssistIdx;
      if (!m || !m.content) return;
      if (!hasContactLinks(m.content)) return;
      const hasRatingAfter = messages.slice(i + 1).some((mm:any) => mm.type === 'rating_prompt');
      if (hasRatingAfter) return;
      ratingAfterContactShownRef.current = true;
      setMessages(prev => [...prev, { role: 'assistant', content: '', type: 'rating_prompt', timestamp: new Date().toISOString() }]);
    } catch {}
  }, [messages]);

  // Remove raw links and any label-only lines when we show pretty buttons
  const stripContactLinks = (text: string) => {
    let s = text;
    const patterns = [
      /(telegram\s*:\s*)?https?:\/\/t\.me\/[^\s|]+/gi,
      /(viber\s*:\s*)?viber:\/\/chat\?number=[^\s|]+/gi,
      /(messenger\s*:\s*)?https?:\/\/m\.me\/[^\s|]+/gi,
    ];
    for (const p of patterns) s = s.replace(p, '');
    // Normalize separators
    s = s.replace(/\s*\|\s*/g, ' ').replace(/\s{2,}/g, ' ');
    const isLabelOnly = (line: string) => /^(?:[*•\-]\s*)?(telegram|viber|messenger|contacts|контакти|контакты)\s*:?\s*$/i.test(line.trim());
    const lines = s
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !hasContactLinks(line) && !isLabelOnly(line) && line !== '*' && line !== '—');
    // Collapse extra empty lines that may appear after stripping
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
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
      className="chat-widget-card relative"
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
            {/* Export menu */}
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

            {/* Settings menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
                  title="Chat settings"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[10001] rounded-lg border bg-card text-card-foreground p-1 shadow-xl min-w-[220px]">
                <DropdownMenuItem className="rounded-md px-3 py-2 focus:bg-muted" onClick={async () => {
                  try {
                    const { resetChatSession, getChatHistory } = await import('@/app/actions');
                    const res = await resetChatSession();
                    if (res.success) {
                      // Завантажимо стартове вітання після ресету
                      const h = await getChatHistory(locale);
                      if (h.success && h.data) {
                        const history = h.data.messages.map((m:any) => ({ role: m.role, content: m.content, timestamp: new Date(m.created_at).toISOString() }));
                        setMessages(history.length > 0 ? history : [{ role: 'assistant', content: t.chatWelcome ?? 'Привіт! 👋 Я ваш AI‑помічник. Чим можу допомогти сьогодні?', timestamp: new Date().toISOString() }]);
                        setHasLead(false); setLeadEmail(null); setLeadPhone(null);
                        toast({ title: locale === 'de' ? 'Neuer Chat gestartet' : locale === 'en' ? 'New chat started' : 'Новий чат створено' });
                      }
                    } else {
                      toast({ variant: 'destructive', title: t.errorTitle, description: res.error || 'Не вдалося створити новий чат.' });
                    }
                  } catch (e) {
                    console.error(e);
                    toast({ variant: 'destructive', title: t.errorTitle, description: 'Помилка під час створення чату.' });
                  }
                }}>
                  {locale === 'de' ? 'Neuen Chat starten' : locale === 'en' ? 'Start new chat' : 'Почати новий чат'}
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-md px-3 py-2 focus:bg-muted" onClick={() => {
                  setMessages([{ role: 'assistant', content: t.chatWelcome ?? 'Привіт! 👋 Я ваш AI‑помічник. Чим можу допомогти сьогодні?', timestamp: new Date().toISOString() }]);
                  toast({ title: locale === 'de' ? 'Auf diesem Gerät gelöscht' : locale === 'en' ? 'Cleared on this device' : 'Очищено на цьому пристрої' });
                }}>
                  {locale === 'de' ? 'Auf diesem Gerät löschen' : locale === 'en' ? 'Clear on this device' : 'Очистити на цьому пристрої'}
                </DropdownMenuItem>
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
              {!historyLoaded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <Avatar className="h-8 w-8 border bg-primary/20 p-1.5 flex items-center justify-center">
                    <BotIcon className="h-full w-full" />
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {locale === 'de'
                        ? 'Verlauf wird geladen…'
                        : locale === 'en'
                        ? 'Loading history…'
                        : locale === 'pl'
                        ? 'Wczytywanie historii…'
                        : locale === 'ru'
                        ? 'Загрузка истории…'
                        : 'Завантаження історії…'}
                    </span>
                  </div>
                </motion.div>
              )}
              {historyLoaded && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn('flex flex-col gap-1', 'items-start')}
                >
                  <div className={cn('flex items-start gap-3 w-full')}>
                    <Avatar className="h-8 w-8 border bg-primary/20 p-1.5 flex items-center justify-center">
                      <BotIcon className="h-full w-full" />
                    </Avatar>
                    <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm">
                      {t.chatWelcome}
                    </div>
                  </div>
                </motion.div>
              )}
              {(() => {
                // If the first assistant message in DB is one of known greetings, render it in current locale
                const knownGreetings = new Set([
                  (translations as any).ua?.chatWelcome,
                  (translations as any).pl?.chatWelcome,
                  (translations as any).en?.chatWelcome,
                  (translations as any).ru?.chatWelcome,
                ].filter(Boolean));
                // Remove legacy CTA text if followed by contact_form to avoid duplicate prompt
                const ctaRegexes = [
                  /представьтесь\s+и\s+оставьте\s+контакт/i,
                  /представтесь\s+і\s+залиште\s+контакт/i,
                  /please\s+tell\s+your\s+name\s+and\s+leave\s+a\s+contact/i,
                  /podaj\s+proszę\s+imię\s+i\s+kontakt/i,
                ];
                const filtered = [] as ChatMessage[];
                for (let i = 0; i < messages.length; i++) {
                  const m = messages[i];
                  const next = messages[i + 1];
                  const isLegacyCta = m.role === 'assistant' && ctaRegexes.some((r) => r.test(m.content));
                  if (isLegacyCta && next && (next as any).type === 'contact_form') {
                    // skip legacy CTA
                    continue;
                  }
                  filtered.push(m);
                }
                const displayMessages = filtered.map((m, i) => {
                  if (i === 0 && m.role === 'assistant' && knownGreetings.has(m.content)) {
                    return { ...m, content: t.chatWelcome };
                  }
                  return m;
                });
                return displayMessages.map((message, index) => {
                const emojiOnly = isEmojiOnly(message.content);
                const prevMsg = (displayMessages as any)[index - 1] as ChatMessage | undefined;
                let msgLocale = ((message as any).lang as any) || (locale as any);
                const isContactForm = (message.type === 'contact_form' || (message.role === 'assistant' && message.content === '::contact_form::')) && !hasLead;
                // If contact form came from DB marker, infer language from previous user message
                if (!((message as any).lang) && message.role === 'assistant' && message.content === '::contact_form::' && prevMsg && prevMsg.role === 'user') {
                  try { msgLocale = detectMessageLocale(prevMsg.content, (locale as any) || 'ua'); } catch {}
                }
                const isSecureConfirm = message.type === 'secure_confirm';
                // Treat DB-inserted idle prompts (plain text) as interactive prompt
                const idlePromptText =
                  msgLocale === 'de'
                    ? 'Möchten Sie fortfahren?'
                    : msgLocale === 'en'
                    ? 'Would you like to continue?'
                    : msgLocale === 'pl'
                    ? 'Czy chcesz kontynuować?'
                    : msgLocale === 'ru'
                    ? 'Хотите продолжить?'
                    : 'Бажаєте продовжити?';
                const isIdlePrompt = false; // idle prompts disabled
                const isRatingPrompt = message.type === 'rating_prompt';
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
                          <div className="max-w-[80%] rounded-2xl bg-muted p-3 sm:p-4 text-sm w-full border border-border/50 shadow-sm">
                            <div className="mb-1.5 flex items-center gap-2 text-base font-semibold">
                              <span>👋</span>
                              <span>
                                {msgLocale === 'de'
                                  ? 'Lernen wir uns kennen'
                                  : msgLocale === 'en'
                                  ? 'Let’s get acquainted'
                                  : msgLocale === 'pl'
                                  ? 'Poznajmy się'
                                  : msgLocale === 'ru'
                                  ? 'Давайте познакомимся'
                                  : 'Познайомимось'}
                              </span>
                            </div>
                            <div className="mb-3 flex items-center gap-2 text-xs sm:text-[13px] text-muted-foreground">
                              <Lock className="h-4 w-4 text-primary" />
                              <span>
                                {msgLocale === 'de'
                                  ? 'Ihre Daten sind sicher verschlüsselt.'
                                  : msgLocale === 'en'
                                  ? 'Your data is securely encrypted.'
                                  : msgLocale === 'pl'
                                  ? 'Twoje dane są bezpiecznie szyfrowane.'
                                  : msgLocale === 'ru'
                                  ? 'Ваши данные надёжно зашифрованы.'
                                  : 'Ваші дані надійно зашифровані.'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 mb-2">
                              <Input
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                placeholder={
                                  msgLocale === 'de'
                                    ? 'Ihr Name'
                                    : msgLocale === 'en'
                                    ? 'Your name'
                                    : msgLocale === 'pl'
                                    ? 'Jak się do Ciebie zwracać?'
                                    : msgLocale === 'ru'
                                    ? 'Как к вам обращаться?'
                                    : 'Як до вас звертатися?'
                                }
                                className="h-9"
                              />
                              <Input
                                value={contactValue}
                                onChange={(e) => setContactValue(e.target.value)}
                                placeholder={
                                  msgLocale === 'de'
                                    ? 'E‑Mail oder Telefon'
                                    : msgLocale === 'en'
                                    ? 'Email or phone'
                                    : msgLocale === 'pl'
                                    ? 'Email lub telefon'
                                    : msgLocale === 'ru'
                                    ? 'Email или телефон'
                                    : 'Email або телефон'
                                }
                                className="h-9"
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <Button type="button" size="sm" onClick={() => handleSaveContact(msgLocale as any)} className="px-4">
                                {msgLocale === 'de'
                                  ? 'Senden'
                                  : msgLocale === 'en'
                                  ? 'Send'
                                  : msgLocale === 'pl'
                                  ? 'Wyślij'
                                  : msgLocale === 'ru'
                                  ? 'Отправить'
                                  : 'Надіслати'}
                              </Button>
                            </div>
                          </div>
                        ) : isSecureConfirm ? (
                          <div className="max-w-[80%] rounded-2xl bg-muted p-3 sm:p-4 text-sm w-full border border-border/50 shadow-sm">
                            <div className="mb-1.5 flex items-center gap-2 text-base font-semibold">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <span>
                                {(message as any).lang === 'de'
                                  ? 'Danke!'
                                  : (message as any).lang === 'en'
                                  ? 'Thanks!'
                                  : (message as any).lang === 'pl'
                                  ? 'Dziękujemy!'
                                  : (message as any).lang === 'ru'
                                  ? 'Спасибо!'
                                  : 'Дякуємо!'}
                              </span>
                            </div>
                            <div className="text-xs sm:text-[13px] text-muted-foreground">
                              {(message as any).lang === 'de'
                                ? 'Ihre Daten sind sicher verschlüsselt.'
                                : (message as any).lang === 'en'
                                ? 'Your data is securely encrypted.'
                                : (message as any).lang === 'pl'
                                ? 'Twoje dane są bezpiecznie szyfrowane.'
                                : (message as any).lang === 'ru'
                                ? 'Ваши данные надёжно зашифрованы.'
                                : 'Ваші дані надійно зашифровані.'}
                            </div>
                          </div>
                        ) : isRatingPrompt ? (
                          <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm w-full">
                            <div className="mb-2">
                              {locale === 'de' ? 'Bewerten Sie den Assistenten' : locale === 'en' ? 'Rate the assistant' : 'Оцініть роботу асистента'}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={async () => {
                                try {
                                  const { submitChatFeedback, insertAssistantMessage } = await import('@/app/actions');
                                  await submitChatFeedback('up');
                                  const cta = locale === 'de'
                                    ? 'Danke für Ihr Feedback! Wenn es passt — kontaktieren Sie uns über: Telegram https://t.me/oleksiy_zhyvotivskyi | Viber viber://chat?number=%2B48512686628 | Messenger https://m.me/61559794323482'
                                    : locale === 'en'
                                    ? 'Thanks for your feedback! If convenient, contact us via: Telegram https://t.me/oleksiy_zhyvotivskyi | Viber viber://chat?number=%2B48512686628 | Messenger https://m.me/61559794323482'
                                    : 'Дякуємо за оцінку! Якщо зручно — звʼяжіться з нами у: Telegram https://t.me/oleksiy_zhyvotivskyi | Viber viber://chat?number=%2B48512686628 | Messenger https://m.me/61559794323482';
                                  await insertAssistantMessage(cta);
                                } catch {}
                                onClose();
                              }}>👍🏻</Button>
                              <Button size="sm" variant="secondary" onClick={async () => {
                                try {
                                  const { submitChatFeedback, insertAssistantMessage } = await import('@/app/actions');
                                  await submitChatFeedback('down');
                                  const cta = locale === 'de'
                                    ? 'Danke! Wenn Sie uns brauchen — wir sind erreichbar: Telegram https://t.me/oleksiy_zhyvotivskyi | Viber viber://chat?number=%2B48512686628 | Messenger https://m.me/61559794323482'
                                    : locale === 'en'
                                    ? 'Thanks! If you need us, reach out: Telegram https://t.me/oleksiy_zhyvotivskyi | Viber viber://chat?number=%2B48512686628 | Messenger https://m.me/61559794323482'
                                    : 'Дякуємо! Якщо що — ми на звʼязку: Telegram https://t.me/oleksiy_zhyvotivskyi | Viber viber://chat?number=%2B48512686628 | Messenger https://m.me/61559794323482';
                                  await insertAssistantMessage(cta);
                                } catch {}
                                onClose();
                              }}>👎🏻</Button>
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
                });
              })()}
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
                placeholder={t.chatPlaceholder || "Напишіть ваше питання..."}
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

  // Конфіг таймінгів/лімітів для нуджів (override через NEXT_PUBLIC_*)
  const NUDGE_FIRST_DELAY_MS = Number(process.env.NEXT_PUBLIC_CHAT_NUDGE_FIRST_DELAY_MS || 10_000);
  const IDLE_THRESHOLD_MS = Number(process.env.NEXT_PUBLIC_CHAT_IDLE_MS || 300_000); // 5 хв
  const NUDGE_MAX_PER_SESSION = Number(process.env.NEXT_PUBLIC_CHAT_NUDGE_MAX || 2);
  const GREETING_DELAY_MS = Number(process.env.NEXT_PUBLIC_CHAT_GREETING_DELAY_MS || 15_000);

  useEffect(() => {
    const a = new Audio('/sounds/chat-notify.mp3');
    a.preload = 'auto';
    a.volume = 0.8;
    notifyAudioRef.current = a;
    const s = new Audio('/sounds/chat-send.mp3');
    s.preload = 'auto';
    s.volume = 0.6;
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

  // Якщо звук був заблокований політикою автоплею, зіграємо сповіщення
  // одразу після першого розблокування, якщо вже є непрочитані і чат закритий
  useEffect(() => {
    if (!audioUnlocked) return;
    if (view === 'closed' && unread > 0) {
      try {
        const el = notifyAudioRef.current;
        if (el) { el.currentTime = 0; el.play().catch(() => {}); }
      } catch {}
    }
  }, [audioUnlocked, unread, view]);

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

  // Відкриваємо віджет у режимі меню (лічильник не обнуляємо)
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

  // Коли користувач відкриває саме чат, пробуємо прийняти chat_id з localStorage
  useEffect(() => {
    if (view !== 'chat') return;
    const lsKey = 'web_impuls_chat_id';
    const t = window.setTimeout(async () => {
      try {
        const existing = localStorage.getItem(lsKey);
        if (existing) {
          const res = await adoptChatSession(existing);
          if (res.success) {
            setSessionChatId(existing);
          }
        }
      } catch {}
    }, 300);
    return () => window.clearTimeout(t);
  }, [view]);

  // Ensure we know existing chatId for background realtime (badge + sound when closed)
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const lsKey = 'web_impuls_chat_id';
        let adopted = false;
        try {
          const existing = typeof window !== 'undefined' ? localStorage.getItem(lsKey) : null;
          if (existing) {
            const res = await adoptChatSession(existing);
            if (res.success) {
              setSessionChatId(existing);
              adopted = true;
            }
          }
        } catch {}
        if (!adopted) {
          // Не створюємо чат на завантаженні — тільки якщо вже є у cookie
          const s = await (await import('@/app/actions')).getExistingChatSession();
          if (s.success && s.data?.chatId) {
            setSessionChatId(s.data.chatId);
            try { localStorage.setItem(lsKey, s.data.chatId); } catch {}
          }
        }
        // Cross-tab: listen for storage changes of chat id
        const onStorage = async (e: StorageEvent) => {
          if (e.key === 'web_impuls_chat_id' && e.newValue && e.newValue !== sessionChatId) {
            try {
              const res = await adoptChatSession(e.newValue);
              if (res.success) {
                setSessionChatId(e.newValue);
                // Після прийняття — підсвітимо бейдж і зіграємо звук мʼяко
                setUnread((u) => (u > 0 ? u : 1));
                try { const el = notifyAudioRef.current; if (el) { el.currentTime = 0; el.play().catch(() => {}); } } catch {}
              }
            } catch {}
          }
        };
        window.addEventListener('storage', onStorage);
        cleanup = () => { window.removeEventListener('storage', onStorage); };
      } catch {}
    })();
    return () => { try { cleanup?.(); } catch {} };
  }, [sessionChatId]);

  // Фонові підписки: збільшуємо лічильник, якщо чат не відкритий
  useEffect(() => {
    if (!sessionChatId) return; // не підписуємось, поки немає існуючого чату
    if (!sessionChatId) return;
    const supabase = getSupabaseClient();
    const ch = supabase
      .channel(`chat-badge-${sessionChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${sessionChatId}` }, (payload) => {
        const m: any = payload.new;
        if (m.role === 'assistant') {
          // Додаємо, якщо зараз не у вью 'chat'
          if (view !== 'chat') setUnread((u) => u + 1);
          try { const el = notifyAudioRef.current; if (el) { el.currentTime = 0; el.play().catch(() => {}); } } catch {}
        }
      })
      .subscribe();
    return () => { try { supabase.removeChannel(ch); } catch {} };
  }, [sessionChatId, view]);

  // Proactive nudge manager:
  // - Більше НЕ шлемо привітання через 10с (за запитом)
  // Idle nudge disabled per new logic
  useEffect(() => {
    return; // disabled
    /*
    if (!sessionChatId) return; // не нуджим, поки немає існуючого чату
    const keyPrefix = sessionChatId ? `chat_${sessionChatId}` : 'chat';
    const lastActivityKey = `${keyPrefix}_last_activity`;
    const lastNudgeKey = `${keyPrefix}_last_nudge`;
    const nudgeCountKey = `${keyPrefix}_nudge_count`;
    const nudgeLockKey = `${keyPrefix}_nudge_lock`;
    const firstDelay = NUDGE_FIRST_DELAY_MS;
    const idleThreshold = IDLE_THRESHOLD_MS;
    const maxPerSession = NUDGE_MAX_PER_SESSION;

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
        if (view === 'closed') {
          if (localStorage.getItem(nudgeLockKey) === '1') return;
          let sent = false;
          try {
            const meta = await (await import('@/app/actions')).getChatMetaIfExists();
            if (meta.success && meta.data) {
              const lastAt = meta.data.lastMessageAt ? new Date(meta.data.lastMessageAt).getTime() : 0;
              // Якщо була історія та 5 хв тиші — пропонуємо продовжити
              if (lastAt && Date.now() - lastAt >= idleThreshold && nudgeCountRef.current < maxPerSession) {
                localStorage.setItem(nudgeLockKey, '1');
                const idleText = locale === 'de' ? 'Möchten Sie fortfahren?' : locale === 'en' ? 'Would you like to continue?' : 'Бажаєте продовжити?';
                await (await import('@/app/actions')).insertAssistantMessageIfExists(idleText);
                sent = true;
              }
            }
          } catch {}
          if (sent) {
            lastNudgeRef.current = Date.now();
            nudgeCountRef.current += 1;
            localStorage.setItem(lastNudgeKey, String(lastNudgeRef.current));
            localStorage.setItem(nudgeCountKey, String(nudgeCountRef.current));
            setTimeout(() => localStorage.setItem(nudgeLockKey, '0'), 1000);
          }
        }
      } catch {}
    }, firstDelay);

    const poll = window.setInterval(async () => {
      try {
        const now = Date.now();
        const idleFor = now - lastActivityRef.current;
        const sinceLastNudge = now - lastNudgeRef.current;
        if (view === 'closed' && idleFor >= idleThreshold && sinceLastNudge >= idleThreshold && nudgeCountRef.current < maxPerSession) {
          if (localStorage.getItem(nudgeLockKey) === '1') return;
          let allow = false;
          try {
            const meta = await (await import('@/app/actions')).getChatMetaIfExists();
            if (meta.success && meta.data) {
              const lastAt = meta.data.lastMessageAt ? new Date(meta.data.lastMessageAt).getTime() : 0;
              // Only if there is history AND last message was at least idleThreshold ago
              if (lastAt && now - lastAt >= idleThreshold) allow = true;
            }
          } catch {}
          if (allow) {
            localStorage.setItem(nudgeLockKey, '1');
            const idleText = locale === 'de' ? 'Möchten Sie fortfahren?' : locale === 'en' ? 'Would you like to continue?' : 'Бажаєте продовжити?';
            await (await import('@/app/actions')).insertAssistantMessageIfExists(idleText);
            lastNudgeRef.current = now;
            nudgeCountRef.current += 1;
            localStorage.setItem(lastNudgeKey, String(lastNudgeRef.current));
            localStorage.setItem(nudgeCountKey, String(nudgeCountRef.current));
            setTimeout(() => localStorage.setItem(nudgeLockKey, '0'), 1000);
          }
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
  */
  }, [view, locale, sessionChatId, t.chatProactiveNudge]);

  // Proactive welcome after GREETING_DELAY_MS
  useEffect(() => {
    // Показуємо тільки один раз за сесію і тільки коли віджет закритий
    const key = 'chat_welcome_sent_v4';
    if (typeof window === 'undefined') return;
    const timer = window.setTimeout(async () => {
      try {
        // Дозволяємо і при відкритому виджеті — щоб не втрачати момент
        // Якщо вже є історія — не турбуємо
        const { getChatMetaIfExists, insertAssistantMessage, getChatSession } = await import('@/app/actions');
        const meta = await getChatMetaIfExists();
        const hasHistory = !!(meta.success && meta.data && meta.data.lastMessageAt);
        if (hasHistory) return;

        // Локалізоване вітання (коротке)
        const greet = (t.chatWelcome as string) || 'Привіт! 👋 Я ваш AI‑помічник. Чим можу допомогти?';
        await insertAssistantMessage(greet);
        // Додаємо форму контакту маркером (UI сам відрендерить гарну форму)
        await insertAssistantMessage('::contact_form::');

        // Візьмемо chatId щоб підписатися на realtime і показати бейдж
        const s = await getChatSession();
        if (s.success && s.data?.chatId) {
          setSessionChatId(s.data.chatId);
          try { localStorage.setItem('web_impuls_chat_id', s.data.chatId); } catch {}
          try {
            const optimistic = [
              { role: 'assistant', content: greet, timestamp: new Date().toISOString() },
              { role: 'assistant', content: '', type: 'contact_form', lang: (locale as any), timestamp: new Date().toISOString() },
            ];
            sessionStorage.setItem(`chat_cache_${s.data.chatId}`, JSON.stringify({ messages: optimistic }));
          } catch {}
          try { localStorage.setItem(`chat_${s.data.chatId}_welcome_sent_v4`, '1'); } catch {}
        }
        try { localStorage.setItem(key, '1'); } catch {}

        // Позначимо непрочитане та мʼяко програємо звук, якщо дозволено і чат закритий
        setUnread((u) => u + 2);
        if (view === 'closed' && audioUnlocked) {
          try { const el = notifyAudioRef.current; if (el) { el.currentTime = 0; el.play().catch(() => {}); } } catch {}
        }
      } catch {}
    }, GREETING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [view, t.chatWelcome, audioUnlocked]);

  // Колбек від дочірнього чату: нове асистентське повідомлення
  const handleAssistantMessage = () => {
    // Додаємо, якщо зараз не у вью 'chat'
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
