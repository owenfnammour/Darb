import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { appRoutes } from './App.jsx';
import { RidesProvider } from './state/RidesContext.jsx';
import './styles/app.css';

const router = createBrowserRouter(appRoutes);

createRoot(document.getElementById('root')).render(
  <StrictMode><RidesProvider><RouterProvider router={router} /></RidesProvider></StrictMode>,
);
