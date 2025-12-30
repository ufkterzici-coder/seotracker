export interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export interface HowToSchemaInput {
  title: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration format, e.g., "PT30M"
  estimatedCost?: {
    currency: string;
    value: number;
  };
  imageUrl?: string;
  supply?: string[];
  tool?: string[];
}

export function generateHowToSchema(input: HowToSchemaInput): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.title,
    description: input.description,
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
      url: step.url,
    })),
  };

  if (input.imageUrl) {
    schema.image = input.imageUrl;
  }

  if (input.totalTime) {
    schema.totalTime = input.totalTime;
  }

  if (input.estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: input.estimatedCost.currency,
      value: input.estimatedCost.value,
    };
  }

  if (input.supply && input.supply.length > 0) {
    schema.supply = input.supply.map((s) => ({
      '@type': 'HowToSupply',
      name: s,
    }));
  }

  if (input.tool && input.tool.length > 0) {
    schema.tool = input.tool.map((t) => ({
      '@type': 'HowToTool',
      name: t,
    }));
  }

  return schema;
}

export function extractStepsFromContent(content: string): HowToStep[] {
  const steps: HowToStep[] = [];

  // Pattern 1: Numbered lists (1., 2., etc.)
  const numberedPattern = /(\d+)[.)]\s*([^\n]+)\n([^0-9\n][^\n]*(?:\n(?![0-9]+[.)])[^\n]+)*)/g;

  let match;
  while ((match = numberedPattern.exec(content)) !== null) {
    const name = match[2].trim();
    const text = match[3].trim();

    if (name.length > 5 && text.length > 10) {
      steps.push({ name, text });
    }
  }

  // If no numbered steps found, try heading-based extraction
  if (steps.length === 0) {
    const headingPattern = /#{2,3}\s*(?:Adım|Step)\s*\d*:?\s*([^\n]+)\n([^#]+)/gi;

    while ((match = headingPattern.exec(content)) !== null) {
      const name = match[1].trim();
      const text = match[2].trim();

      if (name.length > 5) {
        steps.push({ name, text: text.substring(0, 500) });
      }
    }
  }

  return steps;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `PT${minutes}M`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `PT${hours}H`;
  }

  return `PT${hours}H${remainingMinutes}M`;
}

export function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);

  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);

  return hours * 60 + minutes;
}

export function validateHowToSchema(input: HowToSchemaInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.title || input.title.length < 10) {
    errors.push('Başlık çok kısa veya boş');
  }

  if (!input.description || input.description.length < 20) {
    errors.push('Açıklama çok kısa veya boş');
  }

  if (!input.steps || input.steps.length < 2) {
    errors.push('En az 2 adım gerekli');
  }

  input.steps?.forEach((step, index) => {
    if (!step.name || step.name.length < 5) {
      errors.push(`Adım ${index + 1}: Adım adı çok kısa`);
    }
    if (!step.text || step.text.length < 10) {
      errors.push(`Adım ${index + 1}: Adım açıklaması çok kısa`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
