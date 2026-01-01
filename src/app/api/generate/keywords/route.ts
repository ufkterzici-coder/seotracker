import { NextRequest, NextResponse } from 'next/server';
import { generateWithGroq } from '@/lib/ai/groq';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { topic, language = 'tr' } = await request.json();

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json(
        { error: 'Konu en az 3 karakter olmalı' },
        { status: 400 }
      );
    }

    const prompt = `Konu: "${topic}"

Bu konu için SEO anahtar kelime önerileri oluştur. Türkçe dilinde, gerçekçi arama hacmine sahip kelimeler öner.

Kurallar:
1. Ana anahtar kelime (main keyword) - en yüksek arama hacimli
2. 5-8 adet ilişkili anahtar kelime (related keywords)
3. 3-5 adet uzun kuyruk anahtar kelime (long-tail keywords)
4. Her kelime için tahmini arama niyetini belirt

JSON formatında döndür:
{
  "mainKeyword": "ana anahtar kelime",
  "relatedKeywords": [
    {"keyword": "kelime1", "intent": "informational"},
    {"keyword": "kelime2", "intent": "transactional"}
  ],
  "longTailKeywords": [
    {"keyword": "uzun kuyruk kelime 1", "intent": "informational"},
    {"keyword": "uzun kuyruk kelime 2", "intent": "commercial"}
  ]
}

Arama niyeti türleri: informational, transactional, commercial, navigational`;

    const response = await generateWithGroq({
      prompt,
      maxTokens: 1000,
      temperature: 0.6,
    });

    // Parse JSON response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const keywords = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ keywords });
      }
    } catch (e) {
      console.error('Failed to parse keywords response:', e);
    }

    return NextResponse.json({
      error: 'Anahtar kelime önerileri alınamadı'
    }, { status: 500 });

  } catch (error: any) {
    console.error('Generate keywords error:', error);
    return NextResponse.json(
      { error: error.message || 'Anahtar kelime oluşturma hatası' },
      { status: 500 }
    );
  }
}
