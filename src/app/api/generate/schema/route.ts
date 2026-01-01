import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  generateArticleSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
  generateWebPageSchema,
  extractFAQFromContent,
  extractHowToFromContent,
  combineSchemas,
  formatSchemaAsScript,
  FAQItem,
  HowToStep,
} from '@/lib/schema/generators';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      type,
      title,
      description,
      content,
      author,
      datePublished,
      dateModified,
      imageUrl,
      url,
      keywords,
      faqItems,
      howToSteps,
      totalTime,
      autoExtract = false,
    } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Schema türü gerekli' },
        { status: 400 }
      );
    }

    let schema: object;
    let extractedData: any = {};

    switch (type) {
      case 'article':
        if (!title || !description) {
          return NextResponse.json(
            { error: 'Başlık ve açıklama gerekli' },
            { status: 400 }
          );
        }
        schema = generateArticleSchema({
          title,
          description,
          content: content || '',
          author,
          datePublished,
          dateModified,
          imageUrl,
          url,
          keywords: keywords ? (Array.isArray(keywords) ? keywords : [keywords]) : undefined,
        });
        break;

      case 'faq':
        let items: FAQItem[] = faqItems || [];
        if (autoExtract && content) {
          const extracted = extractFAQFromContent(content);
          extractedData.faqItems = extracted;
          if (extracted.length > 0 && items.length === 0) {
            items = extracted;
          }
        }
        if (items.length === 0) {
          return NextResponse.json(
            { error: 'En az bir soru-cevap çifti gerekli', extractedData },
            { status: 400 }
          );
        }
        schema = generateFAQSchema(items);
        break;

      case 'howto':
        let steps: HowToStep[] = howToSteps || [];
        if (autoExtract && content) {
          const extracted = extractHowToFromContent(content);
          extractedData.howToSteps = extracted;
          if (extracted.length > 0 && steps.length === 0) {
            steps = extracted;
          }
        }
        if (!title) {
          return NextResponse.json(
            { error: 'HowTo başlığı gerekli' },
            { status: 400 }
          );
        }
        if (steps.length === 0) {
          return NextResponse.json(
            { error: 'En az bir adım gerekli', extractedData },
            { status: 400 }
          );
        }
        schema = generateHowToSchema({
          name: title,
          description: description || '',
          steps,
          totalTime,
          imageUrl,
        });
        break;

      case 'breadcrumb':
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
          return NextResponse.json(
            { error: 'Breadcrumb öğeleri gerekli' },
            { status: 400 }
          );
        }
        schema = generateBreadcrumbSchema(body.items);
        break;

      case 'webpage':
        if (!title) {
          return NextResponse.json(
            { error: 'Sayfa başlığı gerekli' },
            { status: 400 }
          );
        }
        schema = generateWebPageSchema({
          title,
          description: description || '',
          url,
          datePublished,
          dateModified,
        });
        break;

      case 'combined':
        const schemas: object[] = [];
        if (title && description) {
          schemas.push(
            generateArticleSchema({
              title,
              description,
              content: content || '',
              author,
              datePublished,
              dateModified,
              imageUrl,
              url,
              keywords: keywords ? (Array.isArray(keywords) ? keywords : [keywords]) : undefined,
            })
          );
        }
        if (content) {
          const faqExtracted = faqItems || extractFAQFromContent(content);
          if (faqExtracted.length > 0) {
            schemas.push(generateFAQSchema(faqExtracted));
            extractedData.faqItems = faqExtracted;
          }
          const howtoExtracted = howToSteps || extractHowToFromContent(content);
          if (howtoExtracted.length > 0) {
            schemas.push(
              generateHowToSchema({
                name: title || 'Nasıl Yapılır',
                description: description || '',
                steps: howtoExtracted,
              })
            );
            extractedData.howToSteps = howtoExtracted;
          }
        }
        schema = schemas.length > 1 ? combineSchemas(schemas) : schemas[0] || {};
        break;

      default:
        return NextResponse.json(
          { error: 'Geçersiz schema türü' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      schema,
      scriptTag: formatSchemaAsScript(schema),
      extractedData,
    });
  } catch (error: any) {
    console.error('Schema generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Schema oluşturma hatası' },
      { status: 500 }
    );
  }
}
