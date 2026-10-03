import { useEffect, useState } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { Background, Intro, ScrollProgressBar, type IntroPhase } from './components/Chrome';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WhySection } from './components/WhySection';
import { CapabilitiesShowcase } from './components/CapabilitiesShowcase';
import { ZoomSection } from './components/ZoomSection';
import { LifecycleSection } from './components/LifecycleSection';
import { CapabilityList } from './components/CapabilityList';
import { PricingSection } from './components/PricingSection';
import { Footer } from './components/Footer';
import { ProjectEstimatorModal } from './components/ProjectEstimatorModal';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function Site() {
  // Reduced motion skips the intro entirely.
  const [phase, setPhase] = useState<IntroPhase>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'idle',
  );
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const lenis = useLenis();

  // Intro timeline (lenis.dev): rise once fonts are ready (capped at 2.5s), hold, then lift.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    (async () => {
      await Promise.race([Promise.all([document.fonts.ready, wait(400)]), wait(2500)]);
      if (cancelled) return;
      setPhase('in');
      await wait(1500);
      if (!cancelled) setPhase('out');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loaded = phase === 'out' || phase === 'done';

  useEffect(() => {
    if (!lenis) return;
    if (loaded) lenis.start();
    else lenis.stop();
  }, [lenis, loaded]);

  const openEstimator = () => setEstimatorOpen(true);

  return (
    <div data-theme="light" className={`flex min-h-screen flex-col ${loaded ? 'is-loaded' : ''}`}>
      <Intro phase={phase} onDone={() => setPhase('done')} />
      <ScrollProgressBar />
      <Background />
      <Header onOpenEstimator={openEstimator} />

      <main className="relative z-1 grow">
        <Hero onOpenEstimator={openEstimator} />
        <WhySection />
        <CapabilitiesShowcase onOpenEstimator={openEstimator} />
        <ZoomSection />
        <LifecycleSection onOpenEstimator={openEstimator} />
        <CapabilityList />
        <PricingSection onOpenEstimator={openEstimator} />
      </main>

      <Footer onOpenEstimator={openEstimator} />
      <ProjectEstimatorModal isOpen={estimatorOpen} onClose={() => setEstimatorOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <ReactLenis root options={{ lerp: 0.1, anchors: true }}>
      <Site />
    </ReactLenis>
  );
}

export default App;
