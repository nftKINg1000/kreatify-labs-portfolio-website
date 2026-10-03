import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './fonts.css';
import './index.css';
import App from './App.tsx';
import { reportWebVitals } from './lib/vitals';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The build pre-renders the page into #root; hydrate it when present.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);

reportWebVitals();
