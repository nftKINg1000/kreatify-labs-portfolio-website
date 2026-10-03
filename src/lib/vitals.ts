/*
  Field Web Vitals (LCP, INP, CLS, FCP, TTFB) via the web-vitals library, loaded
  after the page is idle. Reports carry only metric name/value/rating/id and the
  page path — no personal data. No endpoint configured → dropped (logged in dev).
*/
import { CONFIG } from '../config';
import { onIdle } from './idle';

export function reportWebVitals(): void {
  if (typeof window === 'undefined') return;
  const start = () =>
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const send = (metric: { name: string; value: number; rating: string; id: string }) => {
        const payload = {
          name: metric.name,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          rating: metric.rating,
          id: metric.id,
          path: location.pathname,
        };
        if (import.meta.env.DEV) console.debug('[vitals]', payload);
        if (CONFIG.vitalsEndpoint) navigator.sendBeacon?.(CONFIG.vitalsEndpoint, JSON.stringify(payload));
      };
      onCLS(send);
      onINP(send);
      onLCP(send);
      onFCP(send);
      onTTFB(send);
    });
  onIdle(() => void start(), 4000);
}
