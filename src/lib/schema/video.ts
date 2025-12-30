export interface VideoSchemaInput {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string; // ISO 8601 duration
  contentUrl?: string;
  embedUrl?: string;
  expires?: string;
  hasPart?: Array<{
    name: string;
    startOffset: number;
    endOffset: number;
    url?: string;
  }>;
  interactionCount?: number;
}

export function generateVideoSchema(input: VideoSchemaInput): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.name,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    uploadDate: input.uploadDate,
  };

  if (input.duration) {
    schema.duration = input.duration;
  }

  if (input.contentUrl) {
    schema.contentUrl = input.contentUrl;
  }

  if (input.embedUrl) {
    schema.embedUrl = input.embedUrl;
  }

  if (input.expires) {
    schema.expires = input.expires;
  }

  if (input.interactionCount) {
    schema.interactionStatistic = {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: input.interactionCount,
    };
  }

  if (input.hasPart && input.hasPart.length > 0) {
    schema.hasPart = input.hasPart.map((part) => ({
      '@type': 'Clip',
      name: part.name,
      startOffset: part.startOffset,
      endOffset: part.endOffset,
      url: part.url,
    }));
  }

  return schema;
}

export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `PT${hours}H${minutes}M${secs}S`;
  }
  if (minutes > 0) {
    return `PT${minutes}M${secs}S`;
  }
  return `PT${secs}S`;
}

export function parseVideoDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function generateYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function generateYouTubeThumbnailUrl(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function validateVideoSchema(input: VideoSchemaInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.name || input.name.length < 5) {
    errors.push('Video adı gerekli');
  }

  if (!input.description || input.description.length < 20) {
    errors.push('Video açıklaması en az 20 karakter olmalı');
  }

  if (!input.thumbnailUrl) {
    errors.push('Thumbnail URL gerekli');
  }

  if (!input.uploadDate) {
    errors.push('Yükleme tarihi gerekli');
  }

  if (!input.contentUrl && !input.embedUrl) {
    errors.push('ContentUrl veya EmbedUrl gerekli');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
