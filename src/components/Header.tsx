import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Explore', end: true },
  { to: '/exercises', label: 'Exercises', end: false },
  { to: '/planner', label: 'Planner', end: false },
];

export function Header() {
  return (
    <header className="app-header">
      <div className="app-brand">
        Exo<span>View</span>
      </div>
      <nav className="app-nav" aria-label="Primary">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
