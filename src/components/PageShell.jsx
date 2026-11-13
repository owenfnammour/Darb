import Header from './Header.jsx'
import Footer from './Footer.jsx'
import DemoViewerSwitch from './DemoViewerSwitch.jsx'
import { useViewer } from '../state/context.js'

// Header and footer around a page. Pages only provide what goes in <main>.
export default function PageShell({ active, children }) {
  const { viewer } = useViewer()

  return (
    <>
      <Header active={active} initials={viewer ? viewer.initials : ''} />
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      <Footer />
      <DemoViewerSwitch />
    </>
  )
}
