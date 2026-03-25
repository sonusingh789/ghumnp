import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth-request';

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request) {
  const auth = await getAuthFromRequest();
  if (!auth) {
    const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    res.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;
  }
  try {
    const result = await query(
      `SELECT id, name, email FROM Users WHERE id = @id`,
      { id: auth.id }
    );
    const user = result.recordset[0];
    if (!user) {
      const res = NextResponse.json({ error: 'User not found' }, { status: 404 });
      res.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
      res.headers.set('Access-Control-Allow-Credentials', 'true');
      return res;
    }
    const res = NextResponse.json({ user });
    res.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;
  } catch (err) {
    console.error('Auth me error:', err);
    const res = NextResponse.json({ error: 'Server error' }, { status: 500 });
    res.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;
  }
}
