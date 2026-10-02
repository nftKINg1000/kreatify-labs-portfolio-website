export const CONTACT_EMAIL = 'hello@kreatifylabs.com';

export interface Project {
  id: string;
  title: string;
  category: string;
  client: string;
  year: string;
  description: string;
  tags: string[];
  color: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'netflix',
    title: 'Netflix Brand Experience',
    category: 'Web Experience',
    client: 'Netflix',
    year: '2026',
    description:
      'Immersive brand storytelling with parallax scroll sequences, custom video transitions, and a fully responsive narrative flow that adapts beautifully across all devices.',
    tags: ['React', 'Next.js', 'Lenis', 'Framer Motion'],
    color: '#e50914',
  },
  {
    id: 'mclaren',
    title: 'McLaren Racing Hub',
    category: 'Interactive Platform',
    client: 'McLaren F1',
    year: '2026',
    description:
      'A high-performance platform displaying live telemetry, race results, and driver statistics with buttery-smooth scroll interactions and real-time data streaming.',
    tags: ['TypeScript', 'WebSockets', 'Canvas', 'Lenis'],
    color: '#ff8000',
  },
  {
    id: 'studio-void',
    title: 'Architectural Portfolio',
    category: 'Portfolio',
    client: 'Studio Void',
    year: '2025',
    description:
      'A refined portfolio showcasing architectural photography and blueprints through orchestrated scroll sequences, GSAP-powered transitions, and an editorial type system.',
    tags: ['Next.js', 'GSAP', 'Lenis', 'Prismic CMS'],
    color: '#8b5cf6',
  },
  {
    id: 'quantum',
    title: 'Quantum Finance Dashboard',
    category: 'Web Application',
    client: 'Quantum Finance',
    year: '2025',
    description:
      'A data-rich financial dashboard handling millions of data points, with custom chart components, keyboard shortcuts, role-based access, and a premium dark interface.',
    tags: ['React', 'Recharts', 'Tailwind', 'PostgreSQL'],
    color: '#06b6d4',
  },
  {
    id: 'maison-lumiere',
    title: 'Maison Lumière Lookbook',
    category: 'E-Commerce',
    client: 'Maison Lumière',
    year: '2026',
    description:
      'A luxury fashion storefront blending editorial photography with intuitive product discovery and a checkout flow as refined as the brand itself.',
    tags: ['Next.js', 'Shopify', 'Lenis', 'Framer Motion'],
    color: '#ec4899',
  },
  {
    id: 'pulse',
    title: 'Pulse Health Platform',
    category: 'Mobile & Web',
    client: 'Pulse Medtech',
    year: '2025',
    description:
      'A cross-platform health ecosystem connecting wearables with a web dashboard and native app, offering personalised insights powered by machine learning.',
    tags: ['React Native', 'Next.js', 'AI/ML', 'HealthKit'],
    color: '#10b981',
  },
];

export const WHY = {
  intro:
    'Most websites look the same and feel worse. We design and build web experiences that move with intent — fast, accessible, and remembered long after the first scroll.',
  points: [
    {
      title: 'Design that earns attention',
      body: 'Editorial layouts, bold typography, and art direction that gives your brand a point of view instead of another template.',
    },
    {
      title: 'Motion with purpose',
      body: 'Scroll-driven sequences, page transitions, and micro-interactions built on Lenis and GSAP — every movement guides the eye, none of it gets in the way.',
    },
    {
      title: 'Engineered for speed',
      body: 'React, Next.js, and TypeScript with performance budgets from day one. Smooth on a flagship phone, still smooth on a five-year-old laptop.',
    },
    {
      title: 'Systems that scale',
      body: 'Design tokens and component libraries that keep every new page consistent, so your team can ship without calling us for every change.',
    },
  ],
};

export const SERVICES = [
  'Strategy & art direction',
  'Design systems & UI kits',
  'Smooth scroll & motion',
  'WebGL & 3D experiences',
  'Headless CMS & commerce',
  'Performance & accessibility',
  'Launch & ongoing support',
];

export interface Template {
  title: string;
  category: string;
  description: string;
  link: string;
}

export const TEMPLATES: Template[] = [
  {
    title: 'Lenis React Starter',
    category: 'Scroll library',
    description: 'React & Next.js starter with Lenis smooth scroll, a shared RAF loop, and anchor navigation pre-configured.',
    link: 'https://github.com/darkroomengineering/lenis',
  },
  {
    title: 'Motion Portfolio Kit',
    category: 'Template',
    description: 'A minimal portfolio with page transitions, scroll-driven animation, and an editorial type scale.',
    link: '#work',
  },
  {
    title: 'Design System UI Kit',
    category: 'UI kit',
    description: 'Accessible React components styled for dark interfaces — buttons, cards, modals, and form elements.',
    link: '#services',
  },
];

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
    description: 'A custom web application with design system, animation, and CMS integration.',
    features: ['Custom design system', 'Advanced animation', 'CMS integration', 'Performance audit', '30-day support'],
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

export const ESTIMATOR_SERVICES = [
  { id: 'web-dev', name: 'Web development', price: 3500 },
  { id: 'motion', name: 'Motion & interaction design', price: 2500 },
  { id: 'design-system', name: 'Design system', price: 3000 },
  { id: 'full-app', name: 'Full-stack application', price: 5000 },
  { id: 'mobile', name: 'Mobile application', price: 5500 },
];
