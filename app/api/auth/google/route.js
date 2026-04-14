import { NextResponse } from 'next/server';
import { sanitizeReturnPath } from '@/utils/navigation';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = sanitizeReturnPath(searchParams.get('from') || '/');

  const state = crypto.randomUUID();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${baseUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  const res = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`);

  // Store state + return path in a short-lived httpOnly cookie (10 min)
  res.cookies.set('google_oauth_state', JSON.stringify({ state, from }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return res;
}
