import { createBrowserRouter, RouterProvider, Navigate, Route, Routes } from 'react-router-dom'
import { RidesProvider, ViewerProvider } from './state/Providers.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import RidePage from './pages/RidePage.jsx'
import DriverPage from './pages/DriverPage.jsx'
import NotFound from './pages/NotFound.jsx'
import SignIn from './pages/SignIn.jsx'
import Register from './pages/Register.jsx'
import MyRidesRiding from './pages/MyRidesRiding.jsx'
import MyRidesDriving from './pages/MyRidesDriving.jsx'
import PostRidePage from './pages/PostRidePage.jsx'

function AppRoutes() {
  return (
    <>
      <AuthProvider>
        <ViewerProvider>
          <RidesProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/ride/:id" element={<RidePage />} />
              <Route path="/driver/:id" element={<DriverPage />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
              <Route path="/post" element={<PostRidePage />} />
              <Route path="/ride/:id/edit" element={<PostRidePage />} />
              <Route path="/my-rides/driving" element={<MyRidesDriving />} />
              <Route path="/my-rides" element={<Navigate to="/my-rides/riding" replace />} />
              <Route path="/my-rides/riding" element={<MyRidesRiding />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RidesProvider>
        </ViewerProvider>
      </AuthProvider>
    </>
  )
}

// A single data-router context enables the Post form's required navigation blocker.
// Existing route elements and provider ordering are retained.
const router = createBrowserRouter([{ path: '*', element: <AppRoutes /> }], { basename: import.meta.env.BASE_URL })
export default function App() { return <RouterProvider router={router} /> }
