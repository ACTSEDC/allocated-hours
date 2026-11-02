import { Search } from 'lucide-react';

export default function Navbar({ pageTitle, enrollment, isLoading, onEnrollmentChange, onSubmit }) {
  return (
    <header className="navbar">
      <div>
        <p className="navbar-label">Allocated Hours</p>
        <h1>{pageTitle}</h1>
      </div>
      <form className="navbar-search" onSubmit={onSubmit}>
        <label htmlFor="enrollment">Enrollment number</label>
        <input
          id="enrollment"
          type="search"
          value={enrollment}
          onChange={(event) => onEnrollmentChange(event.target.value)}
          placeholder="Search enrollment..."
          autoComplete="off"
        />
        <button type="submit" disabled={isLoading} aria-label="Search">
          <Search size={16} />
        </button>
      </form>
    </header>
  );
}
