import React from 'react'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from "react-helmet-async";

import NotFound from './Components/NotFound'
import Login from './Components/Login'
import Signup from './Components/Signup'
import Loading from './Components/Loading'
import AuthProvider from "./Context/AuthContext";
import ThemeProvider from "./Context/ThemeContext";
import PrivateRoute from "./Components/PrivateRoute";
import BusinessProfile from './Pages/BusinessProfile'
import BusinessDetail from './Pages/BusinessDetail'
import NewEntry from './Category/Share_Market/NewEntry';
import MyTrades from './Category/Share_Market/MyTrades'
import Portfolio from './Category/Share_Market/Portfolio'
import Layout from './Components/Layout'
import Home from './Components/Home'


const Dashboard = lazy(() => import('./Pages/Dashboard'))
const Inventory = lazy(() => import('./Pages/Inventory'))
const Billing = lazy(() => import('./Pages/Billing'))
const Orders = lazy(() => import('./Pages/Orders'))
const Report = lazy(() => import('./Pages/Report'))
const Settings = lazy(() => import('./Pages/Settings'))

//    https://mims-backend-x0i3.onrender.com
//    https://mims-backend-x0i3.onrender.com


function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <AuthProvider>
              <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  {/* <Route path='*' element={<NotFound />} /> */}
                  <Route path="/main" element={<Layout />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path='inventory' element={<Inventory />} />
                  <Route path='billing' element={<Billing />} />
                  <Route path='orders' element={<Orders />} />
                  {/* <Route path='report' element={<Report />} /> */}
                  <Route path="settings" element={<Settings />} />
                  <Route path='business-profile' element={<BusinessProfile />} />
                  <Route path='business-detail' element={<BusinessDetail />} />
                  <Route path='/loading' element={<Loading />} />
                  {/* Dynamic Entry Management */}
                  <Route path='new-entry' element={<NewEntry />} />
                  <Route path='my-trades' element={<MyTrades />} />
                  <Route path='portfolio' element={<Portfolio />} />
                </Route>

                <Route path="/" element={<Home />} />
              </Routes>
            </AuthProvider>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App