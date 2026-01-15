// app/api/submit-clue/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Payload = {
  clue_text?: string;
  pattern?: string;
  source_slug?: string;
  email?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
]);

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
  const email = (body.email ?? '').trim().toLowerCase();

  if (!clue_text) {
    return NextResponse.json(
      { ok: false, error: 'clue_text is required.' },
      { status: 400 },
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 },
    );
  }

  const domain = email.split('@')[1];
  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json(
      { ok: false, error: 'Please use a real email address.' },
      { status: 400 },
    );
  }

  const { error } = await supabase.from('submission').insert({
    clue_text,
    pattern,
    source_slug,
    email,
    status: 'pending',
    submitted_answer: pattern,
    submitted_enumeration: null,
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
