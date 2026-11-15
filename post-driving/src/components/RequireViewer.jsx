import { useRides } from '../state/RidesContext.jsx';
import { Button, PageHeading } from './ui.jsx';

export function RequireViewer({ children }) {
  const { viewer } = useRides();
  if (viewer) return children;
  return <div className="max-w-lg">
    <PageHeading>Sign in to manage your rides</PageHeading>
    <p className="mt-3 text-sm text-muted">Use your university account to post a trip and review your requests.</p>
    <Button to="/sign-in" className="mt-6">Sign in</Button>
  </div>;
}
