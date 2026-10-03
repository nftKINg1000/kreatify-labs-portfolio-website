/** Development-only marker for content awaiting owner confirmation (never shipped to production). */
export function OwnerBadge({ note }: { note?: string }) {
  if (!note || !import.meta.env.DEV) return null;
  return <span className="owner-badge">Owner input required: {note}</span>;
}
