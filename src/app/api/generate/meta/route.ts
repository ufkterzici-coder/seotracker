import { NextRequest, NextResponse } from 'next/server';
import { generateMetaTags } from '@/lib/ai/groq';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { title, content, mainKeyword } = await request.json();

    if (!title || !content || !mainKeyword) {
      return NextResponse.json(
        { error: 'Başlık, içerik ve ana anahtar kelime gerekli' },
        { status: 400 }
      );
    }

    const result = await generateMetaTags({
      title,
      content,
      mainKeyword,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Generate meta error:', error);
    return NextResponse.json(
      { error: 'Meta etiketleri oluşturma hatası' },
      { status: 500 }
    );
  }
}
