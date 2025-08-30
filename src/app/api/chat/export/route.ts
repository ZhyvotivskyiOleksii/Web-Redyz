import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const chatId = cookieStore.get('chat_id')?.value;
    if (!chatId) {
      return new Response(JSON.stringify({ error: 'No chat session' }), { status: 400 });
    }

    const url = new URL(req.url);
    const format = (url.searchParams.get('format') || 'json').toLowerCase();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const messages = data ?? [];
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filenameBase = `chat-${chatId.slice(0, 8)}-${ts}`;

    if (format === 'txt') {
      const blocks = messages.map(m => {
        const head = `[${new Date(m.created_at as string).toISOString()}] ${String(m.role).toUpperCase()}`;
        return `${head}\n\n${String(m.content)}\n\n---`;
      });
      const body = blocks.join('\n');
      return new Response(body, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.txt"`,
        },
      });
    }
    if (format === 'md' || format === 'markdown') {
      // Group by date for nicer structure
      const groups = new Map<string, typeof messages>();
      for (const m of messages) {
        const d = new Date(m.created_at as string);
        const key = d.toISOString().slice(0, 10);
        if (!groups.has(key)) groups.set(key, [] as any);
        (groups.get(key) as any).push(m);
      }
      let md = `# Chat ${chatId}\n\n`;
      const dates = Array.from(groups.keys()).sort();
      for (const day of dates) {
        md += `## ${day}\n\n`;
        for (const m of groups.get(day)!) {
          const time = new Date(m.created_at as string).toISOString().slice(11, 16);
          md += `- ${time} — ${String(m.role).toUpperCase()}\n\n`;
          md += `${String(m.content).replace(/\r?\n/g, '\n\n')}\n\n`;
          md += `---\n\n`;
        }
      }
      return new Response(md, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.md"`,
        },
      });
    }
    if (format === 'html') {
      const esc = (s: string) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      const items = messages.map(m => {
        const role = String(m.role).toLowerCase();
        const ts = new Date(m.created_at as string).toLocaleString();
        return `<div class="msg ${role}"><div class="meta">${ts} — ${role.toUpperCase()}</div><div class="content">${esc(String(m.content)).replace(/\n/g, '<br/>')}</div></div>`;
      }).join('\n');
      const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${filenameBase}</title><style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;background:#0b0b0c;color:#e5e7eb;margin:0;padding:24px}
        h1{font-size:18px;margin:0 0 16px 0;color:#fff}
        .msg{border:1px solid #1f2937;background:#111827;border-radius:12px;padding:12px 14px;margin:12px 0}
        .msg.user{border-color:#374151;background:#0f172a}
        .msg.assistant{border-color:#374151;background:#111827}
        .meta{font-size:12px;color:#9ca3af;margin-bottom:8px}
        .content{white-space:pre-wrap;line-height:1.5}
      </style></head><body><h1>Chat ${chatId}</h1>${items}</body></html>`;
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.html"`,
        },
      });
    }

    // default json
    const body = JSON.stringify({ chatId, messages }, null, 2);
    return new Response(body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameBase}.json"`,
      },
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
