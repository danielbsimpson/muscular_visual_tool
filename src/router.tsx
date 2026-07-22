import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components';
import { ExploreView } from './features/explore';
import { ExercisesView } from './features/exercises';
import { PlannerView } from './features/planner';

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ExploreView /> },
      { path: 'exercises', element: <ExercisesView /> },
      { path: 'exercises/:exerciseId', element: <ExercisesView /> },
      { path: 'planner', element: <PlannerView /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
