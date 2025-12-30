export type ProductAvailability = 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder' | 'Discontinued';

export interface ProductSchemaInput {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  availability: ProductAvailability;
  brand?: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  rating?: number;
  reviewCount?: number;
  url?: string;
  priceValidUntil?: string;
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
}

export function generateProductSchema(input: ProductSchemaInput): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    image: input.imageUrl,
    offers: {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: input.currency,
      availability: `https://schema.org/${input.availability}`,
      url: input.url,
      priceValidUntil: input.priceValidUntil,
      itemCondition: input.condition ? `https://schema.org/${input.condition}` : undefined,
    },
  };

  if (input.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: input.brand,
    };
  }

  if (input.sku) {
    schema.sku = input.sku;
  }

  if (input.gtin) {
    schema.gtin = input.gtin;
  }

  if (input.mpn) {
    schema.mpn = input.mpn;
  }

  if (input.rating && input.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating,
      reviewCount: input.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function generateProductWithReviewsSchema(
  product: ProductSchemaInput,
  reviews: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>
): object {
  const productSchema = generateProductSchema(product);

  return {
    ...productSchema,
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
  };
}

export function getAvailabilityLabel(availability: ProductAvailability): string {
  const labels: Record<ProductAvailability, string> = {
    InStock: 'Stokta',
    OutOfStock: 'Stokta Yok',
    PreOrder: 'Ön Sipariş',
    BackOrder: 'Tedarik Edilecek',
    Discontinued: 'Üretimden Kalktı',
  };
  return labels[availability];
}

export function validateProductSchema(input: ProductSchemaInput): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.name || input.name.length < 3) {
    errors.push('Ürün adı gerekli');
  }

  if (!input.description || input.description.length < 20) {
    errors.push('Ürün açıklaması en az 20 karakter olmalı');
  }

  if (!input.imageUrl) {
    errors.push('Ürün görseli gerekli');
  }

  if (typeof input.price !== 'number' || input.price <= 0) {
    errors.push('Geçerli bir fiyat gerekli');
  }

  if (!input.currency) {
    errors.push('Para birimi gerekli');
  }

  // Warnings for better SEO
  if (!input.brand) {
    warnings.push('Marka bilgisi eklemeniz önerilir');
  }

  if (!input.sku && !input.gtin && !input.mpn) {
    warnings.push('SKU, GTIN veya MPN eklemeniz önerilir');
  }

  if (!input.rating || !input.reviewCount) {
    warnings.push('Değerlendirme bilgisi eklemeniz önerilir');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(price);
}
