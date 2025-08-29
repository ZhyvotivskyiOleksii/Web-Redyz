
'use server';
/**
 * @fileOverview An intelligent AI assistant for the WebImpuls studio.
 *
 * - webImpulsChat - A function that handles the chat process.
 * - WebImpulsChatInput - The input type for the webImpulsChat function.
 * - WebImpulsChatOutput - The return type for the webImpulsChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WebImpulsChatInputSchema = z.object({
  query: z.string().describe('The user\'s message or question.'),
  chatHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
  })).describe('The history of the conversation so far.'),
});
export type WebImpulsChatInput = z.infer<typeof WebImpulsChatInputSchema>;

const WebImpulsChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
});
export type WebImpulsChatOutput = z.infer<typeof WebImpulsChatOutputSchema>;

export async function webImpulsChat(input: WebImpulsChatInput): Promise<WebImpulsChatOutput> {
  return webImpulsChatFlow(input);
}

// This is the knowledge base for the AI. It contains information from the website.
const siteKnowledge = `
WebImpuls Studio Information:
- Description: Створюємо не просто сайти, а потужні інструменти для вашого бізнесу, що завантажуються швидше, ніж ви встигнете зробити каву. Кожен піксель, кожна стрічка коду працює на ваш успіх. Готові перетворити відвідувачів на клієнтів?
- Ми спеціалізуємося на створенні сучасних, швидких та ефективних веб-рішень.

Services & Pricing (Ukrainian):

1. Лендінг:
- Опис: Продаюча сторінка.
- Ціна: $800 - $1,500 (Вартість залежить від складності).
- Термін: 5-7 днів.
- Що входить: Адаптивний дизайн, сучасні анімації, SEO-оптимізація, інтеграція з аналітикою, форма зворотного зв'язку, завантаження за 1-2 секунди.
- Технології: Next.js 15, React 19, Tailwind CSS, Framer Motion, TypeScript, Vercel.

2. Корпоративний сайт (Найпопулярніше):
- Опис: Представницький сайт для бізнесу.
- Ціна: $2,500 - $5,000 (Залежно від кількості сторінок).
- Термін: 14-21 день.
- Що входить: Багатосторінкова структура, адмін-панель для контенту, блог/новини, галерея проєктів, контакти та карти, багатомовність.
- Технології: Next.js 15, React 19, Prisma ORM, PostgreSQL, Shadcn/ui, Clerk Auth.

3. Інтернет-магазин:
- Опис: Повноцінне e-commerce рішення.
- Ціна: $4,000 - $8,000 (Базова версія - просунута).
- Термін: 21-35 днів.
- Що входить: Каталог товарів з фільтрами, кошик та система замовлень, інтеграція платежів, особистий кабінет, адмін-панель, система знижок.
- Технології: Next.js Commerce, Shopify Hydrogen, Stripe, Supabase, Zustand, React Query.

4. Веб-додаток (SaaS/PWA):
- Опис: SaaS/PWA рішення.
- Ціна: $8,000 - $15,000 (MVP - повнофункціональне).
- Термін: 45-60 днів.
- Що входить: Система авторизації, дашборд з аналітикою, API для інтеграцій, real-time оновлення, файлове сховище, push-повідомлення.
- Технології: Next.js 15, React 19, tRPC, Prisma, PostgreSQL, Redis.

5. Редизайн сайту:
- Опис: Оновлення дизайну та модернізація.
- Ціна: $1,500 - $4,000 (Залежно від обсягу робіт).
- Термін: 10-21 день.
- Що входить: Сучасний UI/UX, міграція на нові технології, оптимізація продуктивності, поліпшення SEO, адаптація під мобільні.
- Технології: Figma to Code, Tailwind CSS, Framer Motion, Next.js, Lighthouse.

6. Підтримка сайту:
- Опис: Технічна підтримка та розвиток.
- Ціна: $300 - $800/місяць (Базовий - розширений пакет).
- Термін: Відповідь до 24 годин.
- Що входить: 24/7 моніторинг, оновлення контенту, резервні копії, виправлення помилок, оновлення безпеки, щомісячні звіти.
- Технології: Vercel Analytics, Sentry, Uptime Robot, Google Analytics, Lighthouse CI.

Services & Pricing (Polish):

1. Landing Page:
- Opis: Strona sprzedażowa.
- Cena: $800 - $1,500 (Koszt zależy od złożoności).
- Termin: 5-7 dni.
- Co zawiera: Responsywny design, nowoczesne animacje, optymalizacja SEO, integracja z analityką, formularz kontaktowy, ładowanie w 1-2 sekundy.

2. Strona korporacyjna (Najpopularniejsze):
- Opis: Reprezentacyjna strona dla biznesu.
- Cena: $2,500 - $5,000 (W zależności od liczby stron).
- Termin: 14-21 dni.
- Co zawiera: Wielostronicowa struktura, panel administracyjny do zarządzania treścią, blog/aktualności, galeria projektów, kontakty i mapy, wielojęzyczność.

3. Sklep internetowy:
- Opis: Pełnowartościowe rozwiązanie e-commerce.
- Cena: $4,000 - $8,000 (Wersja podstawowa - zaawansowana).
- Termin: 21-35 dni.
- Co zawiera: Katalog produktów z filtrami, koszyk i system zamówień, integracja płatności, panel klienta, panel administracyjny, system rabatów.

4. Aplikacja internetowa (SaaS/PWA):
- Opis: Rozwiązanie SaaS/PWA.
- Cena: $8,000 - $15,000 (MVP - pełna funkcjonalność).
- Termin: 45-60 dni.
- Co zawiera: System autoryzacji, dashboard z analityką, API do integracji, aktualizacje w czasie rzeczywistym, przechowywanie plików, powiadomienia push.

5. Przeprojektowanie strony:
- Opis: Odświeżenie designu i modernizacja.
- Cena: $1,500 - $4,000 (W zależności od zakresu prac).
- Termin: 10-21 dni.
- Co zawiera: Nowoczesny design UI/UX, migracja na nowe technologie, optymalizacja wydajności, poprawa SEO, adaptacja mobilna.

6. Wsparcie strony:
- Opis: Wsparcie techniczne i rozwój.
- Cena: $300 - $800/miesiąc (Pakiet podstawowy - rozszerzony).
- Termin: Odpowiedź do 24 godzin.
- Co zawiera: Monitoring 24/7, aktualizacje treści, kopie zapasowe, naprawa błędów, aktualizacje bezpieczeństwa, miesięczne raporty.

Services & Pricing (English):

1. Landing Page:
- Description: Sales-driven page.
- Price: $800 - $1,500 (Cost depends on complexity).
- Timeframe: 5-7 days.
- What's included: Responsive design, modern animations, SEO optimization, analytics integration, contact form, loads in 1-2 seconds.

2. Corporate Website (Most Popular):
- Description: Business representative site.
- Price: $2,500 - $5,000 (Depending on the number of pages).
- Timeframe: 14-21 days.
- What's included: Multi-page structure, content management admin panel, blog/news section, project gallery, contact forms and maps, multilingual support.

3. E-commerce Store:
- Description: Full-fledged e-commerce solution.
- Price: $4,000 - $8,000 (Basic to advanced version).
- Timeframe: 21-35 days.
- What's included: Product catalog with filters, shopping cart and order system, payment gateway integration, user account area, admin management panel, discount system.

4. Web Application (SaaS/PWA):
- Description: SaaS/PWA solution.
- Price: $8,000 - $15,000 (MVP to full-featured).
- Timeframe: 45-60 days.
- What's included: Authentication system, analytics dashboard, API for integrations, real-time updates, file storage, push notifications.

5. Website Redesign:
- Description: Design refresh and modernization.
- Price: $1,500 - $4,000 (Depending on the scope of work).
- Timeframe: 10-21 days.
- What's included: Modern UI/UX design, migration to new technologies, performance optimization, SEO improvement, mobile adaptation.

6. Website Support:
- Description: Technical support and development.
- Price: $300 - $800/month (Basic to advanced package).
- Timeframe: Response up to 24 hours.
- What's included: 24/7 website monitoring, content updates, backups, bug fixes, security updates, monthly reports.

Services & Pricing (Russian):

1. Лендинг:
- Описание: Продающая страница.
- Цена: $800 - $1,500 (Стоимость зависит от сложности).
- Срок: 5-7 дней.
- Что входит: Адаптивный дизайн, современные анимации, SEO-оптимизация, интеграция с аналитикой, форма обратной связи, загрузка за 1-2 секунды.

2. Корпоративный сайт (Самое популярное):
- Описание: Представительский сайт для бизнеса.
- Цена: $2,500 - $5,000 (В зависимости от количества страниц).
- Срок: 14-21 день.
- Что входит: Многостраничная структура, админ-панель для контента, блог/новости, галерея проектов, контакты и карты, многоязычность.

3. Интернет-магазин:
- Описание: Полноценное e-commerce решение.
- Цена: $4,000 - $8,000 (Базовая версия - продвинутая).
- Срок: 21-35 дней.
- Что входит: Каталог товаров с фильтрами, корзина и система заказов, интеграция платежей, личный кабинет, админ-панель, система скидок.

4. Веб-приложение (SaaS/PWA):
- Описание: SaaS/PWA решение.
- Цена: $8,000 - $15,000 (MVP - полнофункциональное).
- Срок: 45-60 дней.
- Что входит: Система авторизации, дашборд с аналитикой, API для интеграций, real-time обновления, файловое хранилище, push-уведомления.

5. Редизайн сайта:
- Описание: Обновление дизайна и модернизация.
- Цена: $1,500 - $4,000 (В зависимости от объёма работ).
- Срок: 10-21 день.
- Что входит: Современный UI/UX, миграция на новые технологии, оптимизация производительности, улучшение SEO, адаптация под мобильные.

6. Поддержка сайта:
- Описание: Техническая поддержка и развитие.
- Цена: $300 - $800/месяц (Базовый - расширенный пакет).
- Срок: Ответ до 24 часов.
- Что входит: 24/7 мониторинг, обновление контента, резервные копии, исправление ошибок, обновления безопасности, ежемесячные отчеты.

Contact Info:
- Telegram: https://t.me/oleksiy_zhyvotivskyi
- Viber: viber://chat?number=%2B48512686628
- Facebook Messenger: https://m.me/61559794323482
`;


const prompt = ai.definePrompt({
  name: 'webImpulsChatPrompt',
  input: {schema: WebImpulsChatInputSchema},
  output: {schema: WebImpulsChatOutputSchema},
  prompt: `You are "AI Web Impuls", a friendly, conversational, and professional AI assistant for the WebImpuls development studio. Your goal is to help potential clients.

**Core Instructions:**
1.  **Be Conversational:** Engage in a natural, friendly dialogue. Handle greetings, small talk, and typos gracefully. Don't be a rigid robot.
2.  **Language Proficiency:** You MUST detect the language of the user's most recent message ('query') and respond in that **exact same language**. Use the corresponding language block from your knowledge base.
3.  **Knowledge Base is Key:** For any questions about services, pricing, timelines, or technologies, your answers MUST be based **strictly** on the "WebImpuls Studio Information" provided below.
4.  **Know Your Limits:** If a question is outside the scope of the provided information (e.g., asking for a custom quote on a very complex, undefined project), politely state that you can't provide a precise answer and recommend contacting a manager through the official channels listed in your knowledge base. Don't invent information.
5.  **Use Context:** Pay attention to the \`chatHistory\` to understand the flow of the conversation.

**WebImpuls Studio Information (Multilingual):**
{{{siteKnowledge}}}

**Conversation History:**
{{#each chatHistory}}
{{role}}: {{content}}
{{/each}}

**User's new message:**
{{query}}

**Your response (in the same language as the user's new message):**
`,
});

const webImpulsChatFlow = ai.defineFlow(
  {
    name: 'webImpulsChatFlow',
    inputSchema: WebImpulsChatInputSchema,
    outputSchema: WebImpulsChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt({...input, siteKnowledge});
    return output!;
  }
);

    