/** Run `callback` when the browser is idle (or after `timeout` ms). Returns a cancel function. */
export function onIdle(callback: () => void, timeout = 2500): () => void {
  const ric = (globalThis as { requestIdleCallback?: typeof requestIdleCallback }).requestIdleCallback;
  if (ric) {
    const handle = ric(callback, { timeout });
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, Math.min(timeout, 1500));
  return () => clearTimeout(handle);
}
