import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { generateArticleSchema, generateBlogPostSchema } from '@/lib/schema/article';
import { generateFAQSchema } from '@/lib/schema/faq';
import { generateHowToSchema } from '@/lib/schema/howto';
import { generateProductSchema } from '@/lib/schema/product';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Şema tipi ve veriler gerekli' },
        { status: 400 }
      );
    }

    let schema;

    switch (type) {
      case 'article':
        schema = generateArticleSchema(data);
        break;
      case 'blogpost':
        schema = generateBlogPostSchema(data);
        break;
      case 'faq':
        schema = generateFAQSchema(data.faqs);
        break;
      case 'howto':
        schema = generateHowToSchema(data);
        break;
      case 'product':
        schema = generateProductSchema(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Geçersiz şema tipi' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      schema,
      jsonLd: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
    });
  } catch (error) {
    console.error('Generate schema error:', error);
    return NextResponse.json(
      { error: 'Şema oluşturma hatası' },
      { status: 500 }
    );
  }
}
