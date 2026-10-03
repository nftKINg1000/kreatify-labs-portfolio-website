/*
  KREATIFY wordmark and A symbol, path data copied from the owner-approved
  v1.2 vector set (primary-color.svg / wordmark-*.svg). Do not redraw, retype,
  re-space or recolour beyond the approved treatments below.
*/

const NAVY = '#0A1378';
const RED = '#A0030E';

const LETTERS = {
  K: 'M32.4 34.7H46.2V60L67.6 34.7H84.5L59.2 64.1L89.5 96.9H69.6L46.2 70.2V96.9H32.4V34.7Z',
  R: 'M85.5 34.7H107.8C121.1 34.7 128.2 41.5 128.2 53.4C128.2 62 124 67.5 115.6 70.4L137 96.9H118.7L99.2 71.9V96.9H85.5V34.7ZM99.2 46V61.8H104.7C110.5 61.8 113.6 59.1 113.6 53.8C113.6 48.5 110.5 46 104.7 46H99.2Z',
  E: 'M133.5 34.7H169.4V46.5H147.2V59.9H168.3V71.9H147.2V84.9H169.4V96.9H133.5V34.7Z',
  T: 'M241.2 34.7H298.1V96.9H284.1V46.6H269.3V96.9H255.5V46.6H241.2V34.7Z',
  F: 'M301.5 34.7H337.1V46.6H315.3V60H335.5V71.9H315.3V96.9H301.5V34.7Z',
  Y: 'M330.9 34.7H348.1L361.4 56.3L374.3 34.7H390.9L368.3 68.8V96.9H354.5V68.9L330.9 34.7Z',
};

const A_LEFT = 'M208 32.4 170.4 97.2 208 70.1V32.4Z';
const A_RIGHT = 'M208 32.4V70.1L245.7 97.2L208 32.4Z';
const A_SOLID = 'M208 32.4 170.4 97.2 208 70.1 245.7 97.2Z';

/** color = navy + two-colour A (light fields only); navy/white/black = approved single-colour silhouettes. */
export type LogoTreatment = 'color' | 'navy' | 'white' | 'black';

const FILL: Record<Exclude<LogoTreatment, 'color'>, string> = { navy: NAVY, white: '#FFFFFF', black: '#000000' };

interface WordmarkProps {
  treatment?: LogoTreatment;
  className?: string;
  title?: string;
  /** Hide from assistive technology when the name is already given as text nearby. */
  decorative?: boolean;
}

/** The visible artwork is cropped to its own bounds; give it ≥0.5H clear space in layout. */
export function Wordmark({ treatment = 'color', className = '', title = 'KreatifyLabs', decorative = false }: WordmarkProps) {
  const solid = treatment === 'color' ? NAVY : FILL[treatment];

  return (
    <svg
      viewBox="32.4 32.4 358.5 64.8"
      className={className}
      {...(decorative ? { 'aria-hidden': true, focusable: false } : { role: 'img', 'aria-label': title })}
    >
      <g>
        <path fill={solid} d={LETTERS.K} />
        <path fill={solid} fillRule="evenodd" d={LETTERS.R} />
        <path fill={solid} d={LETTERS.E} />
        {treatment === 'color' ? (
          <>
            <path fill={RED} d={A_LEFT} />
            <path fill={NAVY} d={A_RIGHT} />
          </>
        ) : (
          <path fill={solid} d={A_SOLID} />
        )}
        <path fill={solid} d={LETTERS.T} />
        <path fill={solid} d={LETTERS.F} />
        <path fill={solid} d={LETTERS.Y} />
      </g>
    </svg>
  );
}

/** The approved standalone A — the small-format signature. */
export function ASymbol({ treatment = 'color', className = '' }: { treatment?: LogoTreatment; className?: string }) {
  return (
    <svg viewBox="170.4 32.4 75.3 64.8" className={className} aria-hidden="true" focusable="false">
      {treatment === 'color' ? (
        <>
          <path fill={RED} d={A_LEFT} />
          <path fill={NAVY} d={A_RIGHT} />
        </>
      ) : (
        <path fill={FILL[treatment]} d={A_SOLID} />
      )}
    </svg>
  );
}
