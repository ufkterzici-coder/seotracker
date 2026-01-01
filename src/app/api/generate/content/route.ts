import { NextRequest, NextResponse } from 'next/server';
import { generateSEOContent } from '@/lib/ai/groq';
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
      secondaryKeywords = [],
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

    console.log('Generating content for:', { topic, mainKeyword, secondaryKeywords });

    const result = await generateSEOContent({
      topic,
      mainKeyword,
      secondaryKeywords,
      competitorContents,
      wordCount,
      searchIntent,
      language,
    });

    console.log('Generated result meta:', result?.meta);

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Generate content error:', error);
    return NextResponse.json(
      { error: error.message || 'İçerik oluşturma hatası' },
      { status: 500 }
    );
  }
}
