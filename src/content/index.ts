/*
  Site content. Sources: the KreatifyLabs brand guide v1.1 and founder-supplied
  company profile, plus the studio's own pricing. Rules:
  - write "KreatifyLabs" in prose (the artwork reads KREATIFY);
  - no invented clients, case studies, metrics, testimonials, awards or policies;
  - unconfirmed policy/proof carries `ownerInput` and is hidden from production.
*/
import type {
  AudienceFit,
  Capability,
  CaseStudy,
  FaqItem,
  LifecycleStage,
  NavItem,
  NextStep,
  OwnerReviewable,
  PricingTier,
  ValidationPractice,
  WorkingPractice,
} from './types';

/** Show owner-input items only in development, where they carry a visible badge. */
export function published<T extends OwnerReviewable>(items: readonly T[], showDrafts = import.meta.env.DEV): T[] {
  return items.filter((item) => showDrafts || !item.ownerInput);
}

export const BRAND = {
  name: 'KreatifyLabs',
  descriptor: 'AI Product & Creative Technology Studio',
  headline: ['Intelligence,', 'made useful.'] as const,
  signature: ['We design.', 'We build.', 'We automate.'] as const,
  valueProposition:
    'We design, engineer and automate intelligent digital products for founders, startups and growth-focused businesses.',
  boilerplate:
    'KreatifyLabs combines AI engineering, full-stack development, creative technology and automation to turn ideas and complex business problems into production-ready digital systems.',
};

/** From the original site. Owner to confirm the inbox is monitored before launch. */
export const CONTACT_EMAIL = 'hello@kreatifylabs.com';

export const CTA = {
  primary: 'Discuss your product',
  secondary: 'Explore our capabilities',
  technical: 'Review your prototype',
  automation: 'Map your workflow',
};

export const NAV: NavItem[] = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Approach', href: '#approach' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

/** Hero credibility cues: statements about how the studio works, all from the brand guide. */
export const HERO_CUES = [
  'Six capability families, one delivery lifecycle',
  'Acceptance checks agreed before build',
  'Human approval before automation acts',
];

export const PRINCIPLES = [
  'Useful before novel.',
  'Clear before complex.',
  'Responsible about automation.',
  'Accountable for delivery.',
];

export const AUDIENCE: AudienceFit[] = [
  {
    title: 'Founders validating a product',
    need: 'A credible route from idea to MVP.',
    help: 'We run discovery, shape the architecture, build a prototype and scope a launch — and write down the decisions, assumptions and acceptance criteria before promising speed.',
  },
  {
    title: 'Startups evolving a prototype',
    need: 'Dependable architecture beyond the demo.',
    help: 'We migrate AI-assisted and vibe-coded apps into maintainable systems: security review, data models, testing and production hardening.',
  },
  {
    title: 'Businesses improving operations',
    need: 'Fewer manual steps and reliable workflows.',
    help: 'We map the workflow first, then automate it with integrations, audit trails and human approvals, measured against an agreed baseline.',
  },
];

