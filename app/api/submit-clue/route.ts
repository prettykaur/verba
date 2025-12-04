// app/api/submit-clue/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Payload = {
  clue_text?: string;
  pattern?: string;
  source_slug?: string;
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const clue_text = (body.clue_text ?? '').trim();
  const pattern = (body.pattern ?? '').trim() || null;
  const source_slug = (body.source_slug ?? '').trim() || null;

  if (!clue_text) {
    return NextResponse.json(
      { ok: false, error: 'clue_text is required.' },
      { status: 400 },
    );
  }

  const { error } = await supabase.from('submission').insert({
    clue_text,
    pattern,
    source_slug,
  });

  if (error) {
    console.error('[/api/submit-clue] Supabase error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to save submission.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
