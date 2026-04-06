export type WorkStatus = 'Live' | 'Concept Demo' | 'Portfolio Build';

export interface WorkProject {
  slug: string;
  title: string;
  typeLabel: string;
  status: WorkStatus;
  href: string;
  summary: string;
  bullets: string[];
  previewLabel: string;
  previewNote: string;
  previewTone: 'emerald' | 'slate' | 'amber';
  linkLabel: string;
  lighthouse?: {
    label: string;
    scoreText: string;
    href: string;
    alt: string;
    thumbnail: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
  };
  screenshots?: {
    desktop?: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
    mobile?: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
  };
}

export const workProjects: WorkProject[] = [
  {
    slug: 'aqualume',
    title: 'Aqualume',
    typeLabel: 'Live site',
    status: 'Live',
    href: 'https://aqualume-seven.vercel.app/',
    summary: 'A premium medical aesthetics and wellness site with strong mobile hierarchy, calm aqua visuals, and clean consultation flow.',
    bullets: [
      'Homepage, treatments, and booking flow are presented as a polished clinic proposal.',
      'Responsive screenshots keep the live delivery easy to review at a glance.',
      'Lighthouse audit is linked directly from the project card for quick verification.'
    ],
    previewLabel: 'Live site',
    previewNote: 'Medical aesthetics and wellness proposal',
    previewTone: 'emerald',
    linkLabel: 'Open live site',
    lighthouse: {
      label: 'Latest audited run',
      scoreText: '100 / 100 / 100 / 100',
      href: '/screenshots/aqualume-clinic/aqualume-seven.png',
      alt: 'Aqualume Lighthouse report screenshot showing 100 scores for performance, accessibility, best practices, and SEO',
      thumbnail: {
        src: '/screenshots/aqualume-clinic/aqualume-seven.png',
        width: 582,
        height: 1073,
        alt: 'Aqualume Lighthouse report thumbnail'
      }
    },
    screenshots: {
      desktop: {
        src: '/screenshots/aqualume-clinic/aqualume-home-desktop.png',
        alt: 'Aqualume desktop homepage screenshot showing the clinic proposal and premium aqua wellness direction',
        width: 1440,
        height: 900
      },
      mobile: {
        src: '/screenshots/aqualume-clinic/aqualume-home-mobile.png',
        alt: 'Aqualume mobile homepage screenshot showing the clinic proposal and premium aqua wellness direction',
        width: 390,
        height: 844
      }
    }
  },
  {
    slug: 'toyb',
    title: 'Toyb',
    typeLabel: 'Live site',
    status: 'Live',
    href: 'https://toyb.space/',
    summary: 'Product positioning and launch structure with a clear primary path and lean execution.',
    bullets: [
      'Product positioning made explicit at the top of the page.',
      'Launch structure keeps the primary workflow easy to follow.',
      'Lean implementation keeps the page readable on small screens.'
    ],
    previewLabel: 'Live site',
    previewNote: 'Product positioning and launch structure',
    previewTone: 'emerald',
    linkLabel: 'Open live site',
    lighthouse: {
      label: 'Latest audited run',
      scoreText: '100 / 100 / 100 / 100',
      href: '/screenshots/toyb/lighthouse.png',
      alt: 'Toyb Lighthouse report screenshot showing 100 scores for performance, accessibility, best practices, and SEO',
      thumbnail: {
        src: '/screenshots/toyb/lighthouse.png',
        width: 582,
        height: 1073,
        alt: 'Toyb Lighthouse report thumbnail'
      }
    },
    screenshots: {
      desktop: {
        src: '/screenshots/toyb/toyb-landing-desktop.png',
        alt: 'Toyb landing page screenshot showing product positioning and launch structure',
        width: 1440,
        height: 3600
      },
      mobile: {
        src: '/screenshots/toyb/toyb-landing-mobile.png',
        alt: 'Toyb mobile landing page screenshot showing the primary launch path',
        width: 390,
        height: 1600
      }
    }
  },
  {
    slug: 'coherence-mind',
    title: 'Coherence Mind',
    typeLabel: 'Live site',
    status: 'Live',
    href: 'https://coherencemind.net/',
    summary: 'Structured content and knowledge architecture implemented with accessibility-aware navigation and clear hierarchy.',
    bullets: [
      'Structured content hierarchy keeps the information model readable.',
      'Navigation and semantics stay predictable across the page.',
      'Accessibility-aware implementation supports clarity and reuse.'
    ],
    previewLabel: 'Live site',
    previewNote: 'Structured content and knowledge architecture',
    previewTone: 'slate',
    linkLabel: 'Open live site',
    lighthouse: {
      label: 'Latest audited run',
      scoreText: '100 / 100 / 100 / 100',
      href: '/screenshots/coherence-mind/lighthouse.png',
      alt: 'Coherence Mind Lighthouse report screenshot showing 100 scores for performance, accessibility, best practices, and SEO',
      thumbnail: {
        src: '/screenshots/coherence-mind/lighthouse.png',
        width: 582,
        height: 1073,
        alt: 'Coherence Mind Lighthouse report thumbnail'
      }
    },
    screenshots: {
      desktop: {
        src: '/screenshots/coherence-mind/desktop.png',
        alt: 'Coherence Mind home page screenshot showing structured content and knowledge architecture',
        width: 1440,
        height: 3349
      },
      mobile: {
        src: '/screenshots/coherence-mind/mobile.png',
        alt: 'Coherence Mind mobile home page screenshot showing the condensed content hierarchy',
        width: 390,
        height: 5404
      }
    }
  },
  {
    slug: 'pasta-lab',
    title: 'Pasta Lab',
    typeLabel: 'Hospitality concept',
    status: 'Concept Demo',
    href: 'https://pastalab-tallinn.vercel.app/',
    summary: 'A fictional restaurant site used to demonstrate multilingual entry, booking UX, and hospitality concept branding.',
    bullets: [
      'Multilingual entry keeps the booking path easy to find.',
      'Reservation flow stays visible and usable on mobile.',
      'The concept is labeled clearly as a demo, not a client case.'
    ],
    previewLabel: 'Concept demo',
    previewNote: 'Multilingual entry and booking UX',
    previewTone: 'amber',
    linkLabel: 'Open demo site',
    lighthouse: {
      label: 'Latest audited run',
      scoreText: '100 / 100 / 100 / 100',
      href: '/screenshots/pastalab-tallinn/lighthouse.png',
      alt: 'Pasta Lab Lighthouse report screenshot showing 100 scores for performance, accessibility, best practices, and SEO',
      thumbnail: {
        src: '/screenshots/pastalab-tallinn/lighthouse.png',
        width: 582,
        height: 1073,
        alt: 'Pasta Lab Lighthouse report thumbnail'
      }
    },
    screenshots: {
      desktop: {
        src: '/screenshots/pastalab-tallinn/home-en-desktop.png',
        alt: 'Pasta Lab concept demo screenshot showing multilingual hospitality branding and reservation entry',
        width: 1440,
        height: 900
      },
      mobile: {
        src: '/screenshots/pastalab-tallinn/home-en-mobile.png',
        alt: 'Pasta Lab mobile concept demo screenshot showing the booking and language entry flow',
        width: 390,
        height: 844
      }
    }
  },
  {
    slug: 'auditlab',
    title: 'AuditLab',
    typeLabel: 'Portfolio build',
    status: 'Portfolio Build',
    href: 'https://auditlab.vercel.app/',
    summary: 'A public portfolio build that shows audit-style presentation, transparent labels, and a mobile-first proof-of-work layout.',
    bullets: [
      'Portfolio build, not a client engagement.',
      'Static desktop and mobile screenshots keep the proof easy to scan.',
      'The labels stay explicit so the scope reads credibly.'
    ],
    previewLabel: 'Portfolio build',
    previewNote: 'Audit-style presentation with transparent scope',
    previewTone: 'slate',
    linkLabel: 'Open portfolio build',
    lighthouse: {
      label: 'Latest audited run',
      scoreText: '100 / 100 / 100 / 100',
      href: '/screenshots/audiolab/Screen Shot 2026-04-04 at 10.25.05.png',
      alt: 'AuditLab Lighthouse report screenshot showing 100 scores for performance, accessibility, best practices, and SEO',
      thumbnail: {
        src: '/screenshots/audiolab/Screen Shot 2026-04-04 at 10.25.05.png',
        width: 582,
        height: 1073,
        alt: 'AuditLab Lighthouse report thumbnail'
      }
    },
    screenshots: {
      desktop: {
        src: '/screenshots/audiolab/auditlab-home-desktop.webp',
        alt: 'AuditLab desktop home screenshot showing the portfolio build and audit-focused presentation',
        width: 1440,
        height: 5200
      },
      mobile: {
        src: '/screenshots/audiolab/auditlab-home-mobile.webp',
        alt: 'AuditLab mobile home screenshot showing the portfolio build and audit-focused presentation',
        width: 390,
        height: 6200
      }
    }
  }
];

export const selectedWorkIntro =
  'Two live sites, one transparent concept demo, and one public portfolio build. Static screenshots, clear labels, and direct links keep the proof readable.';

export function getWorkProject(slug: string) {
  return workProjects.find((project) => project.slug === slug);
}
