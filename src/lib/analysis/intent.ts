import type { SearchIntent, IntentAnalysis } from '@/types/analysis';

export function detectSearchIntent(keyword: string, content?: string): IntentAnalysis {
  const keywordLower = keyword.toLowerCase();

  const signals: string[] = [];
  const scores = {
    informational: 0,
    transactional: 0,
    navigational: 0,
    commercial: 0,
  };

  // Informational signals (Turkish and English)
  const informationalPatterns = [
    { pattern: /\b(nedir|nasıl|ne|neden|kim|hangi|kaç)\b/i, weight: 3 },
    { pattern: /\b(what|how|why|who|when|where|which)\b/i, weight: 3 },
    { pattern: /\b(guide|tutorial|learn|tips|examples|explained)\b/i, weight: 2 },
    { pattern: /\b(rehber|öğren|ipuçları|örnekler|açıklama)\b/i, weight: 2 },
    { pattern: /\b(tanım|anlam|tarih|bilgi)\b/i, weight: 2 },
    { pattern: /\b(definition|meaning|history|information)\b/i, weight: 2 },
  ];

  // Transactional signals
  const transactionalPatterns = [
    { pattern: /\b(satın al|sipariş|fiyat|ucuz|indirim)\b/i, weight: 3 },
    { pattern: /\b(buy|purchase|order|price|cheap|discount|deal)\b/i, weight: 3 },
    { pattern: /\b(coupon|shipping|delivery|sale)\b/i, weight: 2 },
    { pattern: /\b(kupon|kargo|teslimat|kampanya)\b/i, weight: 2 },
    { pattern: /\b(ödeme|sepet|checkout)\b/i, weight: 3 },
  ];

  // Commercial/Investigation signals
  const commercialPatterns = [
    { pattern: /\b(en iyi|karşılaştır|vs|review|inceleme)\b/i, weight: 3 },
    { pattern: /\b(best|top|compare|versus|review|rating)\b/i, weight: 3 },
    { pattern: /\b(alternative|recommendation|comparison)\b/i, weight: 2 },
    { pattern: /\b(alternatif|öneri|tavsiye|kıyaslama)\b/i, weight: 2 },
    { pattern: /\b(yorum|değerlendirme|puan)\b/i, weight: 2 },
    { pattern: /\d{4}\s*(model|version|sezon)/i, weight: 2 },
  ];

  // Navigational signals
  const navigationalPatterns = [
    { pattern: /\b(giriş|login|official|resmi)\b/i, weight: 3 },
    { pattern: /\b(website|site|portal|app|uygulama)\b/i, weight: 2 },
    { pattern: /\b(download|indir|yükle)\b/i, weight: 2 },
    { pattern: /\b(sign in|sign up|kayıt|üye)\b/i, weight: 2 },
  ];

  // Check patterns
  for (const { pattern, weight } of informationalPatterns) {
    if (pattern.test(keywordLower)) {
      scores.informational += weight;
      signals.push(`Bilgilendirici sinyal: ${pattern.source}`);
    }
  }

  for (const { pattern, weight } of transactionalPatterns) {
    if (pattern.test(keywordLower)) {
      scores.transactional += weight;
      signals.push(`İşlemsel sinyal: ${pattern.source}`);
    }
  }

  for (const { pattern, weight } of commercialPatterns) {
    if (pattern.test(keywordLower)) {
      scores.commercial += weight;
      signals.push(`Ticari araştırma sinyali: ${pattern.source}`);
    }
  }

  for (const { pattern, weight } of navigationalPatterns) {
    if (pattern.test(keywordLower)) {
      scores.navigational += weight;
      signals.push(`Navigasyonel sinyal: ${pattern.source}`);
    }
  }

  // Default to informational if no clear signals
  if (Object.values(scores).every((s) => s === 0)) {
    scores.informational = 1;
    signals.push('Varsayılan: Bilgilendirici niyet');
  }

  // Determine primary intent
  const maxScore = Math.max(...Object.values(scores));
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const intent = Object.entries(scores).find(([, v]) => v === maxScore)![0] as SearchIntent;
  const confidence = Math.round((maxScore / totalScore) * 100);

  // Content recommendations
  const recommendations: Record<SearchIntent, string[]> = {
    informational: [
      'Açık tanımlar ve açıklamalar kullanın',
      'Adım adım rehberler ekleyin',
      'SSS bölümü oluşturun',
      'Önemli noktaları madde işaretleriyle belirtin',
      'Bilgilendirici infografikler kullanın',
    ],
    transactional: [
      'Net CTA (Harekete Geçirici Mesaj) ekleyin',
      'Fiyat bilgilerini gösterin',
      'Güven unsurları ekleyin (yorumlar, garantiler)',
      'Ürün şeması için optimize edin',
      'Kolay satın alma süreci sunun',
    ],
    commercial: [
      'Karşılaştırma tabloları oluşturun',
      'Artıları ve eksileri listeleyin',
      'Uzman görüşleri ekleyin',
      'Kullanıcı yorumları/referansları ekleyin',
      'Detaylı özellik karşılaştırması yapın',
    ],
    navigational: [
      'Marka adını ön plana çıkarın',
      'Resmi iletişim bilgilerini ekleyin',
      'Navigasyon bağlantıları ekleyin',
      'Organizasyon şeması kullanın',
      'Doğrudan erişim bağlantıları sunun',
    ],
  };

  return {
    intent,
    confidence,
    signals,
    contentRecommendations: recommendations[intent],
  };
}

