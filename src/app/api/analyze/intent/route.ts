import { NextRequest, NextResponse } from 'next/server';
import { detectSearchIntent, suggestContentType } from '@/lib/analysis/intent';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { keyword, content } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: 'Anahtar kelime gerekli' },
        { status: 400 }
      );
    }

    const intentAnalysis = detectSearchIntent(keyword, content);
    const contentSuggestions = suggestContentType(intentAnalysis.intent);

    return NextResponse.json({
      ...intentAnalysis,
      contentSuggestions,
    });
  } catch (error) {
    console.error('Intent analysis error:', error);
    return NextResponse.json(
      { error: 'Arama niyeti analizi hatası' },
      { status: 500 }
    );
  }
}
