import type { FaqGroup } from '../data/faq';

interface BuildFaqPageJsonLdInput {
  pageUrl: string;
  group: Pick<FaqGroup, 'title' | 'intro' | 'items' | 'schemaName' | 'schemaDescription'>;
}

export function buildFaqPageJsonLd({ pageUrl, group }: BuildFaqPageJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: group.schemaName ?? group.title,
    description: group.schemaDescription ?? group.intro,
    url: pageUrl,
    mainEntity: group.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

