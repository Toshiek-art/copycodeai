export type FaqGroupKey =
  | 'complianceReadyLanding'
  | 'aiFeatureIntegration'
  | 'eaaStructuralHardening';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  key: FaqGroupKey;
  title: string;
  intro: string;
  items: FaqItem[];
  pagePath: '/compliance-ready-landing' | '/ai-feature-integration' | '/eaa-structural-hardening';
  schemaName?: string;
  schemaDescription?: string;
}

export const faqGroups = {
  complianceReadyLanding: {
    key: 'complianceReadyLanding',
    title: 'FAQ',
    intro: 'Quick answers on who this fits, scope, compliance boundaries, and delivery.',
    pagePath: '/compliance-ready-landing',
    schemaName: 'Compliance-Ready Landing Page FAQ',
    schemaDescription:
      'Quick answers about scope, compliance boundaries, delivery, and implementation for the Compliance-Ready Landing Page service.',
    items: [
      {
        question: 'Is this GDPR compliance?',
        answer: 'This is structural engineering aligned with GDPR principles. It is not legal advice.'
      },
      {
        question: 'Do you provide an Accessibility Statement?',
        answer: 'I provide a technical summary and implementation notes. Official responsibility remains with your company.'
      },
      {
        question: 'What’s included in “EAA/WCAG-aware UX”?',
        answer: 'Keyboard, focus, semantics, forms, and contrast readiness checks are included. This is not a certification.'
      },
      {
        question: 'Can you work with my existing site?',
        answer: 'Yes. It works for startups and other digital businesses with an existing site, landing page, or launch flow. Scope and timeline depend on your current stack and implementation quality.'
      },
      {
        question: 'Do you implement cookies and analytics?',
        answer:
          'Yes. I can wire a consent-aware setup where analytics only load after opt-in, while the default experience stays minimal.'
      },
      {
        question: 'Do you build the design too?',
        answer: 'I can deliver a clean startup layout or implement your provided Figma design.'
      },
      {
        question: 'What do you need from us to start?',
        answer: 'A one-liner about your product, target audience, CTA goal, brand assets, and policy links.'
      },
      {
        question: 'Can you add AI to the landing?',
        answer: 'Yes, only when it improves conversion or reduces manual work.'
      }
    ]
  },
  aiFeatureIntegration: {
    key: 'aiFeatureIntegration',
    title: 'FAQ',
    intro: 'Quick answers on who this fits, scope, compliance boundaries, and delivery.',
    pagePath: '/ai-feature-integration',
    schemaName: 'AI Feature Integration FAQ',
    schemaDescription:
      'Quick answers about platform integrations, personal data, reliability, scope, and delivery for AI Feature Integration work.',
    items: [
      {
        question: 'Do you only work with AI startups?',
        answer: 'No. AI is a specialization, but the same launch-risk work also applies to other digital businesses with forms, booking flows, analytics, ecommerce, or accessibility-sensitive journeys.'
      },
      {
        question: 'Do you build chatbots?',
        answer: 'Only when it solves a real workflow. The focus is automation, not demos.'
      },
      {
        question: 'What platforms do you integrate with?',
        answer: 'Scope-dependent. Typical integrations include email, helpdesk, CRM, internal tools, and APIs.'
      },
      {
        question: 'How do you handle personal data?',
        answer: 'By minimizing data and defining clear boundaries aligned with GDPR principles. Not legal advice.'
      },
      {
        question: 'Do you host the AI?',
        answer: 'It depends on your stack. I can integrate with provider-hosted services or your infrastructure.'
      },
      {
        question: 'What do you need from us?',
        answer: 'Workflow description, inputs/outputs, tools, access, and technical constraints.'
      },
      {
        question: 'Can this start without high volume?',
        answer: 'Yes. We prioritize highest-leverage automation first and keep scope lean.'
      },
      {
        question: 'What about reliability?',
        answer: 'Guardrails, validation, and fallback behavior are implemented where needed.'
      },
      {
        question: 'How is scope fixed?',
        answer: 'By agreeing specific workflow(s) and deliverables within the delivery window.'
      }
    ]
  },
  eaaStructuralHardening: {
    key: 'eaaStructuralHardening',
    title: 'FAQ',
    intro: 'Quick answers on who this fits, scope, compliance boundaries, and delivery.',
    pagePath: '/eaa-structural-hardening',
    schemaName: 'EAA Structural Hardening FAQ',
    schemaDescription:
      'Quick answers about technical accessibility readiness, structural fixes, and delivery for EAA Structural Hardening work.',
    items: [
      {
        question: 'Is this legal EAA compliance?',
        answer: 'No. This is technical readiness and structural fixes aligned with EAA/WCAG expectations. It is not legal advice.'
      },
      {
        question: 'Do you test with screen readers?',
        answer: 'Yes, basic practical checks can be included. Scope depends on the project; focus is structural readiness.'
      },
      {
        question: 'What does “structural fixes” mean?',
        answer: 'Semantics, labels, focus order, navigation patterns, and related interaction structure fixes.'
      },
      {
        question: 'Can you work on my existing stack?',
        answer: 'Yes. It works for startups and other digital businesses with an existing website or product flow. Scope depends on your current stack and implementation constraints.'
      },
      {
        question: 'Will you change the design?',
        answer: 'Only minimal visual changes when needed to fix accessibility-critical issues.'
      },
      {
        question: 'What do you need from us?',
        answer: 'A live URL, critical flows, target audience context, and any known issues.'
      },
      {
        question: 'Do you provide an accessibility statement?',
        answer: 'I provide a technical summary and implementation notes only.'
      },
      {
        question: 'How do you define scope?',
        answer: 'Fixed window with an agreed list of fixes and deliverables.'
      }
    ]
  }
} satisfies Record<FaqGroupKey, FaqGroup>;

export const faqGroupsList = Object.values(faqGroups);

export function getFaqGroupByKey(key: FaqGroupKey): FaqGroup {
  return faqGroups[key];
}

export function getFaqGroups(): FaqGroup[] {
  return faqGroupsList;
}
