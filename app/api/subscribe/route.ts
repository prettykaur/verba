// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

type Payload = {
  email?: string;
  source?: string;
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

  const email = (body.email ?? '').trim().toLowerCase();
  const source = (body.source ?? '').trim() || null;

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from('email_subscription')
    .insert({ email, source });

  // Ignore duplicate emails (idempotent UX)
  if (error && error.code !== '23505') {
    console.error('[subscribe] error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to subscribe.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
