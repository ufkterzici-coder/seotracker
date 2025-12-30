import { NextRequest, NextResponse } from 'next/server';
import { analyzeKeywords, calculateKeywordProminence } from '@/lib/analysis/keywords';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { content, mainKeyword } = await request.json();

    if (!content || !mainKeyword) {
      return NextResponse.json(
        { error: 'İçerik ve ana anahtar kelime gerekli' },
        { status: 400 }
      );
    }

    const analysis = analyzeKeywords(content, mainKeyword);
    const prominence = calculateKeywordProminence(content, mainKeyword);

    return NextResponse.json({
      analysis: {
        ...analysis,
        prominence,
      },
    });
  } catch (error) {
    console.error('Keyword analysis error:', error);
    return NextResponse.json(
      { error: 'Anahtar kelime analizi hatası' },
      { status: 500 }
    );
  }
}
