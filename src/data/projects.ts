export type Project = {
  slug: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft' | 'archived';
  visible: boolean;
  navVisible?: boolean;
  cover?: string;
  metrics?: { label: string; value: string }[];
  gallery?: string[];
};

export const projects: Project[] = [
  {
    slug: 'copycodeart-admin',
    title: 'CopyCodeArt Admin & Access',
    excerpt:
      'Hardening del pannello /admin con Cloudflare Zero Trust (Google + OTP), flusso pulito e SSG su Pages.',
    status: 'published',
    visible: true,
    cover: '/og-default.png',
    metrics: [
      { label: 'Login', value: 'Google + OTP' },
      { label: 'Build', value: 'Astro → CF Pages' }
    ],
    gallery: []
  },
  {
    slug: 'ai-visuals-studies',
    title: 'AI Visual Studies',
    excerpt:
      'Studio di stile per visual AI ibridi: linee audaci, contrasti morbidi, bagliori come metafora di idee.',
    status: 'published',
    visible: true,
    cover: '/og-default.png',
    metrics: [
      { label: 'Output', value: 'Series v0' },
      { label: 'Focus', value: 'Stile & coerenza' }
    ]
  }
];