export function getIntentColor(intent: SearchIntent): string {
  const colors: Record<SearchIntent, string> = {
    informational: 'text-blue-400',
    transactional: 'text-emerald-400',
    commercial: 'text-purple-400',
    navigational: 'text-orange-400',
  };
  return colors[intent];
}

export function getIntentBgColor(intent: SearchIntent): string {
  const colors: Record<SearchIntent, string> = {
    informational: 'bg-blue-500/20',
    transactional: 'bg-emerald-500/20',
    commercial: 'bg-purple-500/20',
    navigational: 'bg-orange-500/20',
  };
  return colors[intent];
}

export function getIntentLabel(intent: SearchIntent): string {
  const labels: Record<SearchIntent, string> = {
    informational: 'Bilgilendirici',
    transactional: 'İşlemsel',
    commercial: 'Ticari Araştırma',
    navigational: 'Navigasyonel',
  };
  return labels[intent];
}

export function getIntentDescription(intent: SearchIntent): string {
  const descriptions: Record<SearchIntent, string> = {
    informational: 'Kullanıcı bilgi arıyor, öğrenmek istiyor',
    transactional: 'Kullanıcı satın almaya hazır',
    commercial: 'Kullanıcı satın almadan önce araştırma yapıyor',
    navigational: 'Kullanıcı belirli bir siteye/sayfaya ulaşmak istiyor',
  };
  return descriptions[intent];
}

export function suggestContentType(intent: SearchIntent): string[] {
  const suggestions: Record<SearchIntent, string[]> = {
    informational: [
      'Kapsamlı Rehber',
      'Nasıl Yapılır Makalesi',
      'SSS Sayfası',
      'Ansiklopedik İçerik',
      'Video Tutorial',
    ],
    transactional: [
      'Ürün Sayfası',
      'Fiyat Karşılaştırması',
      'Teklif Sayfası',
      'Landing Page',
      'Checkout Optimize',
    ],
    commercial: [
      'Karşılaştırma Makalesi',
      'Ürün İncelemesi',
      'En İyi X Listesi',
      'Alıcı Rehberi',
      'Uzman Değerlendirmesi',
    ],
    navigational: [
      'Ana Sayfa',
      'Hakkımızda',
      'İletişim Sayfası',
      'Uygulama İndirme',
      'Giriş/Kayıt Sayfası',
    ],
  };
  return suggestions[intent];
}
