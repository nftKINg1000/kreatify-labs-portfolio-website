import type { MouseEvent, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface CtaButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Destination; also the no-JavaScript fallback when `onClick` is given. */
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  variant?: 'primary' | 'secondary';
}

/** Call-to-action: boxed icon plus a label that rolls on hover. Renders a link when given `href`. */
export function CtaButton({ children, icon = <ArrowRight strokeWidth={1.75} />, className = '', href, onClick, variant = 'primary' }: CtaButtonProps) {
  const content = (
    <>
      <span className="cta-button-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="cta-button-label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </>
  );
  const classes = `cta cta-button ${variant === 'secondary' ? 'cta-button--secondary' : ''} ${className}`;

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
      >
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
