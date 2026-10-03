import { createContext, useContext, type MouseEvent } from 'react';

/** Opens the enquiry dialog. Links keep `href="#contact"` as the no-JavaScript fallback. */
export type OpenLead = (source: string) => (event?: MouseEvent<HTMLElement>) => void;

export const LeadContext = createContext<OpenLead>(() => () => {});
export const useOpenLead = () => useContext(LeadContext);
