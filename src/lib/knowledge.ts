
import fs from 'node:fs';
import path from 'node:path';
import { getSupabaseClient } from '@/lib/supabase';

type Service = {
  id: string;
  title: string;
  description?: string;
  price?: string | { min?: number; max?: number; currency?: string };
  timeline?: string | { daysMin?: number; daysMax?: number };
  includes?: string[];
  addons?: string[];
};

type KnowledgeJSON = {
  [locale: string]: {
    studio?: { description?: string };
    services?: Array<Service>;
    contact?: Record<string, string>;
  };
};

let cached: { mtimeMs: number; data: KnowledgeJSON } | null = null;

function tryLoadPerLocale(locale: string): Partial<KnowledgeJSON[string]> | null {
  const file = path.join(process.cwd(), 'src', 'locales', locale, 'knowledge.json');
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse', file, e);
    }
  }
  return null;
}

export function loadKnowledgeJSON(): KnowledgeJSON {
  const file = path.join(process.cwd(), 'src', 'data', 'site-knowledge.json');
  let stat: fs.Stats | null = null;
  try { stat = fs.statSync(file); } catch {}
  if (!cached || (stat && cached.mtimeMs !== stat.mtimeMs)) {
    const base: KnowledgeJSON = stat ? JSON.parse(fs.readFileSync(file, 'utf8')) : ({} as any);
    // Merge per-locale overrides if present: src/locales/{locale}/knowledge.json
    const locales = ['ua', 'de', 'en', 'pl'];
    for (const loc of locales) {
      const override = tryLoadPerLocale(loc);
      if (override) {
        base[loc] = { ...(base[loc] || {}), ...override } as any;
      }
    }
    cached = { mtimeMs: stat ? stat.mtimeMs : Date.now(), data: base };
  }
  return cached!.data;
}

export function buildSiteKnowledge(locale?: string): string {
  const data = loadKnowledgeJSON();
  const loc = locale && data[locale] ? locale : 'ua';
  const d = data[loc] || data['ua'];
  const lines: string[] = [];
  if (d.studio?.description) {
    lines.push(`Studio: ${d.studio.description}`);
  }
  if (d.services?.length) {
    lines.push('Services:');
    for (const s of d.services) {
      const price = typeof s.price === 'string'
        ? s.price
        : s.price
          ? `${s.price.min ?? '?'}-${s.price.max ?? '?'} ${s.price.currency ?? '$'}`
          : 'N/A';
      const timeline = typeof s.timeline === 'string'
        ? s.timeline
        : s.timeline
          ? `${s.timeline.daysMin ?? '?'}-${s.timeline.daysMax ?? '?'} days`
          : 'N/A';
      lines.push(`- ${s.title}: price ${price}, timeline ${timeline}`);
      if (s.includes?.length) lines.push(`  Includes: ${s.includes.join(', ')}`);
      if (s.addons?.length) lines.push(`  Addons: ${s.addons.join(', ')}`);
      if (s.description) lines.push(`  Note: ${s.description}`);
    }
  }
  if (d.contact) {
    const c = d.contact;
    lines.push(`Contacts: ${Object.entries(c).map(([k, v]) => `${k}: ${v}`).join(' | ')}`);
  }
  return lines.join('\n');
}

export async function fetchRelevantDocs(query: string, locale?: string) {
  try {
    const supabase = getSupabaseClient();
    const filters: any = supabase.from('knowledge_documents').select('id, locale, title, content, updated_at');
    const loc = locale || 'ua';
    let q = filters.eq('locale', loc);
    // Simple text match fallback (no vectors required)
    q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    const { data, error } = await q.order('updated_at', { ascending: false }).limit(5);
    if (error) {
      console.error('fetchRelevantDocs error:', error);
      return [] as Array<{ title: string; content: string }>;
    }
    return (data || []).map((d: any) => ({ title: d.title, content: d.content }));
  } catch (e) {
    console.error('fetchRelevantDocs exception:', e);
    return [] as Array<{ title: string; content: string }>;
  }
}

    

    