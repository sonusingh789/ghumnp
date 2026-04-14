import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createToken, getCookieOptions, COOKIE_NAME } from '@/lib/auth';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const failUrl = `${baseUrl}/login?error=google_failed`;

  // User cancelled the Google prompt
  if (errorParam) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(failUrl);
  }

  // Verify CSRF state
  const stateCookie = request.cookies.get('google_oauth_state');
  if (!stateCookie) return NextResponse.redirect(failUrl);

  let from = '/';
  try {
    const { state, from: savedFrom } = JSON.parse(stateCookie.value);
    if (state !== stateParam) return NextResponse.redirect(failUrl);
    from = savedFrom || '/';
  } catch {
    return NextResponse.redirect(failUrl);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) throw new Error('Token exchange failed');
    const { access_token } = await tokenRes.json();

    // Fetch Google profile
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!profileRes.ok) throw new Error('Profile fetch failed');
    const { id: googleId, email, name, picture } = await profileRes.json();

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_no_email`);
    }

    // ── Find or create user ──────────────────────────────────────
    // 1. Existing user matched by google_id
    let result = await query(
      `SELECT id, name, email, role FROM Users WHERE google_id = @googleId AND is_active = 1`,
      { googleId }
    );
    let user = result.recordset[0];

    if (!user) {
      // 2. Existing user matched by email → link their Google account
      result = await query(
        `SELECT id, name, email, role FROM Users WHERE email = @email AND is_active = 1`,
        { email }
      );
      user = result.recordset[0];

      if (user) {
        await query(
          `UPDATE Users
           SET google_id    = @googleId,
               avatar_url   = COALESCE(avatar_url, @picture),
               updated_at   = SYSDATETIME()
           WHERE id = @id`,
          { googleId, picture: picture || null, id: user.id }
        );
      } else {
        // 3. Brand-new user — no password needed for Google sign-in
        result = await query(
          `INSERT INTO Users (name, email, google_id, avatar_url, role, is_active, created_at, updated_at)
           OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
           VALUES (@name, @email, @googleId, @picture, 'user', 1, SYSDATETIME(), SYSDATETIME())`,
          {
            name: name || email.split('@')[0],
            email,
            googleId,
            picture: picture || null,
          }
        );
        user = result.recordset[0];
      }
    }

    // Create session JWT + set cookie
    const token = await createToken({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    });

    const res = NextResponse.redirect(`${baseUrl}${from}`);
    res.cookies.set(COOKIE_NAME, token, getCookieOptions());
    // Clear the short-lived OAuth state cookie
    res.cookies.set('google_oauth_state', '', { maxAge: 0, path: '/' });
    return res;

  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(failUrl);
  }
}
