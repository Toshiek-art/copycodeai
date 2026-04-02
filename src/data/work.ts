export type WorkStatus = 'Live' | 'Concept Demo' | 'Portfolio';

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
  lighthouse: {
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
    };
    mobile?: {
      src: string;
      alt: string;
    };
  };
}

export const workProjects: WorkProject[] = [
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
  }
];

export const selectedWorkIntro =
  'Two live sites and one transparent concept demo. Static screenshots, clear labels, and direct links keep the proof readable.';

export function getWorkProject(slug: string) {
  return workProjects.find((project) => project.slug === slug);
}
