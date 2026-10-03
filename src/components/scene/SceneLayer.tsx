import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { onIdle } from '../../lib/idle';
import { sceneSupport } from '../../lib/sceneSupport';

const StatueScene = lazy(() => import('./StatueScene'));

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Optional decorative 3D layer. Loads only after the page is interactive and only
 * when the device and user preferences allow it; otherwise the hero keeps its static
 * image. `html.has-scene` lets dark sections reveal the scene behind them.
 */
export function SceneLayer() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const support = sceneSupport();
    document.documentElement.dataset.sceneSupport = support.ok ? 'yes' : support.reason;
    if (!support.ok) return;
    return onIdle(() => setEnabled(true), 2500);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('has-scene', ready);
    return () => document.documentElement.classList.remove('has-scene');
  }, [ready]);

  if (!enabled) return null;

  const fail = () => {
    setReady(false);
    setEnabled(false);
    document.documentElement.dataset.sceneSupport = 'failed';
  };

  return (
    <div aria-hidden="true" className="scene-layer">
      <SceneBoundary onError={fail}>
        <Suspense fallback={null}>
          <StatueScene onReady={() => setReady(true)} onFailure={fail} />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
