import { NextRequest, NextResponse } from 'next/server';
import { scrapeMultiplePages } from '@/lib/scraper';
import { verifyAuth } from '@/lib/auth';
import { setCachedScrape, getCachedScrape } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { urls, useCache = true } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URL listesi gerekli' },
        { status: 400 }
      );
    }

    if (urls.length > 10) {
      return NextResponse.json(
        { error: 'Maksimum 10 URL işlenebilir' },
        { status: 400 }
      );
    }

    // Check cache first
    const results = [];
    const urlsToScrape = [];

    for (const url of urls) {
      if (useCache) {
        const cached = await getCachedScrape(url);
        if (cached) {
          results.push({
            url: cached.url,
            title: cached.title,
            content: cached.content,
            headings: cached.headings ? JSON.parse(cached.headings) : [],
            wordCount: cached.word_count,
            fromCache: true,
          });
          continue;
        }
      }
      urlsToScrape.push(url);
    }

    // Scrape uncached URLs
    if (urlsToScrape.length > 0) {
      const scraped = await scrapeMultiplePages(urlsToScrape);

      for (const page of scraped) {
        // Cache the result (expires in 24 hours)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await setCachedScrape({
          url: page.url,
          title: page.title,
          content: page.content,
          headings: JSON.stringify(page.headings),
          word_count: page.wordCount,
          expires_at: expiresAt.toISOString(),
        });

        results.push({
          ...page,
          fromCache: false,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: 'Sayfa tarama hatası' },
      { status: 500 }
    );
  }
}
