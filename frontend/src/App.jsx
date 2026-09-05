import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import Incidents from './pages/Incidents'
import ApplicationDetails from './pages/ApplicationDetails'
import DependencyDetails from './pages/DependencyDetails'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/applications" element={<Applications />} />
                        <Route
                            path="/applications/:applicationId"
                            element={<ApplicationDetails />}
                        />
                        <Route
                            path="/applications/:applicationId/dependencies/:dependencyId"
                            element={<DependencyDetails />}
                        />
                        <Route path="/incidents" element={<Incidents />} />
                    </Route>
                </Route>
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    )


}

export default App
