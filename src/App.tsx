import { useEffect, useState } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { Background, Loader, ScrollProgressBar } from './components/Chrome';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WhySection } from './components/WhySection';
import { WorkShowcase } from './components/WorkShowcase';
import { ZoomSection } from './components/ZoomSection';
import { CraftSection } from './components/CraftSection';
import { TemplatesShowcase } from './components/TemplatesShowcase';
import { PricingSection } from './components/PricingSection';
import { Footer } from './components/Footer';
import { ProjectEstimatorModal } from './components/ProjectEstimatorModal';

function Site() {
  const [loaded, setLoaded] = useState(false);
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const lenis = useLenis();

  // Hold the curtain until the display fonts are in (so nothing reflows under it),
  // but never longer than 2.5s — a slow font must not leave visitors stuck on pink.
  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    Promise.race([Promise.all([document.fonts.ready, wait(900)]), wait(2500)]).then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (loaded) lenis.start();
    else lenis.stop();
  }, [lenis, loaded]);

  const openEstimator = () => setEstimatorOpen(true);

  return (
    <div data-theme="dark" className={`flex min-h-screen flex-col ${loaded ? 'is-loaded' : ''}`}>
      <Loader loaded={loaded} />
      <ScrollProgressBar />
      <Background />
      <Header onOpenEstimator={openEstimator} />

      <main className="relative z-1 grow">
        <Hero onOpenEstimator={openEstimator} />
        <WhySection />
        <WorkShowcase onOpenEstimator={openEstimator} />
        <ZoomSection />
        <CraftSection onOpenEstimator={openEstimator} />
        <TemplatesShowcase />
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
