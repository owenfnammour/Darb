import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RidesProvider, ViewerProvider } from './state/Providers.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import Home from './pages/Home.jsx'
import RidePage from './pages/RidePage.jsx'
import DriverPage from './pages/DriverPage.jsx'
import NotFound from './pages/NotFound.jsx'
import SignIn from './pages/SignIn.jsx'
import Register from './pages/Register.jsx'
import MyRidesRiding from './pages/MyRidesRiding.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ViewerProvider>
          <RidesProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ride/:id" element={<RidePage />} />
              <Route path="/driver/:id" element={<DriverPage />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
              {/* Until the Driving tab exists, "My rides" opens Riding */}
              <Route path="/my-rides" element={<Navigate to="/my-rides/riding" replace />} />
              <Route path="/my-rides/riding" element={<MyRidesRiding />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RidesProvider>
        </ViewerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
