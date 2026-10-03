/*
  Copy follows the KreatifyLabs brand guide v1.1 and the founder-supplied company profile.
  Rules that shape it: write "KreatifyLabs" in running text (the artwork reads KREATIFY);
  lead with the customer's problem; no invented clients, results, awards or testimonials;
  only link to work, bookings or services that exist.
*/

export const BRAND = {
  name: 'KreatifyLabs',
  descriptor: 'AI Product & Creative Technology Studio',
  descriptorLines: ['AI Product &', 'Creative Technology Studio'],
  headline: ['Intelligence,', 'made useful.'],
  signature: ['We design.', 'We build.', 'We automate.'],
  oneLiner:
    'KreatifyLabs designs, engineers and automates intelligent digital products for founders, startups and growth-focused businesses.',
};

export const CONTACT_EMAIL = 'hello@kreatifylabs.com';

export const CTA = {
  primary: 'Discuss your product',
  secondary: 'Explore our capabilities',
  technical: 'Review your prototype',
  automation: 'Map your workflow',
};

/** "Who we serve" — brand guide p.4, the customer need comes first. */
export const WHY = {
  intro:
    'KreatifyLabs works with businesses that need technology to solve a real operational or product problem, not technology for its own sake. We connect product thinking, full-stack development, creative technology and AI around your business goal.',
  points: [
    {
      title: 'Founders validating a product',
      body: 'A credible route from idea to MVP: discovery, architecture, prototyping and a scoped launch. We show decisions, assumptions and acceptance criteria before we promise speed.',
    },
    {
      title: 'Startups evolving a prototype',
      body: 'Dependable architecture beyond the demo: AI-assisted app migration, security review, data models, testing and production hardening.',
    },
    {
      title: 'Businesses improving operations',
      body: 'Fewer manual steps and reliable workflows: integrations, automation, audit trails and human approvals, measured against an agreed baseline.',
    },
    {
      title: 'How we behave',
      body: 'Useful before novel. Clear before complex. Responsible about automation. Accountable for delivery.',
    },
  ],
};

export interface Capability {
  id: string;
  index: string;
  title: string;
  summary: string;
  detail: string;
  stack: string[];
  cta: string;
  /** Composition of the supporting plane graphic on the card. */
  art: 'cut' | 'plane' | 'channel';
}

/** Six service families — brand guide p.5. */
export const CAPABILITIES: Capability[] = [
  {
    id: 'product-definition',
    index: '01',
    title: 'Product definition',
    summary: 'Idea validation, product development, architecture, prototypes and SaaS MVP planning.',
    detail:
      'We turn an idea into a scoped, testable plan: who it is for, what the first release must do, how it is built and how we will know it works. You leave with an architecture, a prototype and acceptance criteria.',
    stack: ['Discovery', 'Architecture', 'Prototypes', 'SaaS MVP'],
    cta: 'Discuss your product',
    art: 'cut',
  },
  {
    id: 'ai-engineering',
    index: '02',
    title: 'AI engineering',
    summary: 'AI SaaS, AI products, AI agents, multi-agent systems and AI integrations.',
    detail:
      'An AI agent is software that can plan and take steps toward a goal using a language model. We design agents with clear permissions, visible costs and human approval before any external action.',
    stack: ['AI SaaS', 'AI agents', 'Multi-agent systems', 'AI integrations'],
    cta: 'Discuss your product',
    art: 'plane',
  },
  {
    id: 'product-engineering',
    index: '03',
    title: 'Product engineering',
    summary: 'Full-stack web applications, mobile apps, backend systems, authentication and databases.',
    detail:
      'From UI engineering to backend services, databases and authentication, we build products that are maintainable after launch, not just impressive in a demo.',
    stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Flutter'],
    cta: 'Discuss your product',
    art: 'channel',
  },
  {
    id: 'business-automation',
    index: '04',
    title: 'Business automation',
    summary: 'AI and process automation, n8n workflows, APIs and third-party platform integrations.',
    detail:
      'We map the workflow before choosing the tools, then automate the repetitive steps with integrations, audit trails and a human check where it matters.',
    stack: ['n8n', 'APIs', 'Integrations', 'Process automation'],
    cta: 'Map your workflow',
    art: 'plane',
  },
  {
    id: 'creative-technology',
    index: '05',
    title: 'Creative technology',
    summary: 'Interactive 3D websites, Three.js, WebGL, immersive experiences and purposeful GSAP motion.',
    detail:
      'Spatial, interactive experiences that still read clearly without the effects. We budget geometry for the target device, respect reduced motion and always ship a fallback.',
    stack: ['Three.js', 'WebGL', 'GSAP', 'Interactive 3D'],
    cta: 'Discuss your product',
    art: 'cut',
  },
  {
    id: 'production-evolution',
    index: '06',
    title: 'Production evolution',
    summary:
      'Vibe-coded application development, prototype migration, optimisation, hardening, cloud infrastructure and deployment.',
    detail:
      'We take applications built with AI-assisted and vibe-coding platforms and turn them into robust production systems with stronger architecture, security, scalability and performance.',
    stack: ['Prototype migration', 'Hardening', 'Cloud', 'Deployment'],
    cta: 'Review your prototype',
    art: 'channel',
  },
];