export const CAPABILITIES: Capability[] = [
  {
    id: 'product-definition',
    index: '01',
    title: 'Product definition',
    outcome: 'A scoped, testable plan for what to build first and why.',
    deliverables: ['Discovery findings', 'Product architecture', 'Clickable or working prototype', 'MVP scope with acceptance criteria'],
    suitedTo: ['New products and SaaS MVPs', 'Ideas that need validating before a full build'],
    detail:
      'An MVP (minimum viable product) is the smallest release that tests the core idea with real users. We define who it is for, what the first release must do and how we will know it works.',
    art: 'cut',
  },
  {
    id: 'ai-engineering',
    index: '02',
    title: 'AI engineering',
    outcome: 'AI features and agents that do useful work under human control.',
    deliverables: ['AI product and SaaS features', 'Agents and multi-agent systems', 'Integrations with modern AI platforms', 'Review and approval steps'],
    suitedTo: ['Adding AI to an existing product', 'AI-first SaaS products', 'Internal assistants'],
    detail:
      'An AI agent is software that plans and takes steps toward a goal using a language model. We design agents with clear permissions, visible costs and failure paths, and a human approval before any external action.',
    art: 'plane',
  },
  {
    id: 'product-engineering',
    index: '03',
    title: 'Product engineering',
    outcome: 'Full-stack web and mobile products that stay maintainable after launch.',
    deliverables: ['Web applications', 'Mobile apps', 'Backend systems and databases', 'Authentication and APIs'],
    suitedTo: ['Customer-facing products', 'Internal tools', 'Platforms with accounts and data'],
    detail: 'Typical stack: React, Next.js, TypeScript, Node.js, Supabase, Firebase, PostgreSQL and Flutter — chosen to fit the problem, not as endorsements.',
    art: 'channel',
  },
  {
    id: 'business-automation',
    index: '04',
    title: 'Business automation',
    outcome: 'Fewer manual steps, with an audit trail and a human check where it matters.',
    deliverables: ['Workflow map and baseline', 'AI and process automation', 'n8n workflows', 'API and third-party integrations'],
    suitedTo: ['Repetitive operations work', 'Disconnected tools and data', 'Approval-heavy processes'],
    detail: 'We map the task before choosing the tools. n8n is a workflow-automation platform that connects apps and APIs; we use it where it fits.',
    art: 'plane',
  },
  {
    id: 'creative-technology',
    index: '05',
    title: 'Creative technology',
    outcome: 'Interactive and 3D web experiences that still read clearly without the effects.',
    deliverables: ['Interactive 3D websites', 'Three.js and WebGL scenes', 'Purposeful GSAP motion', 'Still-image and reduced-motion fallbacks'],
    suitedTo: ['Launches and brand stories', 'Product demonstrations', 'Immersive marketing sites'],
    detail: 'WebGL is the browser technology for real-time 3D. We budget geometry for the target device, pause scenes outside the viewport and respect reduced-motion settings.',
    art: 'cut',
  },
  {
    id: 'production-evolution',
    index: '06',
    title: 'Production evolution',
    outcome: 'Prototypes turned into robust production systems.',
    deliverables: ['Prototype review', 'Migration and hardening', 'Optimisation', 'Cloud infrastructure and deployment'],
    suitedTo: ['Apps built with AI-assisted or vibe-coding tools', 'Products that outgrew their first version'],
    detail: '“Vibe-coded” describes software generated quickly with AI assistance. We strengthen its architecture, security, scalability, performance and maintainability.',
    art: 'channel',
  },
];

export const TECH_STACK = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Supabase', 'Firebase', 'PostgreSQL', 'Three.js', 'WebGL', 'GSAP', 'Flutter', 'n8n'];

/** "How we validate delivery" — practices from the brand guide, in place of unverified social proof. */
export const VALIDATION: ValidationPractice[] = [
  {
    title: 'Decisions written down first',
    body: 'Scope, assumptions and acceptance criteria are agreed before build, so progress is measured against something concrete.',
  },
  {
    title: 'Acceptance checks, not demos',
    body: 'Each release is validated against the checks we agreed. A good-looking screen is not the finish line.',
  },
  {
    title: 'Humans approve automated actions',
    body: 'Automations and agents prepare drafts; your team approves anything that reaches the outside world. Draft, awaiting review, approved and executed are always distinguishable.',
  },
  {
    title: 'Works without the effects',
    body: 'Motion and 3D are additions, not requirements: essential content stays readable with reduced motion, without WebGL and by keyboard — including on this site.',
  },
];

/** Verified, client-approved work only. Empty until the owner supplies real case studies. */
export const CASE_STUDIES: CaseStudy[] = [];

export const LIFECYCLE: LifecycleStage[] = [
  { step: 'Define', purpose: 'Validate the idea, the users and the business case.', outputs: ['Scope and assumptions', 'Acceptance criteria', 'Risks and open questions'] },
  { step: 'Design', purpose: 'Shape the product, its flows and its interface.', outputs: ['User flows', 'Interface design', 'Prototype for review'] },
  { step: 'Engineer', purpose: 'Build the frontend, backend, data and AI layers.', outputs: ['Working software in increments', 'Data model and integrations'] },
  { step: 'Validate', purpose: 'Test the product against the acceptance checks.', outputs: ['Acceptance results', 'Fixes before release'] },
  { step: 'Deploy', purpose: 'Release to production.', outputs: ['Production release', 'Deployment configuration'] },
  { step: 'Evolve', purpose: 'Optimise, harden and extend as you grow.', outputs: ['Improvements from real use', 'Ongoing support options'] },
];

