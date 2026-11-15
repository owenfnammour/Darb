import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MyRidesTabs } from '../components/MyRidesTabs.jsx';
import { Button, PageHeading } from '../components/ui.jsx';

/** Route slots for the group's screens. Replace these elements during integration. */
export function IntegrationPage() {
  const { pathname } = useLocation();
  const riding = pathname === '/my-rides/riding';
  const signIn = pathname === '/sign-in';
  const title = riding ? 'My rides' : signIn ? 'Sign in' : 'Find a ride';
  useEffect(() => { document.title = `${title} — Darb`; }, [title]);
  return <>
    <PageHeading>{title}</PageHeading>
    {riding && <MyRidesTabs />}
    <div className="mt-6 max-w-lg rounded-card border border-line bg-surface p-6">
      <p className="font-display text-lg font-semibold text-brand-900">Coming soon</p>
      <p className="mt-2 text-sm text-muted">{riding ? 'Your riding dashboard' : signIn ? 'University account sign-in' : 'Campus ride search'} will be available here.</p>
      <Button to="/my-rides/driving" variant="secondary" className="mt-5">Go to Driving</Button>
    </div>
  </>;
}

export function NotFoundPage() {
  return <><PageHeading>We could not find that page</PageHeading><Button to="/my-rides/driving" className="mt-6">Back to my rides</Button></>;
}