/** Lifecycle — brand guide p.5: Define > Design > Engineer > Validate > Deploy > Evolve. */
export const LIFECYCLE = [
  { step: 'Define', body: 'Validate the idea, the users and the business case.' },
  { step: 'Design', body: 'Shape the product, the flows and the interface.' },
  { step: 'Engineer', body: 'Build the frontend, backend, data and AI layers.' },
  { step: 'Validate', body: 'Test against the acceptance checks we agreed.' },
  { step: 'Deploy', body: 'Ship to production with monitoring in place.' },
  { step: 'Evolve', body: 'Optimise, harden and extend as you grow.' },
];

/** Full capability list supplied by the founder — brand guide p.31. */
export const CAPABILITY_LIST = [
  'AI SaaS development',
  'AI product development',
  'AI agents and multi-agent systems',
  'Full-stack web application development',
  'Mobile app development',
  'AI and business process automation',
  'Interactive 3D website development',
  'Three.js, WebGL and immersive web experiences',
  'API and third-party platform integrations',
  'SaaS MVP development',
  'Backend systems and database architecture',
  'Vibe-coded application development',
  'Prototype-to-production migration',
  'Application optimisation and production hardening',
  'Cloud deployment and infrastructure',
];

export const TECH_STACK = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Supabase',
  'Firebase',
  'PostgreSQL',
  'Three.js',
  'WebGL',
  'GSAP',
  'Flutter',
  'n8n',
];

/** The studio's own tiers, prices and inclusions; only casing changed (brand voice: sentence case). */
export const PRICING = [
  {
    label: 'Project',
    price: '$4,500',
    suffix: '/ project',
    description: 'A focused 2–3 week engagement for landing pages and marketing sites.',
    features: ['Responsive design', 'Smooth scroll setup', 'SEO optimisation', 'Launch support'],
    highlighted: false,
  },
  {
    label: 'Product',
    price: '$9,800',
    suffix: '/ project',
    description: 'A full custom web application with design system, animations and CMS integration.',
    features: ['Custom design system', 'Advanced animations', 'CMS integration', 'Performance audit', '30-day support'],
    highlighted: true,
  },
  {
    label: 'Retainer',
    price: '$12,000',
    suffix: '/ month',
    description: 'A dedicated team embedded in your workflow for ongoing development and iteration.',
    features: ['Senior developers', 'Weekly sprints', 'Unlimited revisions', 'Priority support'],
    highlighted: false,
  },
];

/** The studio's original estimator items and prices (unchanged amounts). */
export const ESTIMATOR_SERVICES = [
  { id: 'web-dev', name: 'Web application development', price: 3500 },
  { id: 'motion', name: 'Creative technology & motion', price: 2500 },
  { id: 'design-system', name: 'Design system', price: 3000 },
  { id: 'full-app', name: 'Full-stack application', price: 5000 },
  { id: 'mobile', name: 'Mobile application', price: 5500 },
];
