import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from './router';

/**
 * App wired to an in-memory router. Used by tests (and any embedding host) that
 * need the full route tree without a browser history. `main.tsx` uses the
 * browser router directly.
 */
export function App({ initialEntries = ['/'] }: { initialEntries?: string[] }) {
  const router = createMemoryRouter(routes, { initialEntries });
  return <RouterProvider router={router} />;
}
