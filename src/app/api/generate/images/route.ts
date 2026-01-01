import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { generateImageSuggestions, generateStockImageKeywords } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, mainKeyword, count = 5, type = 'suggestions' } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Başlık gerekli' },
        { status: 400 }
      );
    }

    if (type === 'stock-keywords') {
      const keywords = await generateStockImageKeywords({
        title,
        mainKeyword: mainKeyword || title,
        content,
      });

      return NextResponse.json({ keywords });
    }

    // Default: generate image suggestions
    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: 'İçerik en az 50 karakter olmalı' },
        { status: 400 }
      );
    }

    const suggestions = await generateImageSuggestions({
      title,
      content,
      mainKeyword: mainKeyword || title,
      count,
    });

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Image suggestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Görsel öneri hatası' },
      { status: 500 }
    );
  }
}
