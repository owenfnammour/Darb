import { useSearchParams } from 'react-router-dom'
import { useViewer } from '../state/context.js'
import { users, viewerChoices } from '../data/rides.js'

// Demo helper: until the sign-in page exists, this picks who is looking at the app, so the driver,
// rider and signed-out versions of a page can all be checked. Shown in dev, and in a built version
// when the address has ?demo (for example /ride/1?demo); it then stays on for the browser session.
function demoOn(params) {
  try {
    if (params.has('demo')) sessionStorage.setItem('darb-demo', '1')
    return sessionStorage.getItem('darb-demo') === '1'
  } catch {
    return params.has('demo')
  }
}

export default function DemoViewerSwitch() {
  const { viewer, setViewerId } = useViewer()
  const [params] = useSearchParams()
  if (!import.meta.env.DEV && !demoOn(params)) return null

  return (
    <label className="fixed bottom-3 right-3 z-40 flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2 text-xs text-muted shadow-sm">
      Viewing as
      <select
        className="rounded-md border border-line bg-paper px-2 py-1 text-ink"
        value={viewer ? viewer.id : ''}
        onChange={(e) => setViewerId(e.target.value || null)}
      >
        {viewerChoices.map((id) => (
          <option key={id ?? 'out'} value={id ?? ''}>{id ? users[id].name : 'Signed out'}</option>
        ))}
      </select>
    </label>
  )
}
