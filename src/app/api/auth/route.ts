import { NextRequest, NextResponse } from 'next/server';
import { login, logout, verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password, action } = await request.json();

    if (action === 'logout') {
      await logout();
      return NextResponse.json({ success: true });
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Şifre gerekli' },
        { status: 400 }
      );
    }

    const success = await login(password);

    if (!success) {
      return NextResponse.json(
        { error: 'Geçersiz şifre' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Kimlik doğrulama hatası' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isAuthenticated = await verifyAuth();
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
