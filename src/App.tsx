import { lazy, Suspense, useCallback, useEffect, useState, type MouseEvent } from 'react';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { SceneLayer } from './components/scene/SceneLayer';
import { Approach } from './components/sections/Approach';
import { Audience } from './components/sections/Audience';
import { Capabilities } from './components/sections/Capabilities';
import { Contact } from './components/sections/Contact';
import { Faq } from './components/sections/Faq';
import { Hero } from './components/sections/Hero';
import { Pricing } from './components/sections/Pricing';
import { Proof } from './components/sections/Proof';
import { Signature } from './components/sections/Signature';
import { track } from './lib/analytics';
import { onIdle } from './lib/idle';
import { LeadContext, type OpenLead } from './lib/leadContext';

const loadLeadDialog = () => import('./components/lead/LeadDialog');
const LeadDialog = lazy(loadLeadDialog);
const SECTIONS = [Hero, Audience, Capabilities, Proof, Approach, Signature, Pricing, Faq, Contact];

export function App() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadMounted, setLeadMounted] = useState(false);

  // Warm the form chunk once the page is idle so the first open is instant.
  useEffect(() => onIdle(() => void loadLeadDialog(), 4000), []);

  const openLead = useCallback<OpenLead>(
    (source) => (event?: MouseEvent<HTMLElement>) => {
      event?.preventDefault();
      track({ name: 'form_opened', source });
      setLeadMounted(true);
      setLeadOpen(true);
    },
    [],
  );

  return (
    <LeadContext.Provider value={openLead}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SceneLayer />
      <Header />
      <main id="main" tabIndex={-1}>
        {/* Each boundary hydrates as its own interruptible task, keeping long tasks (TBT/INP) short. */}
        {SECTIONS.map((Section, index) => (
          <Suspense key={index} fallback={null}>
            <Section />
          </Suspense>
        ))}
      </main>
      <Footer />
      {leadMounted && (
        <Suspense fallback={null}>
          <LeadDialog open={leadOpen} onClose={() => setLeadOpen(false)} />
        </Suspense>
      )}
    </LeadContext.Provider>
  );
}

export default App;
