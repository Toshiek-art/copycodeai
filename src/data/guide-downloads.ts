export type GuideDownloadSlug =
  | 'gdpr-ai-startup'
  | 'eaa-startup-websites'
  | 'data-flow-ai-feature';

export interface GuideDownloadEntry {
  slug: GuideDownloadSlug;
  title: string;
  pdfUrl: string;
  returnTo: `/guides/${GuideDownloadSlug}/`;
  successCopy: string;
}

export const guideDownloads = {
  'gdpr-ai-startup': {
    slug: 'gdpr-ai-startup',
    title: 'GDPR for AI startups: the launch decisions that matter early',
    pdfUrl: '/downloads/guides/gdpr-ai-startup.pdf',
    returnTo: '/guides/gdpr-ai-startup/',
    successCopy: 'Your GDPR guide is ready. Check your inbox and download area.'
  },
  'eaa-startup-websites': {
    slug: 'eaa-startup-websites',
    title: 'EAA for startups: what actually matters before launch',
    pdfUrl: '/downloads/guides/eaa-startup-websites.pdf',
    returnTo: '/guides/eaa-startup-websites/',
    successCopy: 'Your EAA guide is ready. Check your inbox and download area.'
  },
  'data-flow-ai-feature': {
    slug: 'data-flow-ai-feature',
    title: 'AI data flow: where features quietly get complicated',
    pdfUrl: '/downloads/guides/data-flow-ai-feature.pdf',
    returnTo: '/guides/data-flow-ai-feature/',
    successCopy: 'Your data flow guide is ready. Check your inbox and download area.'
  }
} satisfies Record<GuideDownloadSlug, GuideDownloadEntry>;

export function getGuideDownloadBySlug(slug: GuideDownloadSlug): GuideDownloadEntry {
  return guideDownloads[slug];
}

export function getGuideDownloads(): GuideDownloadEntry[] {
  return Object.values(guideDownloads);
}

