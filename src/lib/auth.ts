import { cookies } from 'next/headers';

const AUTH_COOKIE = 'seo_panel_auth';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function verifyAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);

  if (!authCookie) return false;

  try {
    const data = JSON.parse(authCookie.value);
    return data.authenticated && data.expires > Date.now();
  } catch {
    return false;
  }
}

export async function login(password: string): Promise<boolean> {
  if (password !== process.env.ADMIN_PASSWORD) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(
    AUTH_COOKIE,
    JSON.stringify({
      authenticated: true,
      expires: Date.now() + SESSION_DURATION,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
    }
  );

  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE;
}
