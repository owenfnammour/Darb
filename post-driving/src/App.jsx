import { Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout.jsx';
import { DrivingPage } from './pages/DrivingPage.jsx';
import { IntegrationPage, NotFoundPage } from './pages/IntegrationPage.jsx';
import { OwnerRidePage } from './pages/OwnerRidePage.jsx';
import { PostRidePage } from './pages/PostRidePage.jsx';

/** Exported so the group can merge these routes into its existing data router. */
export const appRoutes = [{
  element: <AppLayout />,
  children: [
    { path: '/', element: <Navigate to="/my-rides/driving" replace /> },
    { path: '/post', element: <PostRidePage /> },
    { path: '/my-rides/driving', element: <DrivingPage /> },
    { path: '/rides/:rideId/edit', element: <PostRidePage /> },
    { path: '/rides/:rideId', element: <OwnerRidePage /> },
    ...['/rides', '/my-rides/riding', '/sign-in'].map(path => ({ path, element: <IntegrationPage /> })),
    { path: '*', element: <NotFoundPage /> },
  ],
}];
