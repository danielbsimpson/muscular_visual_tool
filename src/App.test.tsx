import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the brand and primary navigation', () => {
    render(<App />);
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
  });

  it('renders the Explore view at the index route', () => {
    render(<App initialEntries={['/']} />);
    expect(screen.getByRole('heading', { name: /explore/i })).toBeInTheDocument();
  });

  it('renders the Planner view at /planner', () => {
    render(<App initialEntries={['/planner']} />);
    expect(screen.getByRole('heading', { name: /weekly planner/i })).toBeInTheDocument();
  });
});
