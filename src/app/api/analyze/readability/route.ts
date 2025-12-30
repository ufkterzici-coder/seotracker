import { NextRequest, NextResponse } from 'next/server';
import { analyzeReadability, analyzeContentStructure } from '@/lib/analysis/readability';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'İçerik gerekli' },
        { status: 400 }
      );
    }

    const readability = analyzeReadability(content);
    const structure = analyzeContentStructure(content);

    return NextResponse.json({
      readability,
      structure,
    });
  } catch (error) {
    console.error('Readability analysis error:', error);
    return NextResponse.json(
      { error: 'Okunabilirlik analizi hatası' },
      { status: 500 }
    );
  }
}
