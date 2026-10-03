/** Why the optional 3D scene is skipped (useful for tests and debugging). */
export type SceneSkipReason = 'server' | 'reduced-motion' | 'save-data' | 'small-viewport' | 'low-power' | 'no-webgl' | 'disabled';

interface NavigatorHints {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

/**
 * Decide whether to load the 3D scene. It is decorative, so we skip it whenever it
 * could cost the visitor comfort, data or performance.
 */
export function sceneSupport(): { ok: true } | { ok: false; reason: SceneSkipReason } {
  if (typeof window === 'undefined') return { ok: false, reason: 'server' };
  if (new URLSearchParams(location.search).has('no3d')) return { ok: false, reason: 'disabled' };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return { ok: false, reason: 'reduced-motion' };

  const nav = navigator as Navigator & NavigatorHints;
  if (nav.connection?.saveData) return { ok: false, reason: 'save-data' };
  if (!matchMedia('(min-width: 1024px)').matches) return { ok: false, reason: 'small-viewport' };
  if ((nav.deviceMemory ?? 8) < 4 || (navigator.hardwareConcurrency ?? 8) < 4) return { ok: false, reason: 'low-power' };

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return { ok: false, reason: 'no-webgl' };
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return { ok: false, reason: 'no-webgl' };
  }
  return { ok: true };
}
