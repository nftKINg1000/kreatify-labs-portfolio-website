import type { EngagementId, ServiceId } from '../shared/lead';

/**
 * Anything marked `ownerInput` states business policy or proof that has not been
 * confirmed by KreatifyLabs. It is hidden from production builds and shown in
 * development with an "Owner input required" badge (see `published()`).
 */
export interface OwnerReviewable {
  ownerInput?: string;
}

export interface NavItem {
  label: string;
  href: `#${string}`;
}

export interface AudienceFit extends OwnerReviewable {
  title: string;
  need: string;
  /** Plain-language description of how KreatifyLabs helps. */
  help: string;
}

export interface Capability {
  id: ServiceId;
  index: string;
  title: string;
  outcome: string;
  /** What a client receives. */
  deliverables: string[];
  /** Project types this suits. */
  suitedTo: string[];
  /** Jargon or scope notes, disclosed progressively. */
  detail: string;
  art: 'cut' | 'plane' | 'channel';
}

export interface ValidationPractice extends OwnerReviewable {
  title: string;
  body: string;
}

export interface CaseStudy {
  /** Only add verified, client-approved work. */
  title: string;
  client: string;
  problem: string;
  approach: string;
  outcome: string;
  href?: string;
}

export interface LifecycleStage {
  step: string;
  purpose: string;
  outputs: string[];
}

export interface WorkingPractice extends OwnerReviewable {
  title: string;
  body: string;
}

export type PriceBasis = 'fixed' | 'starting-at' | 'typical-range' | 'indicative';

export interface PricingTier {
  id: Exclude<EngagementId, 'unsure'>;
  label: string;
  /** Amount in whole currency units (see PRICING_META.currency). */
  amount: number;
  unit: 'project' | 'month';
  basis: PriceBasis;
  summary: string;
  bestFor: string;
  includes: string[];
  /** Exclusions are business policy; leave empty until the owner confirms them. */
  excludes: string[];
  highlighted?: boolean;
}

export interface FaqItem extends OwnerReviewable {
  question: string;
  answer: string;
}

export interface NextStep extends OwnerReviewable {
  title: string;
  body: string;
}
