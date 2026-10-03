import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

/** Build-time pre-render of the single marketing page (see scripts/prerender.mjs). */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
