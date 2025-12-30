export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function extractFAQsFromContent(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];

  // Pattern 1: Question mark followed by text
  const questionPattern = /([^.!?\n]+\?)\s*\n?\s*([^?]+?)(?=\n\n|\n[^a-z]|$)/gi;

  let match;
  while ((match = questionPattern.exec(content)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim();

    if (question.length > 10 && answer.length > 20) {
      faqs.push({ question, answer });
    }
  }

  return faqs.slice(0, 10); // Maximum 10 FAQs
}

export function validateFAQSchema(faqs: FAQItem[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (faqs.length === 0) {
    errors.push('En az bir soru-cevap çifti gerekli');
  }

  faqs.forEach((faq, index) => {
    if (!faq.question || faq.question.length < 10) {
      errors.push(`Soru ${index + 1}: Soru çok kısa veya boş`);
    }
    if (!faq.answer || faq.answer.length < 20) {
      errors.push(`Soru ${index + 1}: Cevap çok kısa veya boş`);
    }
    if (!faq.question.includes('?')) {
      errors.push(`Soru ${index + 1}: Soru işareti eksik`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function formatFAQForDisplay(faqs: FAQItem[]): string {
  return faqs
    .map((faq, index) => `**S${index + 1}: ${faq.question}**\n\n${faq.answer}`)
    .join('\n\n---\n\n');
}
