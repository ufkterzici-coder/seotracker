import { NextRequest, NextResponse } from 'next/server';
import { generateSEOContent } from '@/lib/ai/claude';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      topic,
      mainKeyword,
      competitorContents = [],
      wordCount = 1500,
      searchIntent = 'informational',
      language = 'tr',
    } = body;

    if (!topic || !mainKeyword) {
      return NextResponse.json(
        { error: 'Konu ve ana anahtar kelime gerekli' },
        { status: 400 }
      );
    }

    const result = await generateSEOContent({
      topic,
      mainKeyword,
      competitorContents,
      wordCount,
      searchIntent,
      language,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Generate content error:', error);
    return NextResponse.json(
      { error: 'İçerik oluşturma hatası' },
      { status: 500 }
    );
  }
}
