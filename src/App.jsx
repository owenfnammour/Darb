import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RidesProvider, ViewerProvider } from './state/Providers.jsx'
import Home from './pages/Home.jsx'
import RidePage from './pages/RidePage.jsx'
import DriverPage from './pages/DriverPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ViewerProvider>
        <RidesProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ride/:id" element={<RidePage />} />
            <Route path="/driver/:id" element={<DriverPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RidesProvider>
      </ViewerProvider>
    </BrowserRouter>
  )
}
