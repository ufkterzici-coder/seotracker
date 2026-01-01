import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { fixSEOIssues } from '@/lib/ai/groq';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, title, metaTitle, metaDescription, mainKeyword, issues } = body;

    if (!content || !mainKeyword) {
      return NextResponse.json(
        { error: 'İçerik ve ana anahtar kelime gerekli' },
        { status: 400 }
      );
    }

    if (!issues || issues.length === 0) {
      return NextResponse.json(
        { error: 'Düzeltilecek sorun bulunamadı' },
        { status: 400 }
      );
    }

    const result = await fixSEOIssues({
      content,
      title: title || '',
      metaTitle,
      metaDescription,
      mainKeyword,
      issues,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'SEO düzeltme işlemi başarısız oldu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('SEO fix error:', error);
    return NextResponse.json(
      { error: error.message || 'SEO düzeltme hatası' },
      { status: 500 }
    );
  }
}
