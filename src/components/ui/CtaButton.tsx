import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

type CtaButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
} & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

/** The lenis.dev call-to-action: pink pill with a boxed icon and a rolling label on hover. */
export function CtaButton({ children, icon = <ArrowRight strokeWidth={1.5} />, className = '', href, onClick }: CtaButtonProps) {
  const content = (
    <>
      <span className="cta-button-icon">{icon}</span>
      <span className="cta-button-label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </>
  );

  const classes = `cta cta-button ${className}`;

  if (href) {
    const external = href.startsWith('http');
    return (
      <a href={href} className={classes} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
