
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
import { buildSiteKnowledge, fetchRelevantDocs } from '@/lib/knowledge';

const WebImpulsChatInputSchema = z.object({
  query: z.string().describe('The user\'s message or question.'),
  chatHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
  })).describe('The history of the conversation so far.'),
  locale: z.string().optional().describe('UI locale (ua/pl/en/de).'),
  customerName: z.string().optional().describe('Customer\'s name if known.'),
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

Services & Pricing (German):

1. Landing Page:
- Beschreibung: Verkaufsseite.
- Preis: $800 - $1,500 (Die Kosten hängen von der Komplexität ab).
- Zeitrahmen: 5-7 Tage.
- Was ist inbegriffen: Responsives Design, moderne Animationen, SEO-Optimierung, Analyse-Integration, Kontaktformular, Ladezeit von 1-2 Sekunden.

2. Unternehmenswebsite (Am beliebtesten):
- Beschreibung: Repräsentative Website für Unternehmen.
- Preis: $2,500 - $5,000 (Abhängig von der Anzahl der Seiten).
- Zeitrahmen: 14-21 Tage.
- Was ist inbegriffen: Mehrseitige Struktur, Admin-Panel zur Inhaltsverwaltung, Blog/News, Projektgalerie, Kontaktformulare und Karten, Mehrsprachigkeit.

3. E-Commerce-Shop:
- Beschreibung: Vollwertige E-Commerce-Lösung.
- Preis: $4,000 - $8,000 (Basis- bis erweiterte Version).
- Zeitrahmen: 21-35 Tage.
- Was ist inbegriffen: Produktkatalog mit Filtern, Warenkorb- und Bestellsystem, Zahlungsgateway-Integration, Benutzerkontobereich, Admin-Verwaltungspanel, Rabattsystem.

4. Webanwendung (SaaS/PWA):
- Beschreibung: SaaS/PWA-Lösung.
- Preis: $8,000 - $15,000 (MVP bis voll funktionsfähig).
- Zeitrahmen: 45-60 Tage.
- Was ist inbegriffen: Authentifizierungssystem, Analyse-Dashboard, API für Integrationen, Echtzeit-Updates, Dateispeicher, Push-Benachrichtigungen.

5. Website-Neugestaltung:
- Beschreibung: Design-Auffrischung und Modernisierung.
- Preis: $1,500 - $4,000 (Abhängig vom Arbeitsumfang).
- Zeitrahmen: 10-21 Tage.
- Was ist inbegriffen: Modernes UI/UX-Design, Migration auf neue Technologien, Leistungsoptimierung, SEO-Verbesserung, mobile Anpassung.

6. Website-Support:
- Beschreibung: Technischer Support und Entwicklung.
- Preis: $300 - $800/Monat (Basis- bis erweitertes Paket).
- Zeitrahmen: Antwort innerhalb von 24 Stunden.
- Was ist inbegriffen: 24/7-Website-Überwachung, Inhaltsaktualisierungen, Backups, Fehlerbehebungen, Sicherheitsupdates, monatliche Berichte.

Contact Info:
- Telegram: https://t.me/oleksiy_zhyvotivskyi
- Viber: viber://chat?number=%2B48512686628
- Facebook Messenger: https://m.me/61559794323482
`;


const prompt = ai.definePrompt({
  name: 'webImpulsChatPrompt',
  input: {schema: WebImpulsChatInputSchema},
  output: {schema: WebImpulsChatOutputSchema},
  prompt: `You are "AI Web Impuls", a friendly, expert and consultative sales assistant for the WebImpuls studio.

Respond in the language of the user's latest message (query). Use the facts ONLY from:
1) Structured Site Knowledge below, and 2) Optional Supporting Docs.
If information is missing or uncertain, say so and propose to contact a manager (do not invent facts).

Sales style (succinct, helpful, consultative, not pushy):
- Start with a short acknowledgment and 1 clarifying question at a time.
- Prioritize understanding goals/scope and timeline before discussing budget. Do not lead with budget.
- Recommend 1 primary offer and optionally 1 alternative (cheaper or more advanced), with bullet points for scope, timeline and price ranges from knowledge.
- Only suggest leaving contacts after the user shows readiness (e.g., asks about next steps) or after several exchanges when it feels natural. Be polite and optional.
- Keep tone warm, respectful, and professional. Avoid sounding like you are insisting or rushing.
- Keep responses clean: no typos, no random syllables, and do not mix languages in one sentence.

If the user asks to speak with a human, reply with ONE short sentence and include direct links exactly once (no bullets), like:
Telegram https://t.me/oleksiy_zhyvotivskyi | Viber viber://chat?number=%2B48512686628 | Messenger https://m.me/61559794323482
Do not repeat contact labels below. Do not output placeholder brackets [] or empty list markers.

Personalization:
- If a customer name is provided (Customer Name below), occasionally address the user by name (1 out of ~4 messages), naturally and without overusing it.

Grounding rules:
- Prices and timelines MUST come from the structured knowledge below; do not alter ranges.
- If supporting docs add relevant details, include them but do not contradict the structured data.
- If the user asks beyond knowledge scope, say you can't provide exact numbers and recommend manager contact.

Business Hours: {{businessHours}}

Structured Site Knowledge (localized):
{{{siteKnowledge}}}

Supporting Docs (optional):
{{{supportingDocs}}}

Customer Name (optional): {{customerName}}

Conversation History:
{{#each chatHistory}}
{{role}}: {{content}}
{{/each}}

User's new message:
{{query}}

When you share direct contact links, append a short one-sentence note with business hours like: "Hours: {{businessHours}} — message anytime, we usually reply even on weekends." Translate this note to the response language.

Your response (strictly grounded, same language):
`,
});

const webImpulsChatFlow = ai.defineFlow(
  {
    name: 'webImpulsChatFlow',
    inputSchema: WebImpulsChatInputSchema,
    outputSchema: WebImpulsChatOutputSchema,
  },
  async (input) => {
    const loc = input.locale || 'ua';
    const siteKnowledgeDynamic = buildSiteKnowledge(loc);
    const businessHours = process.env.NEXT_PUBLIC_WORKING_HOURS || 'Mon–Fri, 9:00–18:00';
    let supportingDocs = '';
    if (input.query && input.query.trim().length > 0) {
      const docs = await fetchRelevantDocs(input.query, loc);
      if (docs.length) {
        supportingDocs = docs
          .map((d, i) => `Doc ${i + 1}: ${d.title}\n${d.content}`)
          .join('\n\n');
      }
    }

    const {output} = await prompt({
      ...input,
      siteKnowledge: siteKnowledgeDynamic,
      supportingDocs,
      businessHours,
    });
    return output!;
  }
);

    

    

    
