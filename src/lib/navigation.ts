/**
 * Scroll to an in-page target, update the URL hash and move focus to the target
 * (sections carry tabIndex=-1) so keyboard and screen-reader users land there too.
 * Native anchors still work without JavaScript; this is used where we must
 * intercept a click (e.g. links inside the modal mobile menu).
 */
export function navigateToHash(href: string): void {
  const id = href.replace(/^#/, '');
  const target = id === 'top' ? document.body : document.getElementById(id);
  if (!target) return;
  if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (id === 'top') window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (target !== document.body) target.focus({ preventScroll: true });
}
