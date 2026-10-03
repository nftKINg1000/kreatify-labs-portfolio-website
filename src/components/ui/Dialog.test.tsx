import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Example dialog" description="Explains the dialog">
        <button>First action</button>
        <button>Last action</button>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('is labelled and described, focuses its heading, and returns focus to the invoker on close', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const invoker = screen.getByRole('button', { name: 'Open dialog' });
    await user.click(invoker);

    const dialog = screen.getByRole('dialog', { name: 'Example dialog' });
    expect(dialog).toHaveAccessibleDescription('Explains the dialog');
    expect(screen.getByRole('heading', { name: 'Example dialog' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog).not.toHaveAttribute('open');
    expect(invoker).toHaveFocus();
  });

  it('closes on Escape (cancel event) and wraps Tab focus inside', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    const dialog = screen.getByRole('dialog');

    screen.getByRole('button', { name: 'Last action' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    act(() => {
      fireEvent(dialog, new Event('cancel', { cancelable: true }));
    });
    expect(dialog).not.toHaveAttribute('open');
    expect(screen.getByRole('button', { name: 'Open dialog' })).toHaveFocus();
  });
});
