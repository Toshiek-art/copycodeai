export type GuideSlug = 'gdpr-ai-startup' | 'eaa-startup-websites' | 'data-flow-ai-feature';

export interface GuideRelatedService {
  label: string;
  href: string;
}

export interface GuideEntry {
  slug: GuideSlug;
  title: string;
  description: string;
  publishAt: string;
  updatedAt: string;
  category: string;
  relatedService: GuideRelatedService;
  relatedGuides: GuideSlug[];
  href: `/guides/${GuideSlug}/`;
  canonical: `https://copycodeai.online/guides/${GuideSlug}/`;
  pdfUrl: string | null;
}

export const guides: GuideEntry[] = [
  {
    slug: 'gdpr-ai-startup',
    title: 'GDPR for AI startups: the launch decisions that matter early',
    description:
      'A practical overview of where data enters the system, which workflows need explicit decisions, and how to avoid compliance debt before product-market fit.',
    publishAt: '2026-04-06T09:15:00+03:00',
    updatedAt: '2026-04-06T09:15:00+03:00',
    category: 'GDPR',
    relatedService: {
      label: 'Compliance-Ready Landing Page',
      href: '/compliance-ready-landing'
    },
    relatedGuides: ['eaa-startup-websites', 'data-flow-ai-feature'],
    href: '/guides/gdpr-ai-startup/',
    canonical: 'https://copycodeai.online/guides/gdpr-ai-startup/',
    pdfUrl: null
  },
  {
    slug: 'eaa-startup-websites',
    title: 'EAA for startups: what actually matters before launch',
    description:
      'How to shape headings, navigation, forms, and content hierarchy so the first launch is easier to maintain and easier to improve.',
    publishAt: '2026-04-13T09:15:00+03:00',
    updatedAt: '2026-04-13T09:15:00+03:00',
    category: 'EAA / accessibility',
    relatedService: {
      label: 'EAA Structural Hardening',
      href: '/eaa-structural-hardening'
    },
    relatedGuides: ['gdpr-ai-startup', 'data-flow-ai-feature'],
    href: '/guides/eaa-startup-websites/',
    canonical: 'https://copycodeai.online/guides/eaa-startup-websites/',
    pdfUrl: null
  },
  {
    slug: 'data-flow-ai-feature',
    title: 'AI data flow: where features quietly get complicated',
    description:
      'A guide to implementation decisions around prompts, inputs, outputs, logging, and ownership when shipping an AI-assisted feature.',
    publishAt: '2026-04-20T09:15:00+03:00',
    updatedAt: '2026-04-20T09:15:00+03:00',
    category: 'AI feature build',
    relatedService: {
      label: 'AI Feature Integration',
      href: '/ai-feature-integration'
    },
    relatedGuides: ['gdpr-ai-startup', 'eaa-startup-websites'],
    href: '/guides/data-flow-ai-feature/',
    canonical: 'https://copycodeai.online/guides/data-flow-ai-feature/',
    pdfUrl: null
  }
];

const guidesBySlug = new Map<GuideSlug, GuideEntry>(guides.map((guide) => [guide.slug, guide] as const));

export function getGuideBySlug(slug: GuideSlug): GuideEntry | null {
  return guidesBySlug.get(slug) ?? null;
}

export function getPublishedGuides(referenceDate: Date = new Date()): GuideEntry[] {
  return guides
    .filter((guide) => new Date(guide.publishAt).getTime() <= referenceDate.getTime())
    .sort((left, right) => new Date(left.publishAt).getTime() - new Date(right.publishAt).getTime());
}

export function getRelatedGuides(slug: GuideSlug, limit = 2): GuideEntry[] {
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return [];
  }

  return guide.relatedGuides
    .map((relatedSlug) => getGuideBySlug(relatedSlug))
    .filter((relatedGuide): relatedGuide is GuideEntry => relatedGuide !== null)
    .slice(0, limit);
}
