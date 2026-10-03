import { useCallback } from 'react';
import { Dialog } from '../ui/Dialog';
import { LeadForm } from './LeadForm';

interface LeadDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Lazy-loaded with the form so the initial page stays light. */
export default function LeadDialog({ open, onClose }: LeadDialogProps) {
  const firstField = useCallback(() => document.querySelector<HTMLElement>('.lead-form input:not([tabindex="-1"])'), []);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Discuss your product"
      description="Tell us what you are building. It takes about two minutes."
      initialFocus={firstField}
      className="lead-dialog"
    >
      <LeadForm onDone={onClose} />
    </Dialog>
  );
}
