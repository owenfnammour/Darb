import PageShell from '../components/PageShell.jsx'
import { ErrorState } from '../components/PageStates.jsx'

// Also where links to surfaces nobody has built yet land
export default function NotFound() {
  return (
    <PageShell>
      <ErrorState title="Nothing here yet" text="This page does not exist, or has not been built yet." />
    </PageShell>
  )
}
