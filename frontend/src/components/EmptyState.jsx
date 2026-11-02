import { User } from 'lucide-react';

export default function EmptyState({ error }) {
  return (
    <section className="empty-panel">
      <User size={28} />
      <h2>Search for a student</h2>
      <p>Enter an enrollment number above to load their allocated hour records.</p>
      {error && <p className="message error">{error}</p>}
    </section>
  );
}