export const WORKING_PRACTICES: WorkingPractice[] = [
  {
    title: 'Risk management',
    body: 'We define the launch scope, identify the risks and agree the acceptance checks before work starts.',
  },
  {
    title: 'Acceptance criteria',
    body: 'Every milestone is judged against written criteria you approved, not against opinion.',
  },
  {
    title: 'Communication cadence',
    body: 'Retainer clients work in weekly sprints. Cadence for project engagements is agreed in the proposal.',
  },
  {
    title: 'After launch',
    body: 'Product engagements include 30 days of support; the retainer covers ongoing development and iteration.',
  },
];

export const PRICING_META = {
  currency: 'USD',
  currencyLabel: 'US$',
  /** Owner to confirm currency and basis before launch. */
  note: 'Indicative prices in US dollars. Final scope and price are confirmed in a written proposal before work starts.',
};

export const PRICING: PricingTier[] = [
  {
    id: 'project',
    label: 'Project',
    amount: 4500,
    unit: 'project',
    basis: 'indicative',
    summary: 'A focused 2–3 week engagement for landing pages and marketing sites.',
    bestFor: 'A defined, single deliverable with a clear deadline.',
    includes: ['Responsive design', 'Smooth scroll setup', 'SEO optimisation', 'Launch support'],
    excludes: [],
  },
  {
    id: 'product',
    label: 'Product',
    amount: 9800,
    unit: 'project',
    basis: 'indicative',
    summary: 'A full custom web application with design system, animations and CMS integration.',
    bestFor: 'A new product or a prototype that needs to become production software.',
    includes: ['Custom design system', 'Advanced animations', 'CMS integration', 'Performance audit', '30-day support'],
    excludes: [],
    highlighted: true,
  },
  {
    id: 'retainer',
    label: 'Retainer',
    amount: 12000,
    unit: 'month',
    basis: 'indicative',
    summary: 'A dedicated team embedded in your workflow for ongoing development and iteration.',
    bestFor: 'Continuous product work after launch, or several streams at once.',
    includes: ['Senior developers', 'Weekly sprints', 'Unlimited revisions', 'Priority support'],
    excludes: [],
  },
];

export const FAQ: FaqItem[] = [
  {
    question: 'How long does an engagement take?',
    answer:
      'A focused Project engagement typically runs 2–3 weeks. Larger products are scoped during discovery, and the proposal sets out milestones before work starts.',
  },
  {
    question: 'Who owns the code and intellectual property?',
    answer: 'Owner to confirm the ownership and IP terms offered to clients.',
    ownerInput: 'IP/ownership policy',
  },
  {
    question: 'Can you review a prototype we already have?',
    answer:
      'Yes. Prototype-to-production work is one of our six capability families: we review architecture, security, data models and testing, then recommend and carry out hardening.',
  },
  {
    question: 'How do you handle AI, data and privacy?',
    answer:
      'Agents and automations prepare drafts and actions; your team approves anything external before it runs. Tool permissions, costs and failure paths are made visible in the product.',
  },
  {
    question: 'What data-protection terms apply to client data?',
    answer: 'Owner to confirm data-processing terms (storage, retention, sub-processors).',
    ownerInput: 'Data-processing policy',
  },
  {
    question: 'Do you offer ongoing support?',
    answer: 'Product engagements include 30 days of support after launch. For continuous work, the Retainer embeds a dedicated team in weekly sprints.',
  },
  {
    question: 'What is the working relationship like?',
    answer:
      'We share decisions, assumptions and acceptance criteria in writing and review progress against them with you at each lifecycle stage.',
  },
  {
    question: 'How do pricing and scope changes work?',
    answer:
      'The prices shown are indicative. Scope, price and acceptance checks are confirmed in a written proposal before work starts.',
  },
  {
    question: 'What happens if the scope changes mid-project?',
    answer: 'Owner to confirm the change-request process and how it affects price and timeline.',
    ownerInput: 'Change-request policy',
  },
];

export const NEXT_STEPS: NextStep[] = [
  { title: 'Tell us what you are building', body: 'A short form: your goal, the stage you are at and how to reach you.' },
  { title: 'We review your enquiry', body: 'We read it and reply by email with questions or a time to talk.' },
  {
    title: 'Agree scope before work starts',
    body: 'If it is a fit, we define the scope, identify the risks and agree the acceptance checks in a written proposal.',
  },
];
